import type { AppLocale } from "@/i18n/routing";

const MESSAGE_LOADERS = {
  ar: () => import("@messages/ar.json").then((module) => module.default),
  en: () => import("@messages/en.json").then((module) => module.default),
  es: () => import("@messages/es.json").then((module) => module.default),
  fr: () => import("@messages/fr.json").then((module) => module.default),
  ru: () => import("@messages/ru.json").then((module) => module.default),
} as const;

export function loadMessages(locale: AppLocale) {
  return MESSAGE_LOADERS[locale]();
}
