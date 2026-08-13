import { defineRouting } from "next-intl/routing";

export const APP_LOCALES = ["en", "ru", "fr", "es", "ar"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_APP_LOCALE: AppLocale = "en";

export const APP_LOCALE_COOKIE = {
  maxAgeSeconds: 60 * 60 * 24 * 365,
  name: "NEXT_LOCALE",
} as const;

const RTL_LOCALES: ReadonlySet<AppLocale> = new Set(["ar"]);

export function parseAppLocale(value: unknown): AppLocale {
  return APP_LOCALES.includes(value as AppLocale)
    ? (value as AppLocale)
    : DEFAULT_APP_LOCALE;
}

export function getLocaleDirection(locale: AppLocale) {
  return RTL_LOCALES.has(locale) ? ("rtl" as const) : ("ltr" as const);
}

export const routing = defineRouting({
  defaultLocale: DEFAULT_APP_LOCALE,
  localeCookie: {
    maxAge: APP_LOCALE_COOKIE.maxAgeSeconds,
    name: APP_LOCALE_COOKIE.name,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
  localePrefix: "as-needed",
  locales: APP_LOCALES,
});
