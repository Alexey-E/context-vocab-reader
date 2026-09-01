import { describe, expect, it } from "vitest";

import type { ReaderVocabularyCard } from "@/features/vocabulary/contract";
import {
  createReaderVocabularyCardLookup,
  findReaderVocabularyCard,
  upsertReaderVocabularyCard,
} from "@/features/vocabulary/reader-card-lookup";

function card(
  word: string,
  meanings: string[] = ["meaning"],
): ReaderVocabularyCard {
  return {
    imageUrl: null,
    meanings,
    note: null,
    usageContext: null,
    word,
  };
}

describe("reader vocabulary card lookup", () => {
  it("finds a card using the language pair and normalized word", () => {
    const lookup = createReaderVocabularyCardLookup(
      [card("can't")],
      "en",
      "es",
    );

    expect(findReaderVocabularyCard(lookup, "en", "es", "CAN’T")).toEqual(
      card("can't"),
    );
    expect(findReaderVocabularyCard(lookup, "en", "fr", "CAN’T")).toBeNull();
  });

  it("uses the latest card when normalized keys collide", () => {
    const latest = card("Context", ["entorno"]);
    const lookup = createReaderVocabularyCardLookup(
      [card("context", ["contexto"]), latest],
      "en",
      "es",
    );

    expect(findReaderVocabularyCard(lookup, "en", "es", "CONTEXT")).toBe(
      latest,
    );
  });

  it("replaces normalized matches without changing their position", () => {
    const updated = card("CONTEXT", ["entorno"]);

    expect(
      upsertReaderVocabularyCard(
        [card("context", ["contexto"]), card("setting")],
        updated,
        "en",
        "es",
      ),
    ).toEqual([updated, card("setting")]);
  });

  it("appends a card whose normalized key is not present", () => {
    const added = card("environment");

    expect(
      upsertReaderVocabularyCard([card("context")], added, "en", "es"),
    ).toEqual([card("context"), added]);
  });
});
