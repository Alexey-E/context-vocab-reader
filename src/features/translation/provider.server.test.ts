import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { TranslationProviderError } from "@/features/translation/errors";
import { GoogleTranslationProvider } from "@/features/translation/google-provider";
import { MockTranslationProvider } from "@/features/translation/mock-provider";
import { getTranslationProvider } from "@/features/translation/provider.server";

describe("getTranslationProvider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses mock when the provider is omitted", () => {
    vi.stubEnv("TRANSLATION_PROVIDER", "");

    expect(getTranslationProvider()).toBeInstanceOf(MockTranslationProvider);
  });

  it("creates the configured Google provider", () => {
    vi.stubEnv("TRANSLATION_PROVIDER", "google");
    vi.stubEnv("GOOGLE_TRANSLATE_API_KEY", "test-key");

    expect(getTranslationProvider()).toBeInstanceOf(GoogleTranslationProvider);
  });

  it.each([
    ["google", ""],
    ["unknown", "test-key"],
  ])("rejects invalid configuration for provider %s", (provider, apiKey) => {
    vi.stubEnv("TRANSLATION_PROVIDER", provider);
    vi.stubEnv("GOOGLE_TRANSLATE_API_KEY", apiKey);

    try {
      getTranslationProvider();
      throw new Error("Expected provider configuration to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(TranslationProviderError);
      expect((error as TranslationProviderError).code).toBe("configuration");
    }
  });
});
