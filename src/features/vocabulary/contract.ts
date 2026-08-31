export type ReaderVocabularyCard = Readonly<{
  imageUrl: string | null;
  meanings: string[];
  note: string | null;
  usageContext: string | null;
  word: string;
}>;
