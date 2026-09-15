import type { VocabularyCard } from "@/features/vocabulary/contract";

export const VOCABULARY_SEARCH_MAX_LENGTH = 100;

export function createVocabularyPairKey(
  sourceLanguage: string,
  targetLanguage: string,
) {
  return `${sourceLanguage}:${targetLanguage}`;
}

export function normalizeVocabularySearch(value: unknown) {
  const search = typeof value === "string" ? value : "";
  return search.normalize("NFKC").trim().slice(0, VOCABULARY_SEARCH_MAX_LENGTH);
}

function searchKey(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase();
}

export function filterVocabularyCards(
  cards: readonly VocabularyCard[],
  filters: Readonly<{ pair: string; search: string }>,
) {
  const query = searchKey(filters.search);

  return cards.filter((card) => {
    if (
      filters.pair &&
      createVocabularyPairKey(card.sourceLanguage, card.targetLanguage) !==
        filters.pair
    ) {
      return false;
    }

    if (!query) return true;

    return [
      card.word,
      ...card.meanings,
      card.usageContext ?? "",
      card.note ?? "",
    ]
      .map(searchKey)
      .some((value) => value.includes(query));
  });
}
