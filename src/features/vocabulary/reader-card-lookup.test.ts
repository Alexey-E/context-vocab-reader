import { describe, expect, it } from "vitest";

import type { ReaderVocabularyCard } from "@/features/vocabulary/contract";
import {
  createReaderVocabularyCardLookup,
  createReaderVocabularyCardKey,
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
  it("finds a card using an already-normalized word and language pair", () => {
    const lookup = createReaderVocabularyCardLookup(
      [card("can't")],
      "en",
      "es",
    );

    expect(findReaderVocabularyCard(lookup, "en", "es", "can't")).toEqual(
      card("can't"),
    );
    expect(findReaderVocabularyCard(lookup, "en", "fr", "can't")).toBeNull();
  });

  it("returns null when the lookup is empty or the word is absent", () => {
    expect(
      findReaderVocabularyCard(
        createReaderVocabularyCardLookup([], "en", "es"),
        "en",
        "es",
        "context",
      ),
    ).toBeNull();

    const lookup = createReaderVocabularyCardLookup(
      [card("context")],
      "en",
      "es",
    );

    expect(
      findReaderVocabularyCard(lookup, "en", "es", "environment"),
    ).toBeNull();
  });

  it("matches language codes without case sensitivity", () => {
    const storedCard = card("context");
    const lookup = createReaderVocabularyCardLookup([storedCard], "EN", "ES");

    expect(findReaderVocabularyCard(lookup, "en", "es", "context")).toBe(
      storedCard,
    );
  });

  it("does not renormalize words using the browser Unicode tables", () => {
    expect(createReaderVocabularyCardKey("en", "es", "can't")).not.toBe(
      createReaderVocabularyCardKey("en", "es", "CAN’T"),
    );
  });

  it("keeps distinct Unicode 17 database words in the lookup", () => {
    const arabicLetter = card("ا");
    const arabicLetterWithUnicode17Letter = card("ا\u088f");
    const lookup = createReaderVocabularyCardLookup(
      [arabicLetter, arabicLetterWithUnicode17Letter],
      "ar",
      "en",
    );

    expect(findReaderVocabularyCard(lookup, "ar", "en", "ا")).toBe(
      arabicLetter,
    );
    expect(findReaderVocabularyCard(lookup, "ar", "en", "ا\u088f")).toBe(
      arabicLetterWithUnicode17Letter,
    );
  });

  it("uses the last input card when keys collide", () => {
    const last = card("context", ["entorno"]);
    const lookup = createReaderVocabularyCardLookup(
      [card("context", ["contexto"]), last],
      "en",
      "es",
    );

    expect(findReaderVocabularyCard(lookup, "en", "es", "context")).toBe(last);
  });

  it("replaces a matching card without changing its position", () => {
    const updated = card("context", ["entorno"]);

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

  it("collapses duplicate keys at the first match without mutation", () => {
    const first = card("context", ["contexto"]);
    const unrelated = card("setting");
    const duplicate = card("context", ["entorno"]);
    const cards = [first, unrelated, duplicate];
    const updated = card("context", ["marco"]);

    expect(upsertReaderVocabularyCard(cards, updated, "en", "es")).toEqual([
      updated,
      unrelated,
    ]);
    expect(cards).toEqual([first, unrelated, duplicate]);
  });
});
