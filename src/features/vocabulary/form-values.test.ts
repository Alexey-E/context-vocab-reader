import { describe, expect, it } from "vitest";

import { getVocabularyFormValues } from "@/features/vocabulary/form-values";

describe("getVocabularyFormValues", () => {
  it("preloads an existing card and adds the latest translated meaning", () => {
    expect(
      getVocabularyFormValues(
        {
          imageUrl: "https://example.com/existing.jpg",
          meanings: ["Contexto"],
          note: "Existing note",
          usageContext: "Existing context.",
          word: "context",
        },
        "entorno",
        "New context.",
        "es",
      ),
    ).toEqual({
      imageUrl: "https://example.com/existing.jpg",
      meanings: "Contexto, entorno",
      note: "Existing note",
      usageContext: "Existing context.",
    });
  });

  it("keeps an existing empty context and avoids duplicate meanings", () => {
    expect(
      getVocabularyFormValues(
        {
          imageUrl: null,
          meanings: ["Contexto"],
          note: null,
          usageContext: null,
          word: "context",
        },
        "contexto",
        "Context helps.",
        "es",
      ),
    ).toMatchObject({ meanings: "Contexto", usageContext: "" });
  });
});
