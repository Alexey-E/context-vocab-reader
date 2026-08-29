import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getDefaultDocumentLanguagePair,
  getDocumentLanguages,
} from "@/features/documents/languages.server";
import type {
  SupportedLanguage,
  TranslationProvider,
} from "@/features/translation/contract";
import { TranslationProviderError } from "@/features/translation/errors";

function createProvider(
  getSupportedLanguages: () => Promise<readonly SupportedLanguage[]>,
): TranslationProvider {
  return {
    id: "mock",
    getSupportedLanguages,
    translate: async () => ({
      provider: "mock",
      translatedText: "unused",
    }),
  };
}

describe("getDocumentLanguages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["en", "German"],
    ["ru", "немецкий"],
    ["fr", "allemand"],
    ["es", "alemán"],
    ["ar", "الألمانية"],
  ])("localizes provider languages for %s", async (locale, germanName) => {
    const languages = await getDocumentLanguages(
      locale,
      createProvider(async () => [
        { code: "de", direction: "ltr", name: "Provider German" },
        { code: "en", direction: "ltr", name: "Provider English" },
      ]),
    );

    expect(languages.find(({ code }) => code === "de")?.name).toBe(germanName);
    expect(languages.map(({ name }) => name)).toEqual(
      [...languages.map(({ name }) => name)].sort((left, right) =>
        new Intl.Collator(locale, { sensitivity: "base" }).compare(left, right),
      ),
    );
  });

  it("canonicalizes, deduplicates, and derives language direction", async () => {
    const languages = await getDocumentLanguages(
      "en",
      createProvider(async () => [
        { code: "AR", direction: "ltr", name: "Arabic" },
        { code: "ar", direction: "ltr", name: "Duplicate" },
        { code: "en", direction: "rtl", name: "English" },
      ]),
    );

    expect(languages).toEqual([
      { code: "ar", direction: "rtl", name: "Arabic" },
      { code: "en", direction: "ltr", name: "English" },
    ]);
  });

  it("falls back to the deterministic mock catalog after discovery fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const provider = createProvider(async () => {
      throw new TranslationProviderError("unavailable");
    });

    await expect(getDocumentLanguages("en", provider)).resolves.toHaveLength(4);
    expect(console.error).toHaveBeenCalledOnce();
  });

  it("does not hide provider configuration errors", async () => {
    const provider = createProvider(async () => {
      throw new TranslationProviderError("configuration");
    });

    await expect(getDocumentLanguages("en", provider)).rejects.toMatchObject({
      code: "configuration",
    });
  });
});

describe("getDefaultDocumentLanguagePair", () => {
  it("prefers the English and Spanish pair", () => {
    expect(
      getDefaultDocumentLanguagePair([
        { code: "fr", direction: "ltr", name: "French" },
        { code: "es", direction: "ltr", name: "Spanish" },
        { code: "en", direction: "ltr", name: "English" },
      ]),
    ).toEqual({ sourceLanguage: "en", targetLanguage: "es" });
  });

  it("uses the first two different available languages", () => {
    expect(
      getDefaultDocumentLanguagePair([
        { code: "de", direction: "ltr", name: "German" },
        { code: "fr", direction: "ltr", name: "French" },
      ]),
    ).toEqual({ sourceLanguage: "de", targetLanguage: "fr" });
  });
});
