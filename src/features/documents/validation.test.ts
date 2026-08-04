import { describe, expect, it } from "vitest";

import {
  DOCUMENT_CONTENT_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
} from "@/features/documents/constants";
import { validateDocumentForm } from "@/features/documents/validation";
import { createErrorPayload } from "@/lib/errors/catalog";

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
      ),
    ).toEqual({
      input: {
        content: "First line.\n\nSecond line.",
        sourceLanguage: "en",
        targetLanguage: "es",
        title: "A useful text",
      },
      valid: true,
    });
  });

  it("rejects blank required fields", () => {
    const result = validateDocumentForm(
      createDocumentFormData({ content: " \n ", title: "   " }),
    );

    expect(result).toEqual({
      errors: {
        content: createErrorPayload("validation.document.content.required"),
        title: createErrorPayload("validation.document.title.required"),
      },
      valid: false,
    });
  });

  it("accepts fields at their maximum lengths", () => {
    const content = "a".repeat(DOCUMENT_CONTENT_MAX_LENGTH);
    const title = "a".repeat(DOCUMENT_TITLE_MAX_LENGTH);

    expect(
      validateDocumentForm(createDocumentFormData({ content, title })),
    ).toEqual({
      input: {
        content,
        sourceLanguage: "en",
        targetLanguage: "es",
        title,
      },
      valid: true,
    });
  });

  it("rejects fields over their maximum lengths", () => {
    const result = validateDocumentForm(
      createDocumentFormData({
        content: "a".repeat(DOCUMENT_CONTENT_MAX_LENGTH + 1),
        title: "a".repeat(DOCUMENT_TITLE_MAX_LENGTH + 1),
      }),
    );

    expect(result).toEqual({
      errors: {
        content: createErrorPayload("validation.document.content.too_long"),
        title: createErrorPayload("validation.document.title.too_long"),
      },
      valid: false,
    });
  });

  it("rejects unsupported languages", () => {
    const result = validateDocumentForm(
      createDocumentFormData({
        sourceLanguage: "__invalid_source__",
        targetLanguage: "__invalid_target__",
      }),
    );

    expect(result).toEqual({
      errors: {
        sourceLanguage: createErrorPayload(
          "validation.document.source_language.invalid",
        ),
        targetLanguage: createErrorPayload(
          "validation.document.target_language.invalid",
        ),
      },
      valid: false,
    });
  });

  it("rejects an identical language pair", () => {
    const result = validateDocumentForm(
      createDocumentFormData({ sourceLanguage: "fr", targetLanguage: "fr" }),
    );

    expect(result).toEqual({
      errors: {
        targetLanguage: createErrorPayload(
          "validation.document.languages_same",
        ),
      },
      valid: false,
    });
  });
});
