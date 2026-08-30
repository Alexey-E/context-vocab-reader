import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createTranslationCache } from "@/features/translation/cache";
import { translateReaderText } from "@/features/reader/translation.server";

describe("translateReaderText", () => {
  it("derives languages from the stored resource and caches the result", async () => {
    const translate = vi.fn().mockResolvedValue({
      provider: "mock" as const,
      translatedText: "Hola",
    });
    const getLanguagePair = vi.fn().mockResolvedValue({
      sourceLanguage: "en",
      targetLanguage: "es",
    });
    const cache = createTranslationCache();
    const dependencies = {
      getLanguagePair,
      getOrCreate: cache.getOrCreate,
      getProvider: () => ({
        getSupportedLanguages: vi.fn(),
        id: "mock" as const,
        translate,
      }),
    };
    const input = {
      resource: { kind: "sample", slug: "english-context" } as const,
      text: " Hello ",
    };

    await expect(
      translateReaderText(input, dependencies),
    ).resolves.toMatchObject({
      cached: false,
      result: { translatedText: "Hola" },
    });
    await expect(
      translateReaderText(input, dependencies),
    ).resolves.toMatchObject({
      cached: true,
      result: { translatedText: "Hola" },
    });

    expect(getLanguagePair).toHaveBeenCalledWith(input.resource);
    expect(translate).toHaveBeenCalledOnce();
    expect(translate).toHaveBeenCalledWith({
      sourceLanguage: "en",
      targetLanguage: "es",
      text: "Hello",
    });
  });

  it("rejects empty and oversized text before resolving the resource", async () => {
    const getLanguagePair = vi.fn();
    const dependencies = {
      getLanguagePair,
      getProvider: () => ({
        getSupportedLanguages: vi.fn(),
        id: "mock" as const,
        translate: vi.fn(),
      }),
    };

    await expect(
      translateReaderText(
        {
          resource: { kind: "sample", slug: "english-context" },
          text: "   ",
        },
        dependencies,
      ),
    ).rejects.toMatchObject({
      code: "invalid_request",
    });
    await expect(
      translateReaderText(
        {
          resource: { kind: "sample", slug: "english-context" },
          text: "a".repeat(5_001),
        },
        dependencies,
      ),
    ).rejects.toMatchObject({
      code: "invalid_request",
    });
    expect(getLanguagePair).not.toHaveBeenCalled();
  });
});
