"use server";

import { revalidatePath } from "next/cache";

import type {
  DocumentField,
  DocumentFormValues,
} from "@/features/documents/validation";
import { validateDocumentForm } from "@/features/documents/validation";
import { requireUser } from "@/lib/auth/require-user";
import { getPathname, redirect } from "@/i18n/navigation";
import { parseAppLocale, type AppLocale } from "@/i18n/routing";
import type { AppErrorPayload } from "@/lib/errors/catalog";
import { createErrorPayload, localizeFieldErrors } from "@/lib/errors/localize";

type LocalizedDocumentFieldErrors = Partial<
  Record<DocumentField, AppErrorPayload>
>;

export type DocumentFormState =
  | { revision: 0; status: "idle" }
  | {
      error: AppErrorPayload;
      fieldErrors?: LocalizedDocumentFieldErrors;
      revision: number;
      status: "error";
      values: DocumentFormValues;
    };

export type DeleteDocumentState =
  { status: "idle" } | { error: AppErrorPayload; status: "error" };

export async function createDocument(
  actionLocale: AppLocale,
  previousState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const locale = parseAppLocale(actionLocale);
  const result = validateDocumentForm(formData);
  const revision = previousState.revision + 1;

  if (!result.valid) {
    return {
      error: await createErrorPayload("validation.form_invalid", locale),
      fieldErrors: await localizeFieldErrors(result.errors, locale),
      revision,
      status: "error",
      values: result.values,
    };
  }

  const { supabase, userId } = await requireUser(locale);
  const { data, error } = await supabase
    .from("documents")
    .insert({
      content: result.input.content,
      source_language: result.input.sourceLanguage,
      target_language: result.input.targetLanguage,
      title: result.input.title,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error) {
    return {
      error: await createErrorPayload("documents.create_failed", locale),
      revision,
      status: "error",
      values: result.values,
    };
  }

  revalidatePath(getPathname({ href: "/documents", locale }));
  return redirect({ href: `/documents/${data.id}`, locale });
}

export async function deleteDocument(
  actionLocale: AppLocale,
  documentId: string,
  _previousState: DeleteDocumentState,
  _formData: FormData,
): Promise<DeleteDocumentState> {
  void _previousState;
  void _formData;

  const locale = parseAppLocale(actionLocale);
  const { supabase, userId } = await requireUser(locale);
  const { data, error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      error: await createErrorPayload("documents.delete_failed", locale),
      status: "error",
    };
  }

  revalidatePath(getPathname({ href: "/documents", locale }));
  return redirect({ href: "/documents", locale });
}
