import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createErrorPayload: vi.fn(async (code: string) => ({
    code,
    message: code,
  })),
  localizeFieldErrors: vi.fn(async (errors: object) => errors),
  logServerError: vi.fn(),
  requireUser: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/i18n/navigation", () => ({
  getPathname: vi.fn(({ href }: { href: string }) => href),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: mocks.requireUser,
}));
vi.mock("@/lib/errors/localize", () => ({
  createErrorPayload: mocks.createErrorPayload,
  localizeFieldErrors: mocks.localizeFieldErrors,
}));
vi.mock("@/lib/log-server-error", () => ({
  logServerError: mocks.logServerError,
}));

import {
  deleteVocabularyCard,
  saveVocabularyCard,
  type SaveVocabularyCardState,
  updateVocabularyCard,
  type UpdateVocabularyCardState,
} from "@/features/vocabulary/actions";

const documentId = "10000000-0000-4000-8000-000000000001";
const userId = "20000000-0000-4000-8000-000000000001";
const idleState: SaveVocabularyCardState = { revision: 0, status: "idle" };

function createFormData() {
  const formData = new FormData();
  formData.set("meanings", "context, setting");
  formData.set("usageContext", "Context helps.");
  formData.set("note", "Remember this");
  formData.set("imageUrl", "https://example.com/context.jpg");
  return formData;
}

function chainResult<T>(result: T) {
  const chain = {
    eq: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => result),
    select: vi.fn(() => chain),
    single: vi.fn(async () => result),
  };
  return chain;
}

function createSupabase(
  existing: null | { id: string },
  rpcError: null | { code: string } = null,
  content = "Context helps.",
) {
  const source = chainResult({
    data: {
      content,
      source_language: "en",
      target_language: "es",
    },
    error: null,
  });
  const read = chainResult({ data: existing, error: null });
  const saved = {
    image_url: "https://example.com/context.jpg",
    note: "Remember this",
    translation: ["context", "setting"],
    usage_context: "Context helps.",
    word: "context",
  };
  const vocabulary = {
    select: vi.fn(() => read),
  };
  const supabase = {
    from: vi.fn((table: string) =>
      table === "documents" ? source : vocabulary,
    ),
    rpc: vi.fn(async () => ({
      data: rpcError ? null : saved,
      error: rpcError,
    })),
  };

  return { supabase };
}

describe("saveVocabularyCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a card from a server-resolved word token and language pair", async () => {
    const { supabase } = createSupabase(null);
    mocks.requireUser.mockResolvedValue({ supabase, userId });

    const result = await saveVocabularyCard(
      "en",
      { id: documentId, kind: "document" },
      "paragraph-0-sentence-0-token-0",
      [],
      idleState,
      createFormData(),
    );

    expect(result.status).toBe("success");
    if (result.status === "success") expect(result.outcome).toBe("created");
    expect(supabase.rpc).toHaveBeenCalledWith("save_vocabulary_card", {
      input_image_url: "https://example.com/context.jpg",
      input_note: "Remember this",
      input_previous_translation: [],
      input_source_language: "en",
      input_target_language: "es",
      input_translation: ["context", "setting"],
      input_usage_context: "Context helps.",
      input_word: "context",
    });
  });

  it("updates an existing card through the atomic database function", async () => {
    const { supabase } = createSupabase({
      id: "30000000-0000-4000-8000-000000000001",
    });
    mocks.requireUser.mockResolvedValue({ supabase, userId });

    const result = await saveVocabularyCard(
      "en",
      { id: documentId, kind: "document" },
      "paragraph-0-sentence-0-token-0",
      ["Contexto"],
      idleState,
      createFormData(),
    );

    expect(result.status).toBe("success");
    if (result.status === "success") expect(result.outcome).toBe("updated");
    expect(supabase.rpc).toHaveBeenCalledWith(
      "save_vocabulary_card",
      expect.objectContaining({
        input_previous_translation: ["Contexto"],
      }),
    );
  });

  it("sends explicit nulls when optional details are cleared", async () => {
    const { supabase } = createSupabase({
      id: "30000000-0000-4000-8000-000000000001",
    });
    mocks.requireUser.mockResolvedValue({ supabase, userId });
    const formData = createFormData();
    formData.set("imageUrl", "");
    formData.set("note", "");
    formData.set("usageContext", "");

    await saveVocabularyCard(
      "en",
      { id: documentId, kind: "document" },
      "paragraph-0-sentence-0-token-0",
      ["Contexto"],
      idleState,
      formData,
    );

    expect(supabase.rpc).toHaveBeenCalledWith(
      "save_vocabulary_card",
      expect.objectContaining({
        input_image_url: null,
        input_note: null,
        input_usage_context: null,
      }),
    );
  });

  it("bounds a server-derived context to the form limit", async () => {
    const longSentence = `Context ${"x".repeat(2_100)}`;
    const { supabase } = createSupabase(null, null, longSentence);
    mocks.requireUser.mockResolvedValue({ supabase, userId });
    const formData = createFormData();
    formData.set("usageContext", "");

    await saveVocabularyCard(
      "en",
      { id: documentId, kind: "document" },
      "paragraph-0-sentence-0-token-0",
      [],
      idleState,
      formData,
    );

    expect(supabase.rpc).toHaveBeenCalledWith(
      "save_vocabulary_card",
      expect.objectContaining({
        input_usage_context: longSentence.slice(0, 2_000),
      }),
    );
  });

  it("rejects a token that is not a word in the stored document", async () => {
    const { supabase } = createSupabase(null);
    mocks.requireUser.mockResolvedValue({ supabase, userId });

    const result = await saveVocabularyCard(
      "en",
      { id: documentId, kind: "document" },
      "paragraph-0-sentence-0-token-1",
      [],
      idleState,
      createFormData(),
    );

    expect(result).toMatchObject({
      error: { code: "vocabulary.save_failed" },
      status: "error",
    });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("returns a meanings error when an atomic merge exceeds the limit", async () => {
    const { supabase } = createSupabase(
      { id: "30000000-0000-4000-8000-000000000001" },
      { code: "23514" },
    );
    mocks.requireUser.mockResolvedValue({ supabase, userId });

    const result = await saveVocabularyCard(
      "en",
      { id: documentId, kind: "document" },
      "paragraph-0-sentence-0-token-0",
      ["Contexto"],
      idleState,
      createFormData(),
    );

    expect(result).toMatchObject({
      error: { code: "validation.form_invalid" },
      fieldErrors: {
        meanings: { code: "validation.vocabulary.meanings.invalid" },
      },
      status: "error",
    });
  });
});

function mutationQuery(
  result: Readonly<{ data: object | null; error: object | null }>,
) {
  const query = {
    delete: vi.fn(() => query),
    eq: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
    select: vi.fn(() => query),
    update: vi.fn(() => query),
  };
  return query;
}

describe("dashboard vocabulary actions", () => {
  const cardId = "30000000-0000-4000-8000-000000000001";
  const updateIdle: UpdateVocabularyCardState = {
    revision: 0,
    status: "idle",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates editable fields while scoping the mutation to the owner", async () => {
    const query = mutationQuery({ data: { id: cardId }, error: null });
    mocks.requireUser.mockResolvedValue({
      supabase: { from: vi.fn(() => query) },
      userId,
    });

    await expect(
      updateVocabularyCard("en", cardId, updateIdle, createFormData()),
    ).resolves.toEqual({ revision: 1, status: "success" });
    expect(query.update).toHaveBeenCalledWith({
      image_url: "https://example.com/context.jpg",
      note: "Remember this",
      translation: ["context", "setting"],
      usage_context: "Context helps.",
    });
    expect(query.eq).toHaveBeenCalledWith("id", cardId);
    expect(query.eq).toHaveBeenCalledWith("user_id", userId);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/vocabulary");
  });

  it("does not issue an update for an invalid card id", async () => {
    const supabase = { from: vi.fn() };
    mocks.requireUser.mockResolvedValue({ supabase, userId });

    await expect(
      updateVocabularyCard("en", "not-a-card", updateIdle, createFormData()),
    ).resolves.toMatchObject({
      error: { code: "vocabulary.update_failed" },
      status: "error",
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("deletes only a card owned by the current user", async () => {
    const query = mutationQuery({ data: { id: cardId }, error: null });
    mocks.requireUser.mockResolvedValue({
      supabase: { from: vi.fn(() => query) },
      userId,
    });

    await expect(
      deleteVocabularyCard("en", cardId, { status: "idle" }, new FormData()),
    ).resolves.toEqual({ status: "success" });
    expect(query.eq).toHaveBeenCalledWith("id", cardId);
    expect(query.eq).toHaveBeenCalledWith("user_id", userId);
  });

  it("reports a delete failure when no owned card matches", async () => {
    const query = mutationQuery({ data: null, error: null });
    mocks.requireUser.mockResolvedValue({
      supabase: { from: vi.fn(() => query) },
      userId,
    });

    await expect(
      deleteVocabularyCard("en", cardId, { status: "idle" }, new FormData()),
    ).resolves.toMatchObject({
      error: { code: "vocabulary.delete_failed" },
      status: "error",
    });
    expect(mocks.logServerError).toHaveBeenCalled();
  });
});
