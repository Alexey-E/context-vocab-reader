export type LanguageDirection = "ltr" | "rtl";

const RTL_SCRIPTS = new Set([
  "Adlm",
  "Arab",
  "Hebr",
  "Mand",
  "Nkoo",
  "Rohg",
  "Samr",
  "Syrc",
  "Thaa",
]);

type LocaleWithTextInfo = Intl.Locale & {
  getTextInfo?: () => Readonly<{ direction: LanguageDirection }>;
  textInfo?: Readonly<{ direction: LanguageDirection }>;
};

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

export function getLanguageDisplayName(
  code: string,
  locale: string,
  fallbackName?: string,
) {
  const language = getLanguage(code);

  try {
    const displayName = new Intl.DisplayNames([locale], {
      type: "language",
    }).of(code);

    if (displayName && displayName.toLowerCase() !== code.toLowerCase()) {
      return displayName;
    }

    return fallbackName ?? language?.name ?? code.toUpperCase();
  } catch {
    return fallbackName ?? language?.name ?? code.toUpperCase();
  }
}

export function getLanguageDirection(code: string): LanguageDirection {
  try {
    const locale = new Intl.Locale(code.trim()).maximize();
    const localeWithTextInfo = locale as LocaleWithTextInfo;
    const direction =
      localeWithTextInfo.getTextInfo?.().direction ??
      localeWithTextInfo.textInfo?.direction;

    if (direction === "rtl" || direction === "ltr") return direction;

    return locale.script && RTL_SCRIPTS.has(locale.script) ? "rtl" : "ltr";
  } catch {
    return "ltr";
  }
}
