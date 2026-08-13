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

function getRenderedSourceText(markup: string) {
  const sourceMarkup = markup.match(
    /data-reader-source-text="true"[^>]*>([\s\S]*?)<\/div>/,
  )?.[1];

  return sourceMarkup?.replace(/<[^>]+>/g, "");
}

describe("Reader", () => {
  it("renders identifiable sentence and word spans without interactive prose", () => {
    const markup = renderReader({
      content: "First sentence. Second sentence.",
      sourceLanguage: "en",
      targetLanguage: "es",
      title: "A sample",
      visibility: "public",
    });

    expect(markup).toContain('data-reader-source-text="true"');
    expect(markup).toContain('data-sentence-id="paragraph-0-sentence-0"');
    expect(markup).toContain('data-token-kind="word"');
    expect(markup).not.toContain("<button");
    expect(markup).not.toContain("aria-pressed");
  });

  it("infers the title direction and marks content with its source language", () => {
    const markup = renderReader({
      content: "مرحبًا!",
      sourceLanguage: "ar",
      targetLanguage: "en",
      title: "نص تجريبي",
      visibility: "public",
    });

    expect(markup).toMatch(/<h1[^>]*dir="auto"/);
    expect(markup).not.toMatch(/<h1[^>]*lang=/);
    expect(markup).toMatch(/<div[^>]*lang="ar"[^>]*dir="rtl"/);
    expect(markup).toContain('dir="rtl"');
  });

  it("renders leading, repeated, and trailing paragraph separators", () => {
    const content = "\n\nFirst paragraph.\n\n\nSecond paragraph.\n\n";
    const markup = renderReader({
      content,
      sourceLanguage: "en",
      targetLanguage: "es",
      title: "Spacing sample",
      visibility: "public",
    });

    expect(getRenderedSourceText(markup)).toBe(content);
    expect(markup).toContain("data-paragraph-separator");
  });
});
