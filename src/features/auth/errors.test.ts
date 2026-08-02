import type { AuthError as SupabaseAuthError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { mapSupabaseAuthError } from "@/features/auth/errors";
import { createErrorPayload } from "@/lib/errors/catalog";

function providerError(code: string) {
  return Object.assign(new Error(`Supabase detail for ${code}`), {
    code,
  }) as unknown as SupabaseAuthError;
}

describe("mapSupabaseAuthError", () => {
  it.each([
    ["email_not_confirmed", "auth.email_not_confirmed"],
    ["invalid_credentials", "auth.invalid_credentials"],
    ["over_email_send_rate_limit", "auth.rate_limited"],
    ["over_request_rate_limit", "auth.rate_limited"],
    ["user_already_exists", "auth.user_already_exists"],
    ["weak_password", "auth.weak_password"],
  ] as const)("maps %s to %s", (providerCode, appCode) => {
    expect(mapSupabaseAuthError(providerError(providerCode))).toEqual(
      createErrorPayload(appCode),
    );
  });

  it("maps an unknown provider code to the safe auth fallback", () => {
    expect(mapSupabaseAuthError(providerError("new_provider_code")).code).toBe(
      "auth.failed",
    );
  });
});
