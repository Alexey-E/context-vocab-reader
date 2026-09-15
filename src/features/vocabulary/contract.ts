export type ReaderVocabularyCard = Readonly<{
  imageUrl: string | null;
  meanings: string[];
  note: string | null;
  usageContext: string | null;
  word: string;
}>;

export type VocabularyCard = ReaderVocabularyCard &
  Readonly<{
    createdAt: string;
    id: string;
    sourceLanguage: string;
    targetLanguage: string;
    updatedAt: string;
  }>;
