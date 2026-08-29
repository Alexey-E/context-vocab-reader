import type { LanguageDirection } from "@/lib/languages";

export const TRANSLATION_PROVIDER_IDS = ["mock", "google"] as const;

export type TranslationProviderId = (typeof TRANSLATION_PROVIDER_IDS)[number];

export type TranslationInput = Readonly<{
  sourceLanguage: string;
  targetLanguage: string;
  text: string;
}>;

export type TranslationResult = Readonly<{
  provider: TranslationProviderId;
  translatedText: string;
}>;

export type SupportedLanguage = Readonly<{
  code: string;
  direction: LanguageDirection;
  name: string;
}>;

export type SupportedLanguagesInput = Readonly<{
  displayLanguage?: string;
}>;

export interface TranslationProvider {
  readonly id: TranslationProviderId;

  getSupportedLanguages(
    input?: SupportedLanguagesInput,
  ): Promise<readonly SupportedLanguage[]>;

  translate(input: TranslationInput): Promise<TranslationResult>;
}
