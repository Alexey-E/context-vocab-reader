import type { ReaderParagraph } from "@/features/reader/text-processing";

export function findReaderWord(
  paragraphs: readonly ReaderParagraph[],
  tokenId: string,
) {
  for (const paragraph of paragraphs) {
    for (const sentence of paragraph.sentences) {
      const token = sentence.tokens.find(({ id }) => id === tokenId);

      if (token?.kind === "word") {
        return {
          normalizedWord: token.normalized,
          sourceText: token.text,
          usageContext: sentence.text.trim(),
        };
      }
    }
  }

  return null;
}
