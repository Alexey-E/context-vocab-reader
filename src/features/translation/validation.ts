import type { TranslationInput } from "@/features/translation/contract";
import { TRANSLATION_POLICY } from "@/features/translation/constants";
import { TranslationProviderError } from "@/features/translation/errors";

export type ValidatedTranslationInput = Readonly<{
  sourceLanguage: string;
  targetLanguage: string;
  text: string;
}>;

export function countCodePoints(value: string) {
  return Array.from(value).length;
}

export function normalizeLanguageCode(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new TranslationProviderError("invalid_request");
  }

  try {
    return Intl.getCanonicalLocales(trimmedValue)[0];
  } catch {
    throw new TranslationProviderError("invalid_request");
  }
}

export function validateTranslationInput(
  input: TranslationInput,
): ValidatedTranslationInput {
  const sourceLanguage = normalizeLanguageCode(input.sourceLanguage);
  const targetLanguage = normalizeLanguageCode(input.targetLanguage);

  if (
    !input.text.trim() ||
    countCodePoints(input.text) > TRANSLATION_POLICY.text.maxCodePoints ||
    sourceLanguage.toLowerCase() === targetLanguage.toLowerCase()
  ) {
    throw new TranslationProviderError("invalid_request");
  }

  return {
    sourceLanguage,
    targetLanguage,
    text: input.text,
  };
}
