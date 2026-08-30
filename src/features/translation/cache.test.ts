import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createTranslationCache,
  createTranslationCacheKey,
  normalizeTranslationCacheText,
} from "@/features/translation/cache";

describe("translation cache", () => {
  it("normalizes Unicode and whitespace when creating cache keys", () => {
    expect(normalizeTranslationCacheText("  Cafe\u0301\n  au lait  ")).toBe(
      "Café au lait",
    );
    expect(
      createTranslationCacheKey({
        provider: "mock",
        sourceLanguage: "EN",
        targetLanguage: "ES",
        text: "Cafe\u0301\n au lait",
      }),
    ).toBe(
      createTranslationCacheKey({
        provider: "mock",
        sourceLanguage: "en",
        targetLanguage: "es",
        text: "Café   au lait",
      }),
    );
  });

  it("keeps providers and language pairs in separate cache entries", () => {
    const base = {
      provider: "mock" as const,
      sourceLanguage: "en",
      targetLanguage: "es",
      text: "Hello",
    };

    expect(createTranslationCacheKey(base)).not.toBe(
      createTranslationCacheKey({ ...base, provider: "google" }),
    );
    expect(createTranslationCacheKey(base)).not.toBe(
      createTranslationCacheKey({ ...base, targetLanguage: "fr" }),
    );
  });

  it("reuses cached results until the TTL expires", async () => {
    let timestamp = 1_000;
    const cache = createTranslationCache({
      now: () => timestamp,
      ttlMs: 100,
    });
    const load = vi
      .fn()
      .mockResolvedValueOnce({ provider: "mock", translatedText: "Hola" })
      .mockResolvedValueOnce({ provider: "mock", translatedText: "Buenas" });

    await expect(cache.getOrCreate("key", load)).resolves.toMatchObject({
      cached: false,
      result: { translatedText: "Hola" },
    });
    timestamp = 1_099;
    await expect(cache.getOrCreate("key", load)).resolves.toMatchObject({
      cached: true,
      result: { translatedText: "Hola" },
    });
    timestamp = 1_100;
    await expect(cache.getOrCreate("key", load)).resolves.toMatchObject({
      cached: false,
      result: { translatedText: "Buenas" },
    });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("deduplicates simultaneous provider requests", async () => {
    let resolveRequest!: (value: {
      provider: "mock";
      translatedText: string;
    }) => void;
    const request = new Promise<{
      provider: "mock";
      translatedText: string;
    }>((resolve) => {
      resolveRequest = resolve;
    });
    const load = vi.fn(() => request);
    const cache = createTranslationCache();
    const first = cache.getOrCreate("same", load);
    const second = cache.getOrCreate("same", load);

    resolveRequest({ provider: "mock", translatedText: "Hola" });

    await expect(first).resolves.toMatchObject({ cached: false });
    await expect(second).resolves.toMatchObject({ cached: true });
    expect(load).toHaveBeenCalledOnce();
  });
});
