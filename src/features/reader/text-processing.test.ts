import { describe, expect, it } from "vitest";

import {
  normalizeWord,
  processReaderText,
  splitParagraphs,
  splitSentences,
  tokenizeText,
} from "@/features/reader/text-processing";

function restoreParagraphs(paragraphs: ReturnType<typeof splitParagraphs>) {
  return paragraphs
    .map(({ separatorAfter, text }) => text + separatorAfter)
    .join("");
}

describe("splitParagraphs", () => {
  it("splits LF and CRLF paragraphs without losing their separators", () => {
    const text = "First paragraph.\n\nSecond paragraph.\r\n \r\nThird.";
    const paragraphs = splitParagraphs(text);

    expect(paragraphs).toEqual([
      { separatorAfter: "\n\n", text: "First paragraph." },
      { separatorAfter: "\r\n \r\n", text: "Second paragraph." },
      { separatorAfter: "", text: "Third." },
    ]);
    expect(restoreParagraphs(paragraphs)).toBe(text);
  });

  it("keeps a single line break inside a paragraph", () => {
    const text = "First line.\nSecond line.";

    expect(splitParagraphs(text)).toEqual([{ separatorAfter: "", text }]);
  });

  it("preserves leading and trailing paragraph separators", () => {
    const text = "\n\nIndented start.\n\n";
    const paragraphs = splitParagraphs(text);

    expect(restoreParagraphs(paragraphs)).toBe(text);
  });
});

describe("splitSentences", () => {
  it.each([
    ["en", "Hello, world! How are you?", ["Hello, world! ", "How are you?"]],
    ["es", "¡Hola! ¿Cómo estás?", ["¡Hola! ", "¿Cómo estás?"]],
    ["fr", "Bonjour ! Ça va bien.", ["Bonjour ! ", "Ça va bien."]],
    ["ar", "مرحبًا! كيف حالك؟", ["مرحبًا! ", "كيف حالك؟"]],
  ])("segments %s prose and preserves spacing", (language, text, expected) => {
    const sentences = splitSentences(text, language as string);

    expect(sentences).toEqual(expected);
    expect(sentences.join("")).toBe(text);
  });

  it("falls back safely for an invalid language tag", () => {
    expect(splitSentences("One. Two.", "__invalid__").join("")).toBe(
      "One. Two.",
    );
  });
});

describe("tokenizeText", () => {
  it("preserves words, punctuation, apostrophes, and whitespace", () => {
    const text = "Don’t stop,  reader!";
    const tokens = tokenizeText(text, "en");

    expect(tokens.map(({ text: tokenText }) => tokenText).join("")).toBe(text);
    expect(tokens).toEqual([
      { kind: "word", normalized: "don't", text: "Don’t" },
      { kind: "text", text: " " },
      { kind: "word", normalized: "stop", text: "stop" },
      { kind: "text", text: "," },
      { kind: "text", text: "  " },
      { kind: "word", normalized: "reader", text: "reader" },
      { kind: "text", text: "!" },
    ]);
  });

  it("preserves Arabic tokens and treats numbers as text", () => {
    expect(tokenizeText("مرحبًا 2026!", "ar")).toEqual([
      { kind: "word", normalized: "مرحبًا", text: "مرحبًا" },
      { kind: "text", text: " " },
      { kind: "text", text: "2026" },
      { kind: "text", text: "!" },
    ]);
  });
});

describe("normalizeWord", () => {
  it("normalizes case, compatibility characters, and apostrophes", () => {
    expect(normalizeWord("  “ＤON’T!” ", "en")).toBe("don't");
  });

  it("produces the same value for composed and decomposed accents", () => {
    expect(normalizeWord("CAFÉ", "fr")).toBe(normalizeWord("cafe\u0301", "fr"));
  });

  it("preserves Arabic diacritics", () => {
    expect(normalizeWord("مَرْحَبًا!", "ar")).toBe("مَرْحَبًا");
  });

  it("preserves combining marks at word edges", () => {
    expect(normalizeWord("“लड़की!”", "hi")).toBe("लड़की");
    expect(normalizeWord("a\u1acf!", "en")).toBe("a\u1acf");
  });

  it("preserves non-decimal Unicode numbers at word edges", () => {
    expect(normalizeWord("“a፩!”", "am")).toBe("a፩");
  });

  it("preserves Unicode 17 letters at word edges", () => {
    expect(normalizeWord("“a\u088f!”", "ar")).toBe("a\u088f");
  });

  it("uses the source language for locale-sensitive casing", () => {
    expect(normalizeWord("I", "tr")).toBe("ı");
    expect(normalizeWord("İ", "tr")).toBe("i");
  });

  it("uses Unicode 17 compatibility mappings", () => {
    expect(normalizeWord("꟱", "en")).toBe("s");
  });

  it("uses Unicode 17 lowercase mappings", () => {
    expect(normalizeWord("\u{10d50}", "en")).toBe("\u{10d70}");
    expect(normalizeWord("\u{16ea0}", "en")).toBe("\u{16ebb}");
  });

  it("uses Unicode 17 contextual canonical composition", () => {
    expect(normalizeWord("\u{113c2}\u{113c8}", "en")).toBe(
      "\u{113c5}\u{113c9}",
    );
    expect(normalizeWord("\u{1611e}\u{16123}", "en")).toBe("\u{16126}");
  });
});

describe("processReaderText", () => {
  it("assigns deterministic nested identifiers", () => {
    const result = processReaderText("First. Second.\n\nThird.", "en");

    expect(result[0].id).toBe("paragraph-0");
    expect(result[0].sentences[1].id).toBe("paragraph-0-sentence-1");
    expect(result[1].sentences[0].tokens[0].id).toBe(
      "paragraph-1-sentence-0-token-0",
    );
  });
});
