import type { ReaderVocabularyCard } from "@/features/vocabulary/contract";
import { mergeMeanings } from "@/features/vocabulary/validation";

export function getVocabularyFormValues(
  existingCard: ReaderVocabularyCard | null,
  translatedText: string,
  usageContext: string,
  targetLanguage: string,
) {
  return {
    imageUrl: existingCard?.imageUrl ?? "",
    meanings: mergeMeanings(
      existingCard?.meanings ?? [],
      [translatedText],
      targetLanguage,
    ).join(", "),
    note: existingCard?.note ?? "",
    usageContext: existingCard
      ? (existingCard.usageContext ?? "")
      : usageContext,
  };
}
