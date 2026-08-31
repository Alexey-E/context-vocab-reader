import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import messages from "@messages/en.json";

vi.mock("server-only", () => ({}));

import { Reader } from "@/features/reader/reader";

function renderReader(props: React.ComponentProps<typeof Reader>) {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Reader {...props} />
    </NextIntlClientProvider>,
  );
}

const sampleResource = { kind: "sample", slug: "test-sample" } as const;

describe("Reader", () => {
  it("keeps prose as identifiable spans and renders separate sentence controls", () => {
    const markup = renderReader({
      content: "First sentence. Second sentence.",
      resource: sampleResource,
      sourceLanguage: "en",
      targetLanguage: "es",
      title: "A sample",
      visibility: "public",
      vocabularyCards: [],
    });

    expect(markup).toContain('data-reader-source-text="true"');
    expect(markup).toContain('data-sentence-id="paragraph-0-sentence-0"');
    expect(markup).toContain('data-token-kind="word"');
    expect(markup).toContain("Translate this sentence");
    expect(markup).toContain("Translate selection");
    expect(markup).toContain("Enter text");
    expect(markup).toContain('data-reader-source-segment="true"');
  });

  it("infers the title direction and marks content with its source language", () => {
    const markup = renderReader({
      content: "مرحبًا!",
      resource: sampleResource,
      sourceLanguage: "ar",
      targetLanguage: "en",
      title: "نص تجريبي",
      visibility: "public",
      vocabularyCards: [],
    });

    expect(markup).toMatch(/<h1[^>]*dir="auto"/);
    expect(markup).not.toMatch(/<h1[^>]*lang=/);
    expect(markup).toMatch(/<div[^>]*lang="ar"[^>]*dir="rtl"/);
    expect(markup).toContain('dir="rtl"');
  });

  it("uses the source language direction outside the static language catalog", () => {
    const markup = renderReader({
      content: "Version 2. שלום!",
      resource: sampleResource,
      sourceLanguage: "he",
      targetLanguage: "en",
      title: "Hebrew sample",
      visibility: "public",
      vocabularyCards: [],
    });

    expect(markup).toMatch(/<div[^>]*lang="he"[^>]*dir="rtl"/);
  });

  it("renders leading, repeated, and trailing paragraph separators", () => {
    const content = "\n\nFirst paragraph.\n\n\nSecond paragraph.\n\n";
    const markup = renderReader({
      content,
      resource: sampleResource,
      sourceLanguage: "en",
      targetLanguage: "es",
      title: "Spacing sample",
      visibility: "public",
      vocabularyCards: [],
    });

    const textContent = markup.replace(/<[^>]+>/g, "");
    expect(textContent).toContain("First paragraph.");
    expect(textContent).toContain("Second paragraph.");
    expect(markup).toContain("data-paragraph-separator");
  });
});
