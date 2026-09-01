import { normalizeWord } from "@/features/reader/text-processing";
import type { ReaderVocabularyCard } from "@/features/vocabulary/contract";

export type ReaderVocabularyCardLookup = ReadonlyMap<
  string,
  ReaderVocabularyCard
>;

export function createReaderVocabularyCardKey(
  sourceLanguage: string,
  targetLanguage: string,
  word: string,
) {
  return JSON.stringify([
    sourceLanguage.toLowerCase(),
    targetLanguage.toLowerCase(),
    normalizeWord(word, sourceLanguage),
  ]);
}

export function createReaderVocabularyCardLookup(
  cards: readonly ReaderVocabularyCard[],
  sourceLanguage: string,
  targetLanguage: string,
): ReaderVocabularyCardLookup {
  return new Map(
    cards.map((card) => [
      createReaderVocabularyCardKey(sourceLanguage, targetLanguage, card.word),
      card,
    ]),
  );
}

export function findReaderVocabularyCard(
  lookup: ReaderVocabularyCardLookup,
  sourceLanguage: string,
  targetLanguage: string,
  word: string,
) {
  return (
    lookup.get(
      createReaderVocabularyCardKey(sourceLanguage, targetLanguage, word),
    ) ?? null
  );
}

export function upsertReaderVocabularyCard(
  cards: readonly ReaderVocabularyCard[],
  card: ReaderVocabularyCard,
  sourceLanguage: string,
  targetLanguage: string,
) {
  const cardKey = createReaderVocabularyCardKey(
    sourceLanguage,
    targetLanguage,
    card.word,
  );
  const nextCards: ReaderVocabularyCard[] = [];
  let replaced = false;

  for (const currentCard of cards) {
    const currentKey = createReaderVocabularyCardKey(
      sourceLanguage,
      targetLanguage,
      currentCard.word,
    );

    if (currentKey !== cardKey) {
      nextCards.push(currentCard);
    } else if (!replaced) {
      nextCards.push(card);
      replaced = true;
    }
  }

  if (!replaced) {
    nextCards.push(card);
  }

  return nextCards;
}
