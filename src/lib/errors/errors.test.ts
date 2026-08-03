import { describe, expect, it } from "vitest";

import { createErrorPayload, parseErrorPayload } from "@/lib/errors/catalog";

describe("the application error catalog", () => {
  it("creates a payload for a known code", () => {
    expect(createErrorPayload("auth.invalid_credentials")).toEqual({
      code: "auth.invalid_credentials",
      message: "The email or password is incorrect.",
    });
  });

  it("ignores unknown codes from URL parameters", () => {
    expect(parseErrorPayload("auth.oauth_callback_failed")).toEqual(
      createErrorPayload("auth.oauth_callback_failed"),
    );
    expect(parseErrorPayload("auth.made_up")).toBeUndefined();
  });
});
