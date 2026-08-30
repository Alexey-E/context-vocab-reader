import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createErrorPayload: vi.fn(async (code: string) => ({
    code,
    message: `localized:${code}`,
  })),
  translateReaderText: vi.fn(),
}));

vi.mock("@/features/reader/translation.server", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@/features/reader/translation.server")
  >()),
  translateReaderText: mocks.translateReaderText,
}));
vi.mock("@/lib/errors/localize", () => ({
  createErrorPayload: mocks.createErrorPayload,
}));

import { POST } from "@/app/api/translation/route";
import { TranslationProviderError } from "@/features/translation/errors";

function request(body: unknown) {
  return new Request("http://127.0.0.1:3000/api/translation", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

const validRequest = {
  locale: "en",
  resource: { kind: "sample", slug: "english-context" },
  text: "Hello",
} as const;

describe("POST /api/translation", () => {
  beforeEach(() => {
    mocks.createErrorPayload.mockClear();
    mocks.translateReaderText.mockReset();
  });

  it("returns the safe provider result and cache status", async () => {
    mocks.translateReaderText.mockResolvedValue({
      cached: true,
      result: { provider: "mock", translatedText: "Hola" },
    });

    const response = await POST(request(validRequest));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      cached: true,
      provider: "mock",
      status: "success",
      translatedText: "Hola",
    });
    expect(mocks.translateReaderText).toHaveBeenCalledWith(validRequest);
  });

  it("rejects client-provided language overrides", async () => {
    const response = await POST(
      request({ ...validRequest, sourceLanguage: "fr" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "translation.invalid_request" },
      status: "error",
    });
    expect(mocks.translateReaderText).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid_request", 400, "translation.invalid_request"],
    ["rate_limited", 429, "translation.rate_limited"],
    ["timeout", 504, "translation.timeout"],
    ["unavailable", 503, "translation.unavailable"],
  ] as const)(
    "maps the %s provider error to a safe response",
    async (providerCode, status, appCode) => {
      mocks.translateReaderText.mockRejectedValue(
        new TranslationProviderError(providerCode),
      );

      const response = await POST(request(validRequest));

      expect(response.status).toBe(status);
      await expect(response.json()).resolves.toEqual({
        error: { code: appCode, message: `localized:${appCode}` },
        status: "error",
      });
    },
  );
});
