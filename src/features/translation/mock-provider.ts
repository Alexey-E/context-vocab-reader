import type {
  SupportedLanguage,
  TranslationInput,
  TranslationProvider,
} from "@/features/translation/contract";
import { validateTranslationInput } from "@/features/translation/validation";
import { LANGUAGES, getLanguageDisplayName } from "@/lib/languages";

export class MockTranslationProvider implements TranslationProvider {
  readonly id = "mock" as const;

  async getSupportedLanguages(
    input: Readonly<{ displayLanguage?: string }> = {},
  ): Promise<readonly SupportedLanguage[]> {
    const displayLanguage = input.displayLanguage ?? "en";

    return LANGUAGES.map((language) => ({
      code: language.code,
      direction: language.direction,
      name: getLanguageDisplayName(language.code, displayLanguage),
    }));
  }

  async translate(input: TranslationInput) {
    const validatedInput = validateTranslationInput(input);

    return {
      provider: this.id,
      translatedText: `[mock ${validatedInput.sourceLanguage}→${validatedInput.targetLanguage}] ${validatedInput.text}`,
    } as const;
  }
}
