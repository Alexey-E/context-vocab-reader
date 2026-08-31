import { describe, expect, it } from "vitest";

import { processReaderText } from "@/features/reader/text-processing";
import { findReaderWord } from "@/features/vocabulary/word-source";

describe("findReaderWord", () => {
  const paragraphs = processReaderText(
    "Meaningful context helps. Another sentence.",
    "en",
  );

  it("returns a normalized word and its sentence context", () => {
    expect(
      findReaderWord(paragraphs, "paragraph-0-sentence-0-token-2"),
    ).toEqual({
      normalizedWord: "context",
      sourceText: "context",
      usageContext: "Meaningful context helps.",
    });
  });

  it("rejects punctuation and unknown token identifiers", () => {
    expect(
      findReaderWord(paragraphs, "paragraph-0-sentence-0-token-1"),
    ).toBeNull();
    expect(findReaderWord(paragraphs, "missing-token")).toBeNull();
  });
});
