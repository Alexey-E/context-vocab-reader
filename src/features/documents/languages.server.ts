import "server-only";

import type {
  SupportedLanguage,
  TranslationProvider,
} from "@/features/translation/contract";
import { TranslationProviderError } from "@/features/translation/errors";
import { MockTranslationProvider } from "@/features/translation/mock-provider";
import { getTranslationProvider } from "@/features/translation/provider.server";
import { normalizeLanguageCode } from "@/features/translation/validation";
import { getLanguageDirection, getLanguageDisplayName } from "@/lib/languages";
import { logServerError } from "@/lib/log-server-error";

function normalizeCatalog(
  languages: readonly SupportedLanguage[],
  locale: string,
) {
  const uniqueLanguages = new Map<string, SupportedLanguage>();

  for (const language of languages) {
    const code = normalizeLanguageCode(language.code);
    const normalizedKey = code.toLocaleLowerCase("en");

    if (uniqueLanguages.has(normalizedKey)) continue;

    uniqueLanguages.set(normalizedKey, {
      code,
      direction: getLanguageDirection(code),
      name: getLanguageDisplayName(code, locale, language.name.trim()),
    });
  }

  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  const normalizedLanguages = [...uniqueLanguages.values()].sort(
    (left, right) =>
      collator.compare(left.name, right.name) ||
      left.code.localeCompare(right.code),
  );

  if (normalizedLanguages.length < 2) {
    throw new TranslationProviderError("invalid_response");
  }

  return normalizedLanguages;
}

async function readCatalog(provider: TranslationProvider, locale: string) {
  const languages = await provider.getSupportedLanguages({
    displayLanguage: locale,
  });

  return normalizeCatalog(languages, locale);
}

export async function getDocumentLanguages(
  locale: string,
  provider: TranslationProvider = getTranslationProvider(),
) {
  try {
    return await readCatalog(provider, locale);
  } catch (error) {
    if (
      error instanceof TranslationProviderError &&
      error.code === "configuration"
    ) {
      throw error;
    }

    logServerError("translation.language_discovery_failed", error, {
      provider: provider.id,
    });

    return readCatalog(new MockTranslationProvider(), locale);
  }
}

export function getDefaultDocumentLanguagePair(
  languages: readonly SupportedLanguage[],
) {
  const codes = new Set(languages.map((language) => language.code));

  if (codes.has("en") && codes.has("es")) {
    return { sourceLanguage: "en", targetLanguage: "es" } as const;
  }

  if (languages.length < 2) {
    throw new TranslationProviderError("invalid_response");
  }

  return {
    sourceLanguage: languages[0].code,
    targetLanguage: languages[1].code,
  } as const;
}
