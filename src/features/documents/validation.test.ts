import { describe, expect, it } from "vitest";

import { DOCUMENT_FIELD_LIMITS } from "@/features/documents/constants";
import { validateDocumentForm } from "@/features/documents/validation";

const SUPPORTED_LANGUAGE_CODES = new Set(["de", "en", "es", "fr"]);

function createDocumentFormData(
  overrides: Partial<Record<string, string>> = {},
) {
  const formData = new FormData();
  const values = {
    content: "First line.\n\nSecond line.",
    sourceLanguage: "en",
    targetLanguage: "es",
    title: "  A useful text  ",
    ...overrides,
  };

  Object.entries(values).forEach(([name, value]) => {
    formData.set(name, value);
  });

  return formData;
}

describe("validateDocumentForm", () => {
  it("normalizes the title and language codes while preserving content", () => {
    expect(
      validateDocumentForm(
        createDocumentFormData({
          sourceLanguage: " en ",
          targetLanguage: " es ",
        }),
        SUPPORTED_LANGUAGE_CODES,
      ),
    ).toEqual({
      input: {
        content: "First line.\n\nSecond line.",
        sourceLanguage: "en",
        targetLanguage: "es",
        title: "A useful text",
      },
      valid: true,
      values: {
        content: "First line.\n\nSecond line.",
        sourceLanguage: " en ",
        targetLanguage: " es ",
        title: "  A useful text  ",
      },
    });
  });

  it("rejects blank required fields", () => {
    const result = validateDocumentForm(
      createDocumentFormData({ content: " \n ", title: "   " }),
      SUPPORTED_LANGUAGE_CODES,
    );

    expect(result).toEqual({
      errors: {
        content: "validation.document.content.required",
        title: "validation.document.title.required",
      },
      valid: false,
      values: {
        content: " \n ",
        sourceLanguage: "en",
        targetLanguage: "es",
        title: "   ",
      },
    });
  });

  it("accepts fields at their maximum lengths", () => {
    const content = "a".repeat(DOCUMENT_FIELD_LIMITS.content.maxLength);
    const title = "a".repeat(DOCUMENT_FIELD_LIMITS.title.maxLength);

    expect(
      validateDocumentForm(
        createDocumentFormData({ content, title }),
        SUPPORTED_LANGUAGE_CODES,
      ),
    ).toEqual({
      input: {
        content,
        sourceLanguage: "en",
        targetLanguage: "es",
        title,
      },
      valid: true,
      values: {
        content,
        sourceLanguage: "en",
        targetLanguage: "es",
        title,
      },
    });
  });

  it("rejects fields over their maximum lengths", () => {
    const result = validateDocumentForm(
      createDocumentFormData({
        content: "a".repeat(DOCUMENT_FIELD_LIMITS.content.maxLength + 1),
        title: "a".repeat(DOCUMENT_FIELD_LIMITS.title.maxLength + 1),
      }),
      SUPPORTED_LANGUAGE_CODES,
    );

    expect(result).toEqual({
      errors: {
        content: "validation.document.content.too_long",
        title: "validation.document.title.too_long",
      },
      valid: false,
      values: {
        content: "a".repeat(DOCUMENT_FIELD_LIMITS.content.maxLength + 1),
        sourceLanguage: "en",
        targetLanguage: "es",
        title: "a".repeat(DOCUMENT_FIELD_LIMITS.title.maxLength + 1),
      },
    });
  });

  it("rejects unsupported languages", () => {
    const result = validateDocumentForm(
      createDocumentFormData({
        sourceLanguage: "__invalid_source__",
        targetLanguage: "__invalid_target__",
      }),
      SUPPORTED_LANGUAGE_CODES,
    );

    expect(result).toEqual({
      errors: {
        sourceLanguage: "validation.document.source_language.invalid",
        targetLanguage: "validation.document.target_language.invalid",
      },
      valid: false,
      values: {
        content: "First line.\n\nSecond line.",
        sourceLanguage: "__invalid_source__",
        targetLanguage: "__invalid_target__",
        title: "  A useful text  ",
      },
    });
  });

  it("rejects an identical language pair", () => {
    const result = validateDocumentForm(
      createDocumentFormData({ sourceLanguage: "fr", targetLanguage: "fr" }),
      SUPPORTED_LANGUAGE_CODES,
    );

    expect(result).toEqual({
      errors: {
        targetLanguage: "validation.document.languages_same",
      },
      valid: false,
      values: {
        content: "First line.\n\nSecond line.",
        sourceLanguage: "fr",
        targetLanguage: "fr",
        title: "  A useful text  ",
      },
    });
  });

  it("accepts a language discovered by the active provider", () => {
    const result = validateDocumentForm(
      createDocumentFormData({ sourceLanguage: "de" }),
      SUPPORTED_LANGUAGE_CODES,
    );

    expect(result.valid).toBe(true);
    if (result.valid) expect(result.input.sourceLanguage).toBe("de");
  });
});
