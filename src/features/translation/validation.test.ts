import { describe, expect, it } from "vitest";

import { TRANSLATION_POLICY } from "@/features/translation/constants";
import { TranslationProviderError } from "@/features/translation/errors";
import {
  countCodePoints,
  normalizeLanguageCode,
  validateTranslationInput,
} from "@/features/translation/validation";

function expectInvalidRequest(callback: () => unknown) {
  try {
    callback();
    throw new Error("Expected translation validation to fail.");
  } catch (error) {
    expect(error).toBeInstanceOf(TranslationProviderError);
    expect((error as TranslationProviderError).code).toBe("invalid_request");
  }
}

describe("translation validation", () => {
  it("canonicalizes language codes and preserves the submitted text", () => {
    expect(
      validateTranslationInput({
        sourceLanguage: " en ",
        targetLanguage: " es ",
        text: "  Keep surrounding whitespace.  ",
      }),
    ).toEqual({
      sourceLanguage: "en",
      targetLanguage: "es",
      text: "  Keep surrounding whitespace.  ",
    });
  });

  it.each(["", "   \n\t"])("rejects empty text %j", (text) => {
    expectInvalidRequest(() =>
      validateTranslationInput({
        sourceLanguage: "en",
        targetLanguage: "es",
        text,
      }),
    );
  });

  it("accepts exactly 5,000 Unicode code points", () => {
    const text = "😀".repeat(TRANSLATION_POLICY.text.maxCodePoints);

    expect(countCodePoints(text)).toBe(5_000);
    expect(
      validateTranslationInput({
        sourceLanguage: "en",
        targetLanguage: "es",
        text,
      }).text,
    ).toBe(text);
  });

  it("rejects 5,001 Unicode code points", () => {
    const text = "😀".repeat(TRANSLATION_POLICY.text.maxCodePoints + 1);

    expectInvalidRequest(() =>
      validateTranslationInput({
        sourceLanguage: "en",
        targetLanguage: "es",
        text,
      }),
    );
  });

  it("rejects equal canonical language codes", () => {
    expectInvalidRequest(() =>
      validateTranslationInput({
        sourceLanguage: "EN",
        targetLanguage: "en",
        text: "Hello",
      }),
    );
  });

  it.each(["", "__invalid_language__"])(
    "rejects invalid language code %j",
    (language) => {
      expectInvalidRequest(() => normalizeLanguageCode(language));
    },
  );
});
