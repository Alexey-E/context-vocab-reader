import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getAuthContext: vi.fn(),
  logServerError: vi.fn(),
}));

vi.mock("@/lib/auth/require-user", () => ({
  getAuthContext: mocks.getAuthContext,
}));
vi.mock("@/lib/log-server-error", () => ({
  logServerError: mocks.logServerError,
}));

import { listReaderVocabularyCards } from "@/features/vocabulary/queries.server";

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
