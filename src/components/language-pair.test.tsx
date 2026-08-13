import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguagePair } from "@/components/language-pair";
import type { AppLocale } from "@/i18n/routing";

function renderLanguagePair(
  props: React.ComponentProps<typeof LanguagePair>,
  locale: AppLocale = "ar",
) {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={{}} timeZone="UTC">
      <LanguagePair {...props} />
    </NextIntlClientProvider>,
  );
}

describe("LanguagePair", () => {
  it("formats supported language names for the interface locale", () => {
    const markup = renderLanguagePair({
      sourceLanguageCode: "en",
      targetLanguageCode: "es",
    });

    expect(markup).toContain("الإنجليزية");
    expect(markup).toContain("الإسبانية");
    expect(markup).toContain('<bdi dir="auto">');
  });

  it("isolates an unknown language code as LTR", () => {
    const markup = renderLanguagePair({
      sourceLanguageCode: "unknown",
      targetLanguageCode: "en",
    });

    expect(markup).toContain('<bdi dir="ltr">UNKNOWN</bdi>');
  });
});
