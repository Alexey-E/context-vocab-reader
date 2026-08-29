import { afterEach, describe, expect, it, vi } from "vitest";

import { MockTranslationProvider } from "@/features/translation/mock-provider";

describe("MockTranslationProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a deterministic, visibly marked translation without a request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const provider = new MockTranslationProvider();

    await expect(
      provider.translate({
        sourceLanguage: "en",
        targetLanguage: "es",
        text: "Hello",
      }),
    ).resolves.toEqual({
      provider: "mock",
      translatedText: "[mock en→es] Hello",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports the deterministic four-language fallback catalog", async () => {
    const provider = new MockTranslationProvider();

    await expect(
      provider.getSupportedLanguages({ displayLanguage: "en" }),
    ).resolves.toEqual([
      { code: "en", direction: "ltr", name: "English" },
      { code: "es", direction: "ltr", name: "Spanish" },
      { code: "fr", direction: "ltr", name: "French" },
      { code: "ar", direction: "rtl", name: "Arabic" },
    ]);
  });
});
