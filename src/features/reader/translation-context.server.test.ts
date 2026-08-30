import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getAuthContext: vi.fn(),
}));

vi.mock("@/lib/auth/require-user", () => ({
  getAuthContext: mocks.getAuthContext,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  ReaderTranslationError,
  resolveReaderLanguagePair,
} from "@/features/reader/translation.server";

function createQuery(
  result: Readonly<{
    data: { source_language: string; target_language: string } | null;
    error: Error | null;
  }>,
) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const query = {
    eq: vi.fn(),
    maybeSingle,
    select: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return query;
}

describe("resolveReaderLanguagePair", () => {
  beforeEach(() => {
    mocks.createClient.mockReset();
    mocks.getAuthContext.mockReset();
  });

  it("requires a session and ownership for private documents", async () => {
    mocks.getAuthContext.mockResolvedValue({ authenticated: false });

    await expect(
      resolveReaderLanguagePair({
        id: "11111111-aaaa-4111-8111-111111111111",
        kind: "document",
      }),
    ).rejects.toEqual(new ReaderTranslationError("unauthorized"));
  });

  it("reads a private document pair through the authenticated user query", async () => {
    const query = createQuery({
      data: { source_language: "en", target_language: "ru" },
      error: null,
    });
    const supabase = { from: vi.fn(() => query) };
    mocks.getAuthContext.mockResolvedValue({
      authenticated: true,
      supabase,
      userId: "11111111-1111-4111-8111-111111111111",
    });

    await expect(
      resolveReaderLanguagePair({
        id: "11111111-aaaa-4111-8111-111111111111",
        kind: "document",
      }),
    ).resolves.toEqual({ sourceLanguage: "en", targetLanguage: "ru" });

    expect(supabase.from).toHaveBeenCalledWith("documents");
    expect(query.eq).toHaveBeenCalledWith(
      "user_id",
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("reads public sample languages without requiring authentication", async () => {
    const query = createQuery({
      data: { source_language: "fr", target_language: "en" },
      error: null,
    });
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(
      resolveReaderLanguagePair({ kind: "sample", slug: "french-cafe" }),
    ).resolves.toEqual({ sourceLanguage: "fr", targetLanguage: "en" });

    expect(mocks.getAuthContext).not.toHaveBeenCalled();
  });
});
