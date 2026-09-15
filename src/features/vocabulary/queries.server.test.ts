import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getAuthContext: vi.fn(),
  logServerError: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock("@/lib/auth/require-user", () => ({
  getAuthContext: mocks.getAuthContext,
  requireUser: mocks.requireUser,
}));
vi.mock("@/lib/log-server-error", () => ({
  logServerError: mocks.logServerError,
}));

import {
  listReaderVocabularyCards,
  listVocabularyCards,
} from "@/features/vocabulary/queries.server";

function vocabularyQuery(data: object[]) {
  const query = {
    eq: vi.fn(() => query),
    select: vi.fn(() => query),
    then: (resolve: (value: { data: object[]; error: null }) => unknown) =>
      resolve({ data, error: null }),
  };
  return query;
}

describe("listReaderVocabularyCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not query private cards for an anonymous reader", async () => {
    mocks.getAuthContext.mockResolvedValue({ authenticated: false });

    await expect(listReaderVocabularyCards("en", "es")).resolves.toEqual([]);
  });

  it("maps cards for the authenticated reader language pair", async () => {
    const query = vocabularyQuery([
      {
        image_url: "https://example.com/context.jpg",
        note: "Remember this",
        translation: ["contexto"],
        usage_context: "Context helps.",
        word: "context",
      },
    ]);
    const supabase = { from: vi.fn(() => query) };
    mocks.getAuthContext.mockResolvedValue({
      authenticated: true,
      supabase,
      userId: "20000000-0000-4000-8000-000000000001",
    });

    await expect(listReaderVocabularyCards("en", "es")).resolves.toEqual([
      {
        imageUrl: "https://example.com/context.jpg",
        meanings: ["contexto"],
        note: "Remember this",
        usageContext: "Context helps.",
        word: "context",
      },
    ]);
    expect(query.eq).toHaveBeenCalledWith("source_language", "en");
    expect(query.eq).toHaveBeenCalledWith("target_language", "es");
  });
});

describe("listVocabularyCards", () => {
  it("loads only the current user's cards in most-recently-updated order", async () => {
    const data = [
      {
        created_at: "2026-01-01T00:00:00Z",
        id: "30000000-0000-4000-8000-000000000001",
        image_url: null,
        note: "Remember this",
        source_language: "en",
        target_language: "es",
        translation: ["contexto"],
        updated_at: "2026-01-02T00:00:00Z",
        usage_context: "Context helps.",
        word: "context",
      },
    ];
    const query = {
      eq: vi.fn(() => query),
      order: vi.fn(async () => ({ data, error: null })),
      select: vi.fn(() => query),
    };
    const supabase = { from: vi.fn(() => query) };
    mocks.requireUser.mockResolvedValue({ supabase, userId: "user-1" });

    await expect(listVocabularyCards()).resolves.toEqual([
      {
        createdAt: "2026-01-01T00:00:00Z",
        id: "30000000-0000-4000-8000-000000000001",
        imageUrl: null,
        meanings: ["contexto"],
        note: "Remember this",
        sourceLanguage: "en",
        targetLanguage: "es",
        updatedAt: "2026-01-02T00:00:00Z",
        usageContext: "Context helps.",
        word: "context",
      },
    ]);
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(query.order).toHaveBeenCalledWith("updated_at", {
      ascending: false,
    });
  });
});
