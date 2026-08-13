import "server-only";

import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

import {
  formatErrorPayload,
  type AppErrorCode,
  type AppErrorPayload,
  type AppErrorTranslator,
} from "@/lib/errors/catalog";

export async function createErrorPayload(
  code: AppErrorCode,
  locale: Locale,
): Promise<AppErrorPayload> {
  const translations = await getTranslations({
    locale,
    namespace: "Errors",
  });
  const translate: AppErrorTranslator = (key, values) =>
    translations(key, values);

  return formatErrorPayload(code, translate);
}

export async function localizeFieldErrors<Field extends string>(
  errors: Partial<Record<Field, AppErrorCode>>,
  locale: Locale,
): Promise<Partial<Record<Field, AppErrorPayload>>> {
  const entries = await Promise.all(
    Object.entries(errors).map(async ([field, code]) => [
      field,
      await createErrorPayload(code as AppErrorCode, locale),
    ]),
  );

  return Object.fromEntries(entries) as Partial<Record<Field, AppErrorPayload>>;
}
