import { describe, expect, it } from "vitest";

import {
  mapTranslationError,
  TranslationProviderError,
  type TranslationErrorCode,
} from "@/features/translation/errors";

describe("translation error mapping", () => {
  it.each([
    ["authentication", "translation.failed"],
    ["configuration", "translation.failed"],
    ["invalid_request", "translation.invalid_request"],
    ["invalid_response", "translation.failed"],
    ["permission", "translation.failed"],
    ["rate_limited", "translation.rate_limited"],
    ["timeout", "translation.timeout"],
    ["unavailable", "translation.unavailable"],
  ] as const)("maps %s to %s", (providerCode, appCode) => {
    expect(
      mapTranslationError(new TranslationProviderError(providerCode)),
    ).toBe(appCode);
  });

  it("keeps technical causes server-side without using them as messages", () => {
    const providerCode: TranslationErrorCode = "unavailable";
    const cause = new Error("Upstream detail");
    const error = new TranslationProviderError(providerCode, { cause });

    expect(error.message).toBe(providerCode);
    expect(error.cause).toBe(cause);
    expect(error.message).not.toContain(cause.message);
  });
});
