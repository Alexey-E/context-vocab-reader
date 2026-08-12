import { AUTH_FIELD_LIMITS } from "@/features/auth/constants";
import { DOCUMENT_FIELD_LIMITS } from "@/features/documents/constants";

export const APP_ERROR_MESSAGES = {
  "auth.confirmation_failed":
    "The confirmation link is invalid or expired. Request a new one and try again.",
  "auth.email_not_confirmed": "Confirm your email before signing in.",
  "auth.failed": "Authentication failed. Please try again.",
  "auth.invalid_credentials": "The email or password is incorrect.",
  "auth.oauth_callback_failed":
    "Google sign-in could not be completed. Please try again.",
  "auth.oauth_start_failed":
    "Google sign-in could not be started. Please try again.",
  "auth.rate_limited": "Too many attempts. Please wait a moment and try again.",
  "auth.signout_failed": "Sign-out could not be completed. Please try again.",
  "auth.user_already_exists": "An account with this email already exists.",
  "auth.weak_password": "Choose a stronger password.",
  "documents.create_failed":
    "The document could not be created. Please try again.",
  "documents.delete_failed":
    "The document could not be deleted. Please try again.",
  "validation.document.content.required": "Enter the document text.",
  "validation.document.content.too_long": `Document text must contain at most ${DOCUMENT_FIELD_LIMITS.content.maxLength.toLocaleString("en-US")} characters.`,
  "validation.document.languages_same":
    "Choose different source and target languages.",
  "validation.document.source_language.invalid":
    "Choose a supported source language.",
  "validation.document.target_language.invalid":
    "Choose a supported target language.",
  "validation.document.title.required": "Enter a document title.",
  "validation.document.title.too_long": `Title must contain at most ${DOCUMENT_FIELD_LIMITS.title.maxLength} characters.`,
  "validation.email.invalid": "Enter a valid email address.",
  "validation.form_invalid": "Check the highlighted fields.",
  "validation.password.only_spaces": "Password cannot contain only spaces.",
  "validation.password.too_long": `Password must contain at most ${AUTH_FIELD_LIMITS.password.maxLength} characters.`,
  "validation.password.too_short": `Password must contain at least ${AUTH_FIELD_LIMITS.password.minLength} characters.`,
} as const satisfies Record<string, string>;

export type AppErrorCode = keyof typeof APP_ERROR_MESSAGES;

export type AppErrorPayload = Readonly<{
  code: AppErrorCode;
  message: string;
}>;

function isAppErrorCode(value: unknown): value is AppErrorCode {
  return typeof value === "string" && Object.hasOwn(APP_ERROR_MESSAGES, value);
}

export function createErrorPayload(code: AppErrorCode): AppErrorPayload {
  return {
    code,
    message: APP_ERROR_MESSAGES[code],
  };
}

export function parseErrorPayload(value: unknown) {
  return isAppErrorCode(value) ? createErrorPayload(value) : undefined;
}
