const PARAGRAPH_SEPARATOR_PATTERN = /(?:\r?\n[\t ]*)+\r?\n/g;
const WORD_CHARACTER_PATTERN = /\p{L}/u;
const WORD_EDGE_CHARACTER_PATTERN = /[\p{L}\p{M}\p{N}]/u;
const APOSTROPHE_PATTERN = /[\u2018\u2019\u02bc]/gu;

export type TextParagraph = {
  separatorAfter: string;
  text: string;
};

export type TextToken =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "word";
      normalized: string;
      text: string;
    };

export type ReaderSentence = {
  id: string;
  text: string;
  tokens: Array<TextToken & { id: string }>;
};

export type ReaderParagraph = {
  id: string;
  separatorAfter: string;
  sentences: ReaderSentence[];
  text: string;
};

function createSegmenter(language: string, granularity: "sentence" | "word") {
  try {
    return new Intl.Segmenter(language, { granularity });
  } catch {
    return new Intl.Segmenter(undefined, { granularity });
  }
}

function lowercaseForLanguage(value: string, language: string) {
  try {
    return value.toLocaleLowerCase(language);
  } catch {
    return value.toLowerCase();
  }
}

function trimWordEdges(value: string) {
  const characters = Array.from(value);
  let start = 0;
  let end = characters.length;

  while (start < end && !WORD_EDGE_CHARACTER_PATTERN.test(characters[start])) {
    start += 1;
  }

  while (
    end > start &&
    !WORD_EDGE_CHARACTER_PATTERN.test(characters[end - 1])
  ) {
    end -= 1;
  }

  return characters.slice(start, end).join("");
}

export function splitParagraphs(text: string): TextParagraph[] {
  if (!text) {
    return [];
  }

  const paragraphs: TextParagraph[] = [];
  let start = 0;

  for (const match of text.matchAll(PARAGRAPH_SEPARATOR_PATTERN)) {
    const index = match.index;
    const separatorAfter = match[0];

    paragraphs.push({
      separatorAfter,
      text: text.slice(start, index),
    });
    start = index + separatorAfter.length;
  }

  if (start < text.length) {
    paragraphs.push({ separatorAfter: "", text: text.slice(start) });
  }

  return paragraphs;
}

export function splitSentences(text: string, language: string): string[] {
  if (!text) {
    return [];
  }

  return Array.from(
    createSegmenter(language, "sentence").segment(text),
    ({ segment }) => segment,
  );
}

export function normalizeWord(word: string, language: string) {
  const normalized = lowercaseForLanguage(
    word.normalize("NFKC").replace(APOSTROPHE_PATTERN, "'").trim(),
    language,
  );

  return trimWordEdges(normalized).normalize("NFC");
}

export function tokenizeText(text: string, language: string): TextToken[] {
  if (!text) {
    return [];
  }

  return Array.from(
    createSegmenter(language, "word").segment(text),
    ({ isWordLike, segment }) => {
      if (isWordLike && WORD_CHARACTER_PATTERN.test(segment)) {
        return {
          kind: "word" as const,
          normalized: normalizeWord(segment, language),
          text: segment,
        };
      }

      return { kind: "text" as const, text: segment };
    },
  );
}

export function processReaderText(
  text: string,
  language: string,
): ReaderParagraph[] {
  return splitParagraphs(text).map((paragraph, paragraphIndex) => ({
    id: `paragraph-${paragraphIndex}`,
    separatorAfter: paragraph.separatorAfter,
    sentences: splitSentences(paragraph.text, language).map(
      (sentence, sentenceIndex) => ({
        id: `paragraph-${paragraphIndex}-sentence-${sentenceIndex}`,
        text: sentence,
        tokens: tokenizeText(sentence, language).map((token, tokenIndex) => ({
          ...token,
          id: `paragraph-${paragraphIndex}-sentence-${sentenceIndex}-token-${tokenIndex}`,
        })),
      }),
    ),
    text: paragraph.text,
  }));
}
