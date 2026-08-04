import {
  DOCUMENT_CONTENT_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
} from "@/features/documents/constants";
import { isLanguageCode, type LanguageCode } from "@/lib/languages";
import { createErrorPayload, type AppErrorPayload } from "@/lib/errors/catalog";

export type DocumentField =
  "content" | "sourceLanguage" | "targetLanguage" | "title";

export type DocumentFieldErrors = Partial<
  Record<DocumentField, AppErrorPayload>
>;

export type ValidDocumentInput = {
  content: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  title: string;
};

export type DocumentValidationResult =
  | { errors: DocumentFieldErrors; valid: false }
  | { input: ValidDocumentInput; valid: true };

function readText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

export function validateDocumentForm(
  formData: FormData,
): DocumentValidationResult {
  const title = readText(formData, "title").trim();
  const content = readText(formData, "content");
  const sourceLanguage = readText(formData, "sourceLanguage").trim();
  const targetLanguage = readText(formData, "targetLanguage").trim();
  const errors: DocumentFieldErrors = {};

  if (!title) {
    errors.title = createErrorPayload("validation.document.title.required");
  } else if (title.length > DOCUMENT_TITLE_MAX_LENGTH) {
    errors.title = createErrorPayload("validation.document.title.too_long");
  }

  if (!content.trim()) {
    errors.content = createErrorPayload("validation.document.content.required");
  } else if (content.length > DOCUMENT_CONTENT_MAX_LENGTH) {
    errors.content = createErrorPayload("validation.document.content.too_long");
  }

  if (!isLanguageCode(sourceLanguage)) {
    errors.sourceLanguage = createErrorPayload(
      "validation.document.source_language.invalid",
    );
  }

  if (!isLanguageCode(targetLanguage)) {
    errors.targetLanguage = createErrorPayload(
      "validation.document.target_language.invalid",
    );
  } else if (sourceLanguage === targetLanguage) {
    errors.targetLanguage = createErrorPayload(
      "validation.document.languages_same",
    );
  }

  if (Object.keys(errors).length > 0) {
    return { errors, valid: false };
  }

  return {
    input: {
      content,
      sourceLanguage: sourceLanguage as LanguageCode,
      targetLanguage: targetLanguage as LanguageCode,
      title,
    },
    valid: true,
  };
}
