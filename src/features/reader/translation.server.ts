import "server-only";

import type { TranslationProvider } from "@/features/translation/contract";
import { TRANSLATION_POLICY } from "@/features/translation/constants";
import {
  createTranslationCacheKey,
  translationCache,
} from "@/features/translation/cache";
import { TranslationProviderError } from "@/features/translation/errors";
import { getTranslationProvider } from "@/features/translation/provider.server";
import { countCodePoints } from "@/features/translation/validation";
import type { ReaderResourceReference } from "@/features/reader/translation-contract";
import { getAuthContext } from "@/lib/auth/require-user";
import { logServerError } from "@/lib/log-server-error";
import { createClient } from "@/lib/supabase/server";

type LanguagePair = Readonly<{
  sourceLanguage: string;
  targetLanguage: string;
}>;

export type ReaderTranslationErrorCode =
  "invalid_request" | "not_found" | "unauthorized" | "unavailable";

export class ReaderTranslationError extends Error {
  readonly code: ReaderTranslationErrorCode;

  constructor(code: ReaderTranslationErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.name = "ReaderTranslationError";
    this.code = code;
  }
}

function isDocumentId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isSampleSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 100;
}

export async function resolveReaderLanguagePair(
  resource: ReaderResourceReference,
): Promise<LanguagePair> {
  if (resource.kind === "document") {
    if (!isDocumentId(resource.id)) {
      throw new ReaderTranslationError("invalid_request");
    }

    const auth = await getAuthContext();
    if (!auth.authenticated) {
      throw new ReaderTranslationError("unauthorized");
    }

    const { data, error } = await auth.supabase
      .from("documents")
      .select("source_language, target_language")
      .eq("id", resource.id)
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (error) {
      logServerError("reader.translation.document_context_failed", error, {
        documentId: resource.id,
        userId: auth.userId,
      });
      throw new ReaderTranslationError("unavailable", { cause: error });
    }

    if (!data) throw new ReaderTranslationError("not_found");

    return {
      sourceLanguage: data.source_language,
      targetLanguage: data.target_language,
    };
  }

  if (!isSampleSlug(resource.slug)) {
    throw new ReaderTranslationError("invalid_request");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sample_documents")
    .select("source_language, target_language")
    .eq("slug", resource.slug)
    .maybeSingle();

  if (error) {
    logServerError("reader.translation.sample_context_failed", error, {
      sampleSlug: resource.slug,
    });
    throw new ReaderTranslationError("unavailable", { cause: error });
  }

  if (!data) throw new ReaderTranslationError("not_found");

  return {
    sourceLanguage: data.source_language,
    targetLanguage: data.target_language,
  };
}

type TranslateReaderTextDependencies = Readonly<{
  getLanguagePair?: (
    resource: ReaderResourceReference,
  ) => Promise<LanguagePair>;
  getProvider?: () => TranslationProvider;
  getOrCreate?: typeof translationCache.getOrCreate;
}>;

export async function translateReaderText(
  input: Readonly<{
    resource: ReaderResourceReference;
    text: string;
  }>,
  dependencies: TranslateReaderTextDependencies = {},
) {
  const text = input.text.trim();

  if (!text || countCodePoints(text) > TRANSLATION_POLICY.text.maxCodePoints) {
    throw new TranslationProviderError("invalid_request");
  }

  const getLanguagePair =
    dependencies.getLanguagePair ?? resolveReaderLanguagePair;
  const languagePair = await getLanguagePair(input.resource);
  const provider = (dependencies.getProvider ?? getTranslationProvider)();
  const key = createTranslationCacheKey({
    provider: provider.id,
    sourceLanguage: languagePair.sourceLanguage,
    targetLanguage: languagePair.targetLanguage,
    text,
  });
  const getOrCreate =
    dependencies.getOrCreate ??
    translationCache.getOrCreate.bind(translationCache);

  return getOrCreate(key, () =>
    provider.translate({
      sourceLanguage: languagePair.sourceLanguage,
      targetLanguage: languagePair.targetLanguage,
      text,
    }),
  );
}
