import "server-only";

import type { TranslationProvider } from "@/features/translation/contract";
import { TranslationProviderError } from "@/features/translation/errors";
import { GoogleTranslationProvider } from "@/features/translation/google-provider";
import { MockTranslationProvider } from "@/features/translation/mock-provider";

export function getTranslationProvider(): TranslationProvider {
  const provider = process.env.TRANSLATION_PROVIDER?.trim() || "mock";

  if (provider === "mock") return new MockTranslationProvider();

  if (provider === "google") {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();

    if (!apiKey) throw new TranslationProviderError("configuration");

    return new GoogleTranslationProvider({ apiKey });
  }

  throw new TranslationProviderError("configuration");
}
