import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import messages from "@messages/ar.json";

import { DocumentForm } from "@/features/documents/document-form";

describe("DocumentForm", () => {
  it("uses the source language for the editor independently of the UI locale", () => {
    const markup = renderToStaticMarkup(
      <NextIntlClientProvider locale="ar" messages={messages} timeZone="UTC">
        <DocumentForm
          createAction={async () => ({ revision: 0, status: "idle" })}
        />
      </NextIntlClientProvider>,
    );
    const textarea = markup.match(/<textarea[^>]*>/)?.[0];

    expect(markup).toMatch(
      /<input(?=[^>]*name="title")(?=[^>]*dir="auto")[^>]*>/,
    );
    expect(markup).toMatch(
      /<textarea(?=[^>]*lang="en")(?=[^>]*dir="ltr")[^>]*>/,
    );
    expect(textarea).not.toContain("placeholder=");
    expect(markup).toContain('id="content-guidance"');
    expect(markup).toContain(
      'aria-describedby="content-guidance content-hint"',
    );
    expect(markup).toContain("الإنجليزية");
  });
});
