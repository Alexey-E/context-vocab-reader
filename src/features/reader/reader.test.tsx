import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { Reader } from "@/features/reader/reader";

describe("Reader", () => {
  it("renders identifiable sentence and word spans without interactive prose", () => {
    const markup = renderToStaticMarkup(
      <Reader
        content="First sentence. Second sentence."
        sourceLanguage="en"
        targetLanguage="es"
        title="A sample"
        visibility="public"
      />,
    );

    expect(markup).toContain('data-reader-source-text="true"');
    expect(markup).toContain('data-sentence-id="paragraph-0-sentence-0"');
    expect(markup).toContain('data-token-kind="word"');
    expect(markup).not.toContain("<button");
    expect(markup).not.toContain("aria-pressed");
  });

  it("uses the source language direction", () => {
    const markup = renderToStaticMarkup(
      <Reader
        content="مرحبًا!"
        sourceLanguage="ar"
        targetLanguage="en"
        title="نص تجريبي"
        visibility="public"
      />,
    );

    expect(markup).toContain('dir="rtl"');
  });
});
