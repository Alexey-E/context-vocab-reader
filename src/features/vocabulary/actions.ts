"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { isDocumentId } from "@/features/documents/queries";
import { processReaderText } from "@/features/reader/text-processing";
import type { ReaderResourceReference } from "@/features/reader/translation-contract";
import {
  type VocabularyField,
  type VocabularyFormValues,
  validateVocabularyForm,
} from "@/features/vocabulary/validation";
import { VOCABULARY_FIELD_LIMITS } from "@/features/vocabulary/constants";
import { findReaderWord } from "@/features/vocabulary/word-source";
import { parseAppLocale, type AppLocale } from "@/i18n/routing";
import { requireUser } from "@/lib/auth/require-user";
import type { Database } from "@/lib/supabase/database.types";
import type { AppErrorPayload } from "@/lib/errors/catalog";
import { createErrorPayload, localizeFieldErrors } from "@/lib/errors/localize";
import { logServerError } from "@/lib/log-server-error";

type LocalizedVocabularyFieldErrors = Partial<
  Record<VocabularyField, AppErrorPayload>
>;

type SavedVocabularyCard = Readonly<{
  imageUrl: string | null;
  meanings: string[];
  note: string | null;
  sourceText: string;
  usageContext: string | null;
  word: string;
}>;

export type SaveVocabularyCardState =
  | Readonly<{ revision: 0; status: "idle" }>
  | Readonly<{
      error: AppErrorPayload;
      fieldErrors?: LocalizedVocabularyFieldErrors;
      revision: number;
      status: "error";
      values: VocabularyFormValues;
    }>
  | Readonly<{
      card: SavedVocabularyCard;
      outcome: "created" | "updated";
      revision: number;
      status: "success";
    }>;

type VocabularySource = Readonly<{
  content: string;
  sourceLanguage: string;
  targetLanguage: string;
}>;

function isSampleSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 100;
}

async function resolveVocabularySource(
  supabase: SupabaseClient<Database>,
  userId: string,
  resource: ReaderResourceReference,
): Promise<VocabularySource | null> {
  if (resource.kind === "document") {
    if (!isDocumentId(resource.id)) return null;

    const { data, error } = await supabase
      .from("documents")
      .select("content, source_language, target_language")
      .eq("id", resource.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      content: data.content,
      sourceLanguage: data.source_language,
      targetLanguage: data.target_language,
    };
  }

  if (!isSampleSlug(resource.slug)) return null;

  const { data, error } = await supabase
    .from("sample_documents")
    .select("content, source_language, target_language")
    .eq("slug", resource.slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    content: data.content,
    sourceLanguage: data.source_language,
    targetLanguage: data.target_language,
  };
}

function initialValues(formData: FormData): VocabularyFormValues {
  const value = (name: string) => {
    const field = formData.get(name);
    return typeof field === "string" ? field : "";
  };

  return {
    imageUrl: value("imageUrl"),
    meanings: value("meanings"),
    note: value("note"),
    usageContext: value("usageContext"),
  };
}

export async function saveVocabularyCard(
  actionLocale: AppLocale,
  resource: ReaderResourceReference,
  tokenId: string,
  previousMeanings: readonly string[],
  previousState: SaveVocabularyCardState,
  formData: FormData,
): Promise<SaveVocabularyCardState> {
  const locale = parseAppLocale(actionLocale);
  const revision = previousState.revision + 1;
  const { supabase, userId } = await requireUser(locale);
  const validation = validateVocabularyForm(formData);

  if (!validation.valid) {
    return {
      error: await createErrorPayload("validation.form_invalid", locale),
      fieldErrors: await localizeFieldErrors(validation.errors, locale),
      revision,
      status: "error",
      values: validation.values,
    };
  }

  try {
    const source = await resolveVocabularySource(supabase, userId, resource);
    const word = source
      ? findReaderWord(
          processReaderText(source.content, source.sourceLanguage),
          tokenId,
        )
      : null;

    if (!source || !word) {
      return {
        error: await createErrorPayload("vocabulary.save_failed", locale),
        revision,
        status: "error",
        values: validation.values,
      };
    }

    const { data: existing, error: readError } = await supabase
      .from("vocabulary_cards")
      .select("id")
      .eq("user_id", userId)
      .eq("source_language", source.sourceLanguage)
      .eq("target_language", source.targetLanguage)
      .eq("word", word.normalizedWord)
      .maybeSingle();

    if (readError) throw readError;

    const result = await supabase.rpc("save_vocabulary_card", {
      input_image_url: validation.input.imageUrl,
      input_note: validation.input.note,
      input_previous_translation: [...previousMeanings],
      input_source_language: source.sourceLanguage,
      input_target_language: source.targetLanguage,
      input_translation: validation.input.meanings,
      input_usage_context: existing
        ? validation.input.usageContext
        : (validation.input.usageContext ??
          word.usageContext.slice(
            0,
            VOCABULARY_FIELD_LIMITS.usageContext.maxLength,
          )),
      input_word: word.normalizedWord,
    });

    if (result.error?.code === "23514") {
      return {
        error: await createErrorPayload("validation.form_invalid", locale),
        fieldErrors: {
          meanings: await createErrorPayload(
            "validation.vocabulary.meanings.invalid",
            locale,
          ),
        },
        revision,
        status: "error",
        values: validation.values,
      };
    }

    if (result.error) throw result.error;

    return {
      card: {
        imageUrl: result.data.image_url,
        meanings: result.data.translation,
        note: result.data.note,
        sourceText: word.sourceText,
        usageContext: result.data.usage_context,
        word: result.data.word,
      },
      outcome: existing ? "updated" : "created",
      revision,
      status: "success",
    };
  } catch (error) {
    logServerError("vocabulary.save_failed", error, {
      resourceKind: resource.kind,
      tokenId,
      userId,
    });

    return {
      error: await createErrorPayload("vocabulary.save_failed", locale),
      revision,
      status: "error",
      values: initialValues(formData),
    };
  }
}
