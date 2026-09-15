import { describe, expect, it } from "vitest";

import type { VocabularyCard } from "@/features/vocabulary/contract";
import {
  createVocabularyPairKey,
  filterVocabularyCards,
  normalizeVocabularySearch,
  VOCABULARY_SEARCH_MAX_LENGTH,
} from "@/features/vocabulary/dashboard-filters";

const cards: VocabularyCard[] = [
  {
    createdAt: "2026-01-01T00:00:00Z",
    id: "10000000-0000-4000-8000-000000000001",
    imageUrl: null,
    meanings: ["Contexto"],
    note: "Important noun",
    sourceLanguage: "en",
    targetLanguage: "es",
    updatedAt: "2026-01-02T00:00:00Z",
    usageContext: "Context helps.",
    word: "context",
  },
  {
    createdAt: "2026-01-01T00:00:00Z",
    id: "10000000-0000-4000-8000-000000000002",
    imageUrl: null,
    meanings: ["livre"],
    note: null,
    sourceLanguage: "en",
    targetLanguage: "fr",
    updatedAt: "2026-01-02T00:00:00Z",
    usageContext: null,
    word: "book",
  },
];

describe("vocabulary dashboard filters", () => {
  it("searches case-insensitively across words, meanings, context, and notes", () => {
    for (const search of ["CONTEXT", "CONTEXTO", "helps", "important"]) {
      expect(filterVocabularyCards(cards, { pair: "", search })).toEqual([
        cards[0],
      ]);
    }
  });

  it("combines search with an exact language-pair filter", () => {
    expect(
      filterVocabularyCards(cards, {
        pair: createVocabularyPairKey("en", "fr"),
        search: "book",
      }),
    ).toEqual([cards[1]]);
    expect(
      filterVocabularyCards(cards, {
        pair: createVocabularyPairKey("en", "es"),
        search: "book",
      }),
    ).toEqual([]);
  });

  it("normalizes, trims, and bounds incoming search parameters", () => {
    expect(normalizeVocabularySearch("  ＢＯＯＫ  ")).toBe("BOOK");
    expect(normalizeVocabularySearch(["book"])).toBe("");
    expect(normalizeVocabularySearch("x".repeat(200))).toHaveLength(
      VOCABULARY_SEARCH_MAX_LENGTH,
    );
  });
});
