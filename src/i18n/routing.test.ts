import { describe, expect, it } from "vitest";

import {
  APP_LOCALE_COOKIE,
  APP_LOCALES,
  getLocaleDirection,
  parseAppLocale,
  routing,
} from "@/i18n/routing";

describe("interface locale configuration", () => {
  it("defines English as the unprefixed default locale", () => {
    expect(routing.defaultLocale).toBe("en");
    expect(routing.localePrefix).toBe("as-needed");
    expect(APP_LOCALES).toEqual(["en", "ru", "fr", "es", "ar"]);
  });

  it("validates locale values and falls back to English", () => {
    expect(parseAppLocale("fr")).toBe("fr");
    expect(parseAppLocale("unknown")).toBe("en");
    expect(parseAppLocale(undefined)).toBe("en");
  });

  it("uses RTL only for Arabic", () => {
    expect(getLocaleDirection("ar")).toBe("rtl");
    expect(getLocaleDirection("en")).toBe("ltr");
    expect(getLocaleDirection("ru")).toBe("ltr");
  });

  it("persists the locale for one year", () => {
    expect(APP_LOCALE_COOKIE).toEqual({
      maxAgeSeconds: 31_536_000,
      name: "NEXT_LOCALE",
    });
  });
});
