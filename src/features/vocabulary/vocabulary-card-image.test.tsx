import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import messages from "@messages/en.json";

import { VocabularyCardImage } from "@/features/vocabulary/vocabulary-card-image";

describe("VocabularyCardImage", () => {
  it("shows an accessible fallback when a card has no image", () => {
    const markup = renderToStaticMarkup(
      <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
        <VocabularyCardImage imageUrl={null} word="context" />
      </NextIntlClientProvider>,
    );

    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="No available image for context"');
    expect(markup).toContain("No image");
    expect(markup).toContain(">C<");
  });

  it("renders a configured image with descriptive alternative text", () => {
    const markup = renderToStaticMarkup(
      <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
        <VocabularyCardImage
          imageUrl="https://example.com/context.jpg"
          word="context"
        />
      </NextIntlClientProvider>,
    );

    expect(markup).toContain('src="https://example.com/context.jpg"');
    expect(markup).toContain('alt="Image for context"');
  });
});
