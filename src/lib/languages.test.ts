import { describe, expect, it } from "vitest";

import { getLanguage, isLanguageCode, LANGUAGES } from "@/lib/languages";

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
});
