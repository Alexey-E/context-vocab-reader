import { describe, expect, it } from "vitest";

import {
  getLanguage,
  getLanguageDirection,
  getLanguageDisplayName,
  isLanguageCode,
  LANGUAGES,
} from "@/lib/languages";

describe("the language catalog", () => {
  it("contains unique supported language codes", () => {
    const codes = LANGUAGES.map((language) => language.code);

    expect(codes).toEqual(["en", "es", "fr", "ar"]);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("looks up language metadata and direction", () => {
    expect(getLanguage("ar")).toEqual({
      code: "ar",
      direction: "rtl",
      name: "Arabic",
    });
    expect(getLanguage("de")).toBeUndefined();
  });

  it("narrows supported language codes", () => {
    expect(isLanguageCode("en")).toBe(true);
    expect(isLanguageCode("de")).toBe(false);
    expect(isLanguageCode(null)).toBe(false);
  });

  it.each([
    ["en", "English"],
    ["ru", "английский"],
    ["fr", "anglais"],
    ["es", "inglés"],
    ["ar", "الإنجليزية"],
  ])("formats language names for the %s interface", (locale, expected) => {
    expect(getLanguageDisplayName("en", locale)).toBe(expected);
  });

  it("uses an isolated-friendly code fallback for unknown languages", () => {
    expect(getLanguageDisplayName("invalid_language", "ar")).toBe(
      "INVALID_LANGUAGE",
    );
  });

  it("formats provider-discovered languages and accepts a provider fallback", () => {
    expect(getLanguageDisplayName("de", "fr", "allemand fourni")).toBe(
      "allemand",
    );
    expect(
      getLanguageDisplayName("invalid_language", "en", "Provider name"),
    ).toBe("Provider name");
  });

  it("derives writing direction for provider-discovered languages", () => {
    expect(getLanguageDirection("en")).toBe("ltr");
    expect(getLanguageDirection("ar")).toBe("rtl");
    expect(getLanguageDirection("he")).toBe("rtl");
    expect(getLanguageDirection("invalid_language")).toBe("ltr");
  });
});
