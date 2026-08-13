import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import messages from "@messages/ar.json";

import { DeleteDocumentButton } from "@/features/documents/delete-document-button";

describe("DeleteDocumentButton", () => {
  it("isolates a document title in visible and accessible text", () => {
    const markup = renderToStaticMarkup(
      <NextIntlClientProvider locale="ar" messages={messages} timeZone="UTC">
        <DeleteDocumentButton
          deleteAction={async () => ({ status: "idle" })}
          documentTitle="English title"
        />
      </NextIntlClientProvider>,
    );

    expect(markup).toContain('<bdi dir="auto">English title</bdi>');
    expect(markup).toContain(`aria-label="حذف \u2068English title\u2069"`);
  });
});
