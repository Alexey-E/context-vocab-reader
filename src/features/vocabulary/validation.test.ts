import { describe, expect, it } from "vitest";

import { VOCABULARY_FIELD_LIMITS } from "@/features/vocabulary/constants";
import {
  mergeMeanings,
  validateVocabularyForm,
} from "@/features/vocabulary/validation";

function formData(overrides: Partial<Record<string, string>> = {}) {
  const data = new FormData();
  const values = {
    imageUrl: "https://example.com/image.jpg",
    meanings: " context, setting ",
    note: "A useful word",
    usageContext: "Learn vocabulary in context.",
    ...overrides,
  };

  Object.entries(values).forEach(([name, value]) => data.set(name, value));
  return data;
}

describe("validateVocabularyForm", () => {
  it("normalizes comma-separated meanings and optional fields", () => {
    expect(validateVocabularyForm(formData())).toEqual({
      input: {
        imageUrl: "https://example.com/image.jpg",
        meanings: ["context", "setting"],
        note: "A useful word",
        usageContext: "Learn vocabulary in context.",
      },
      valid: true,
      values: {
        imageUrl: "https://example.com/image.jpg",
        meanings: " context, setting ",
        note: "A useful word",
        usageContext: "Learn vocabulary in context.",
      },
    });
  });

  it("rejects missing meanings and non-HTTP image URLs", () => {
    const result = validateVocabularyForm(
      formData({ imageUrl: "javascript:alert(1)", meanings: " , " }),
    );

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual({
        imageUrl: "validation.vocabulary.image_url.invalid",
        meanings: "validation.vocabulary.meanings.required",
      });
    }
  });

  it("normalizes shorthand HTTP image URLs for the database constraint", () => {
    const result = validateVocabularyForm(
      formData({ imageUrl: "http:example.com/image.jpg" }),
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.input.imageUrl).toBe("http://example.com/image.jpg");
    }
  });

  it("enforces optional field limits", () => {
    const result = validateVocabularyForm(
      formData({
        note: "n".repeat(VOCABULARY_FIELD_LIMITS.note.maxLength + 1),
        usageContext: "c".repeat(
          VOCABULARY_FIELD_LIMITS.usageContext.maxLength + 1,
        ),
      }),
    );

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual({
        note: "validation.vocabulary.note.too_long",
        usageContext: "validation.vocabulary.context.too_long",
      });
    }
  });
});

describe("mergeMeanings", () => {
  it("preserves existing display values and removes localized duplicates", () => {
    expect(
      mergeMeanings(["Context", "setting"], ["context", "environment"], "en"),
    ).toEqual(["Context", "setting", "environment"]);
  });
});
