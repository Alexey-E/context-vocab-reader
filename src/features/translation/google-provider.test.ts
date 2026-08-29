import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { TranslationProviderError } from "@/features/translation/errors";
import { GoogleTranslationProvider } from "@/features/translation/google-provider";

const API_KEY = "test-google-key";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

async function expectProviderError(
  promise: Promise<unknown>,
  code: TranslationProviderError["code"],
) {
  try {
    await promise;
    throw new Error("Expected provider request to fail.");
  } catch (error) {
    expect(error).toBeInstanceOf(TranslationProviderError);
    expect((error as TranslationProviderError).code).toBe(code);
    expect((error as Error).message).not.toContain(API_KEY);
  }
}

describe("GoogleTranslationProvider", () => {
  it("sends the documented Basic v2 translation request", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        data: { translations: [{ translatedText: "Hola" }] },
      }),
    );
    const provider = new GoogleTranslationProvider({
      apiKey: API_KEY,
      fetch: fetchMock,
    });

    await expect(
      provider.translate({
        sourceLanguage: " en ",
        targetLanguage: " es ",
        text: "Hello",
      }),
    ).resolves.toEqual({ provider: "google", translatedText: "Hola" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe(
      "https://translation.googleapis.com/language/translate/v2",
    );
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("X-goog-api-key")).toBe(API_KEY);
    expect(new Headers(init?.headers).get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      format: "text",
      q: "Hello",
      source: "en",
      target: "es",
    });
    expect(url.toString()).not.toContain(API_KEY);
  });

  it("discovers supported languages with localized names and direction", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        data: {
          languages: [
            { language: "en", name: "anglais" },
            { language: "ar", name: "arabe" },
          ],
        },
      }),
    );
    const provider = new GoogleTranslationProvider({
      apiKey: API_KEY,
      fetch: fetchMock,
    });

    await expect(
      provider.getSupportedLanguages({ displayLanguage: "fr" }),
    ).resolves.toEqual([
      { code: "en", direction: "ltr", name: "anglais" },
      { code: "ar", direction: "rtl", name: "arabe" },
    ]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe(
      "https://translation.googleapis.com/language/translate/v2/languages?target=fr",
    );
    expect(init?.method).toBe("GET");
    expect(new Headers(init?.headers).get("X-goog-api-key")).toBe(API_KEY);
  });

  it.each([
    [400, "invalid_request"],
    [401, "authentication"],
    [403, "permission"],
    [429, "rate_limited"],
    [500, "unavailable"],
  ] as const)("maps HTTP %i to %s", async (status, code) => {
    const provider = new GoogleTranslationProvider({
      apiKey: API_KEY,
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, status)),
    });

    await expectProviderError(
      provider.translate({
        sourceLanguage: "en",
        targetLanguage: "es",
        text: "Hello",
      }),
      code,
    );
  });

  it.each([
    new Response("not-json", { status: 200 }),
    jsonResponse({ data: { translations: [] } }),
    jsonResponse({ data: { translations: [{ translatedText: "" }] } }),
    jsonResponse({ data: { translations: [{ translatedText: "   " }] } }),
  ])("rejects malformed or empty translation responses", async (response) => {
    const provider = new GoogleTranslationProvider({
      apiKey: API_KEY,
      fetch: vi.fn<typeof fetch>().mockResolvedValue(response),
    });

    await expectProviderError(
      provider.translate({
        sourceLanguage: "en",
        targetLanguage: "es",
        text: "Hello",
      }),
      "invalid_response",
    );
  });

  it("rejects invalid supported-language entries as a provider response error", async () => {
    const provider = new GoogleTranslationProvider({
      apiKey: API_KEY,
      fetch: vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse({
          data: { languages: [{ language: "__invalid_language__" }] },
        }),
      ),
    });

    await expectProviderError(
      provider.getSupportedLanguages(),
      "invalid_response",
    );
  });

  it("maps network failures without exposing credentials", async () => {
    const provider = new GoogleTranslationProvider({
      apiKey: API_KEY,
      fetch: vi
        .fn<typeof fetch>()
        .mockRejectedValue(new TypeError("Network unavailable")),
    });

    await expectProviderError(
      provider.translate({
        sourceLanguage: "en",
        targetLanguage: "es",
        text: "Hello",
      }),
      "unavailable",
    );
  });

  it("aborts a request after the configured timeout", async () => {
    const fetchMock = vi.fn<typeof fetch>((_url, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(init.signal?.reason);
        });
      });
    });
    const provider = new GoogleTranslationProvider({
      apiKey: API_KEY,
      fetch: fetchMock,
      timeoutMs: 5,
    });

    await expectProviderError(
      provider.translate({
        sourceLanguage: "en",
        targetLanguage: "es",
        text: "Hello",
      }),
      "timeout",
    );
  });

  it("rejects an empty API key before making a request", () => {
    expect(() => new GoogleTranslationProvider({ apiKey: "   " })).toThrowError(
      TranslationProviderError,
    );
  });
});
