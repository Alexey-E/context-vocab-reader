export const LANGUAGES = [
  { code: "en", direction: "ltr", name: "English" },
  { code: "es", direction: "ltr", name: "Spanish" },
  { code: "fr", direction: "ltr", name: "French" },
  { code: "ar", direction: "rtl", name: "Arabic" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function isLanguageCode(value: unknown): value is LanguageCode {
  return LANGUAGES.some((language) => language.code === value);
}

export function getLanguage(code: string) {
  return LANGUAGES.find((language) => language.code === code);
}

export function getLanguageDisplayName(code: string, locale: string) {
  const language = getLanguage(code);

  if (!language) return code.toUpperCase();

  try {
    return (
      new Intl.DisplayNames([locale], { type: "language" }).of(language.code) ??
      language.name
    );
  } catch {
    return language.name;
  }
}
