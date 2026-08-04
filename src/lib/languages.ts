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
