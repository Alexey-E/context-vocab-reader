import type { AppErrorCode } from "@/lib/errors/catalog";

export type TranslationErrorCode =
  | "authentication"
  | "configuration"
  | "invalid_request"
  | "invalid_response"
  | "permission"
  | "rate_limited"
  | "timeout"
  | "unavailable";

type TranslationAppErrorCode = Extract<AppErrorCode, `translation.${string}`>;

const TRANSLATION_APP_ERROR_CODES = {
  authentication: "translation.failed",
  configuration: "translation.failed",
  invalid_request: "translation.invalid_request",
  invalid_response: "translation.failed",
  permission: "translation.failed",
  rate_limited: "translation.rate_limited",
  timeout: "translation.timeout",
  unavailable: "translation.unavailable",
} as const satisfies Record<TranslationErrorCode, TranslationAppErrorCode>;

export class TranslationProviderError extends Error {
  readonly code: TranslationErrorCode;
  readonly status?: number;

  constructor(
    code: TranslationErrorCode,
    options?: Readonly<{ cause?: unknown; status?: number }>,
  ) {
    // This technical error never crosses the server boundary. The feature
    // boundary maps its code to a localized AppErrorPayload.
    super(code, { cause: options?.cause });
    this.name = "TranslationProviderError";
    this.code = code;
    this.status = options?.status;
  }
}

export function mapTranslationError(error: TranslationProviderError) {
  return TRANSLATION_APP_ERROR_CODES[error.code];
}
