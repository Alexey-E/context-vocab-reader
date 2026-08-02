import type { AuthError as SupabaseAuthError } from "@supabase/supabase-js";

import { createErrorPayload, type AppErrorCode } from "@/lib/errors/catalog";

type AuthErrorCode = Extract<AppErrorCode, `auth.${string}`>;

const SUPABASE_AUTH_ERROR_CODES: Record<string, AuthErrorCode> = {
  email_not_confirmed: "auth.email_not_confirmed",
  invalid_credentials: "auth.invalid_credentials",
  over_email_send_rate_limit: "auth.rate_limited",
  over_request_rate_limit: "auth.rate_limited",
  user_already_exists: "auth.user_already_exists",
  weak_password: "auth.weak_password",
};

export function mapSupabaseAuthError(error: SupabaseAuthError) {
  return createErrorPayload(
    SUPABASE_AUTH_ERROR_CODES[error.code ?? ""] ?? "auth.failed",
  );
}
