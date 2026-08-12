import { AUTH_FIELD_LIMITS } from "@/features/auth/constants";
import { createErrorPayload, type AppErrorPayload } from "@/lib/errors/catalog";

export type Credentials = {
  email: string;
  password: string;
};

export type CredentialErrors = Partial<
  Record<keyof Credentials, AppErrorPayload>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(
  formData: FormData,
  mode: "sign-in" | "sign-up",
) {
  const credentials = {
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
  const errors: CredentialErrors = {};

  if (
    !EMAIL_PATTERN.test(credentials.email) ||
    credentials.email.length > AUTH_FIELD_LIMITS.email.maxLength
  ) {
    errors.email = createErrorPayload("validation.email.invalid");
  }

  if (credentials.password.length < AUTH_FIELD_LIMITS.password.minLength) {
    errors.password = createErrorPayload("validation.password.too_short");
  } else if (
    credentials.password.length > AUTH_FIELD_LIMITS.password.maxLength
  ) {
    errors.password = createErrorPayload("validation.password.too_long");
  } else if (mode === "sign-up" && credentials.password.trim().length === 0) {
    errors.password = createErrorPayload("validation.password.only_spaces");
  }

  return {
    credentials,
    errors,
    valid: Object.keys(errors).length === 0,
  };
}
