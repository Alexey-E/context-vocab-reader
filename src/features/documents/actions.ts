"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { DocumentFieldErrors } from "@/features/documents/validation";
import { validateDocumentForm } from "@/features/documents/validation";
import { requireUser } from "@/lib/auth/require-user";
import { createErrorPayload, type AppErrorPayload } from "@/lib/errors/catalog";

export type DocumentFormState =
  | { status: "idle" }
  | {
      error: AppErrorPayload;
      fieldErrors?: DocumentFieldErrors;
      status: "error";
    };

export type DeleteDocumentState =
  { status: "idle" } | { error: AppErrorPayload; status: "error" };

export async function createDocument(
  _previousState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const result = validateDocumentForm(formData);

  if (!result.valid) {
    return {
      error: createErrorPayload("validation.form_invalid"),
      fieldErrors: result.errors,
      status: "error",
    };
  }

  const { supabase, userId } = await requireUser();
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
      error: createErrorPayload("documents.create_failed"),
      status: "error",
    };
  }

  revalidatePath("/documents");
  redirect(`/documents/${data.id}`);
}

export async function deleteDocument(
  documentId: string,
  _previousState: DeleteDocumentState,
  _formData: FormData,
): Promise<DeleteDocumentState> {
  void _previousState;
  void _formData;

  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      error: createErrorPayload("documents.delete_failed"),
      status: "error",
    };
  }

  revalidatePath("/documents");
  redirect("/documents");
}
