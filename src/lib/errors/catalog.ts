import { AUTH_FIELD_LIMITS } from "@/features/auth/constants";
import { DOCUMENT_FIELD_LIMITS } from "@/features/documents/constants";

type ErrorDefinition = Readonly<{
  key: string;
  values?: Readonly<Record<string, number>>;
}>;

export const APP_ERROR_DEFINITIONS = {
  "auth.confirmation_failed": { key: "auth.confirmationFailed" },
  "auth.email_not_confirmed": { key: "auth.emailNotConfirmed" },
  "auth.failed": { key: "auth.failed" },
  "auth.invalid_credentials": { key: "auth.invalidCredentials" },
  "auth.oauth_callback_failed": { key: "auth.oauthCallbackFailed" },
  "auth.oauth_start_failed": { key: "auth.oauthStartFailed" },
  "auth.rate_limited": { key: "auth.rateLimited" },
  "auth.signout_failed": { key: "auth.signoutFailed" },
  "auth.user_already_exists": { key: "auth.userAlreadyExists" },
  "auth.weak_password": { key: "auth.weakPassword" },
  "documents.create_failed": { key: "documents.createFailed" },
  "documents.delete_failed": { key: "documents.deleteFailed" },
  "translation.failed": { key: "translation.failed" },
  "translation.invalid_request": { key: "translation.invalidRequest" },
  "translation.rate_limited": { key: "translation.rateLimited" },
  "translation.timeout": { key: "translation.timeout" },
  "translation.unavailable": { key: "translation.unavailable" },
  "validation.document.content.required": {
    key: "validation.contentRequired",
  },
  "validation.document.content.too_long": {
    key: "validation.contentTooLong",
    values: { max: DOCUMENT_FIELD_LIMITS.content.maxLength },
  },
  "validation.document.languages_same": {
    key: "validation.languagesSame",
  },
  "validation.document.source_language.invalid": {
    key: "validation.sourceLanguageInvalid",
  },
  "validation.document.target_language.invalid": {
    key: "validation.targetLanguageInvalid",
  },
  "validation.document.title.required": {
    key: "validation.titleRequired",
  },
  "validation.document.title.too_long": {
    key: "validation.titleTooLong",
    values: { max: DOCUMENT_FIELD_LIMITS.title.maxLength },
  },
  "validation.email.invalid": { key: "validation.emailInvalid" },
  "validation.form_invalid": { key: "validation.formInvalid" },
  "validation.password.only_spaces": {
    key: "validation.passwordOnlySpaces",
  },
  "validation.password.too_long": {
    key: "validation.passwordTooLong",
    values: { max: AUTH_FIELD_LIMITS.password.maxLength },
  },
  "validation.password.too_short": {
    key: "validation.passwordTooShort",
    values: { min: AUTH_FIELD_LIMITS.password.minLength },
  },
} as const satisfies Record<string, ErrorDefinition>;

export type AppErrorCode = keyof typeof APP_ERROR_DEFINITIONS;

export type AppErrorPayload = Readonly<{
  code: AppErrorCode;
  message: string;
}>;

export type AppErrorTranslator = (
  key: (typeof APP_ERROR_DEFINITIONS)[AppErrorCode]["key"],
  values?: Readonly<Record<string, number>>,
) => string;

export function isAppErrorCode(value: unknown): value is AppErrorCode {
  return (
    typeof value === "string" && Object.hasOwn(APP_ERROR_DEFINITIONS, value)
  );
}

export function parseAppErrorCode(value: unknown) {
  return isAppErrorCode(value) ? value : undefined;
}

export function formatErrorPayload(
  code: AppErrorCode,
  translate: AppErrorTranslator,
): AppErrorPayload {
  const definition: ErrorDefinition = APP_ERROR_DEFINITIONS[code];

  return {
    code,
    message: translate(
      definition.key as AppErrorTranslator extends (
        key: infer Key,
        ...args: never[]
      ) => string
        ? Key
        : never,
      definition.values,
    ),
  };
}
