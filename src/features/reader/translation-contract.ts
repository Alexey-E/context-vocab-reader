import { APP_LOCALES, type AppLocale } from "@/i18n/routing";
import type { AppErrorPayload } from "@/lib/errors/catalog";

export type ReaderResourceReference =
  | Readonly<{ id: string; kind: "document" }>
  | Readonly<{ kind: "sample"; slug: string }>;

export type ReaderTranslationRequest = Readonly<{
  locale: AppLocale;
  resource: ReaderResourceReference;
  text: string;
}>;

export type ReaderTranslationResponse =
  | Readonly<{
      cached: boolean;
      provider: "google" | "mock";
      status: "success";
      translatedText: string;
    }>
  | Readonly<{
      error: AppErrorPayload;
      status: "error";
    }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const actualKeys = Object.keys(value);
  return (
    actualKeys.length === keys.length &&
    actualKeys.every((key) => keys.includes(key))
  );
}

export function parseReaderTranslationRequest(
  value: unknown,
): ReaderTranslationRequest | null {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ["locale", "resource", "text"]) ||
    typeof value.locale !== "string" ||
    !APP_LOCALES.includes(value.locale as AppLocale) ||
    typeof value.text !== "string" ||
    !isRecord(value.resource)
  ) {
    return null;
  }

  const resource = value.resource;
  if (
    resource.kind === "document" &&
    hasOnlyKeys(resource, ["id", "kind"]) &&
    typeof resource.id === "string"
  ) {
    return {
      locale: value.locale as AppLocale,
      resource: { id: resource.id, kind: "document" },
      text: value.text,
    };
  }

  if (
    resource.kind === "sample" &&
    hasOnlyKeys(resource, ["kind", "slug"]) &&
    typeof resource.slug === "string"
  ) {
    return {
      locale: value.locale as AppLocale,
      resource: { kind: "sample", slug: resource.slug },
      text: value.text,
    };
  }

  return null;
}
