import { NextResponse } from "next/server";

import {
  ReaderTranslationError,
  translateReaderText,
} from "@/features/reader/translation.server";
import { parseReaderTranslationRequest } from "@/features/reader/translation-contract";
import {
  mapTranslationError,
  TranslationProviderError,
} from "@/features/translation/errors";
import { parseAppLocale } from "@/i18n/routing";
import type { AppErrorCode } from "@/lib/errors/catalog";
import { createErrorPayload } from "@/lib/errors/localize";
import { logServerError } from "@/lib/log-server-error";

function getReaderErrorStatus(error: ReaderTranslationError) {
  if (error.code === "unauthorized") return 401;
  if (error.code === "not_found") return 404;
  if (error.code === "unavailable") return 503;
  return 400;
}

function getReaderErrorAppCode(error: ReaderTranslationError): AppErrorCode {
  return error.code === "unavailable"
    ? "translation.unavailable"
    : "translation.invalid_request";
}

function getProviderErrorStatus(error: TranslationProviderError) {
  if (error.code === "rate_limited") return 429;
  if (error.code === "timeout") return 504;
  if (error.code === "invalid_request") return 400;
  return 503;
}

async function errorResponse(
  code: AppErrorCode,
  locale: ReturnType<typeof parseAppLocale>,
  status: number,
) {
  return NextResponse.json(
    { error: await createErrorPayload(code, locale), status: "error" },
    { headers: { "Cache-Control": "no-store" }, status },
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("translation.invalid_request", "en", 400);
  }

  const input = parseReaderTranslationRequest(body);
  const locale = parseAppLocale(input?.locale);

  if (!input) {
    return errorResponse("translation.invalid_request", locale, 400);
  }

  try {
    const { cached, result } = await translateReaderText(input);

    return NextResponse.json(
      {
        cached,
        provider: result.provider,
        status: "success",
        translatedText: result.translatedText,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof TranslationProviderError) {
      return errorResponse(
        mapTranslationError(error),
        locale,
        getProviderErrorStatus(error),
      );
    }

    if (error instanceof ReaderTranslationError) {
      return errorResponse(
        getReaderErrorAppCode(error),
        locale,
        getReaderErrorStatus(error),
      );
    }

    logServerError("reader.translation.unexpected_failure", error, {});
    return errorResponse("translation.failed", locale, 500);
  }
}
