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
  saveVocabularyCard,
  type SaveVocabularyCardState,
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
  existing: null | {
    id: string;
    image_url: string | null;
    note: string | null;
    translation: string[];
    usage_context: string | null;
  },
) {
  const source = chainResult({
    data: {
      content: "Context helps.",
      source_language: "en",
      target_language: "es",
    },
    error: null,
  });
  const read = chainResult({ data: existing, error: null });
  const saved = {
    image_url: "https://example.com/context.jpg",
    note: "Remember this",
    translation: existing
      ? ["Contexto", "context", "setting"]
      : ["context", "setting"],
    usage_context: "Context helps.",
    word: "context",
  };
  const write = chainResult({ data: saved, error: null });
  const vocabulary = {
    insert: vi.fn(() => write),
    select: vi.fn(() => read),
    update: vi.fn(() => write),
  };
  const supabase = {
    from: vi.fn((table: string) =>
      table === "documents" ? source : vocabulary,
    ),
  };

  return { supabase, vocabulary };
}

describe("saveVocabularyCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a card from a server-resolved word token and language pair", async () => {
    const { supabase, vocabulary } = createSupabase(null);
    mocks.requireUser.mockResolvedValue({ supabase, userId });

    const result = await saveVocabularyCard(
      "en",
      { id: documentId, kind: "document" },
      "paragraph-0-sentence-0-token-0",
      idleState,
      createFormData(),
    );

    expect(result.status).toBe("success");
    if (result.status === "success") expect(result.outcome).toBe("created");
    expect(vocabulary.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        source_language: "en",
        target_language: "es",
        user_id: userId,
        word: "context",
      }),
    );
  });

  it("merges meanings into an existing card without duplicates", async () => {
    const { supabase, vocabulary } = createSupabase({
      id: "30000000-0000-4000-8000-000000000001",
      image_url: null,
      note: null,
      translation: ["Contexto"],
      usage_context: null,
    });
    mocks.requireUser.mockResolvedValue({ supabase, userId });

    const result = await saveVocabularyCard(
      "en",
      { id: documentId, kind: "document" },
      "paragraph-0-sentence-0-token-0",
      idleState,
      createFormData(),
    );

    expect(result.status).toBe("success");
    if (result.status === "success") expect(result.outcome).toBe("updated");
    expect(vocabulary.update).toHaveBeenCalledWith(
      expect.objectContaining({
        translation: ["Contexto", "context", "setting"],
      }),
    );
  });

  it("rejects a token that is not a word in the stored document", async () => {
    const { supabase, vocabulary } = createSupabase(null);
    mocks.requireUser.mockResolvedValue({ supabase, userId });

    const result = await saveVocabularyCard(
      "en",
      { id: documentId, kind: "document" },
      "paragraph-0-sentence-0-token-1",
      idleState,
      createFormData(),
    );

    expect(result).toMatchObject({
      error: { code: "vocabulary.save_failed" },
      status: "error",
    });
    expect(vocabulary.insert).not.toHaveBeenCalled();
  });
});
