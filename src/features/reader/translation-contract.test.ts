import { describe, expect, it } from "vitest";

import { parseReaderTranslationRequest } from "@/features/reader/translation-contract";

describe("reader translation request", () => {
  it("accepts document and sample references without language overrides", () => {
    expect(
      parseReaderTranslationRequest({
        locale: "en",
        resource: {
          id: "11111111-aaaa-4111-8111-111111111111",
          kind: "document",
        },
        text: "Hello",
      }),
    ).toMatchObject({ resource: { kind: "document" }, text: "Hello" });

    expect(
      parseReaderTranslationRequest({
        locale: "ru",
        resource: { kind: "sample", slug: "english-context" },
        text: "Hello",
      }),
    ).toMatchObject({ resource: { kind: "sample" }, text: "Hello" });
  });

  it.each([
    null,
    {},
    { locale: "en", resource: {}, text: "Hello" },
    {
      locale: "de",
      resource: { kind: "sample", slug: "english-context" },
      text: "Hello",
    },
    {
      locale: "en",
      resource: {
        kind: "sample",
        slug: "english-context",
        sourceLanguage: "en",
      },
      text: "Hello",
    },
    {
      locale: "en",
      resource: { kind: "sample", slug: "english-context" },
      sourceLanguage: "en",
      text: "Hello",
    },
  ])("rejects malformed input and client language overrides", (value) => {
    expect(parseReaderTranslationRequest(value)).toBeNull();
  });
});
