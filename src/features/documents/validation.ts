import { DOCUMENT_FIELD_LIMITS } from "@/features/documents/constants";
import { isLanguageCode, type LanguageCode } from "@/lib/languages";
import type { AppErrorCode } from "@/lib/errors/catalog";

export type DocumentField =
  "content" | "sourceLanguage" | "targetLanguage" | "title";

export type DocumentFieldErrors = Partial<Record<DocumentField, AppErrorCode>>;

export type ValidDocumentInput = {
  content: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  title: string;
};

export type DocumentFormValues = {
  content: string;
  sourceLanguage: string;
  targetLanguage: string;
  title: string;
};

export type DocumentValidationResult =
  | {
      errors: DocumentFieldErrors;
      valid: false;
      values: DocumentFormValues;
    }
  | {
      input: ValidDocumentInput;
      valid: true;
      values: DocumentFormValues;
    };

function readText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

export function validateDocumentForm(
  formData: FormData,
): DocumentValidationResult {
  const values = {
    content: readText(formData, "content"),
    sourceLanguage: readText(formData, "sourceLanguage"),
    targetLanguage: readText(formData, "targetLanguage"),
    title: readText(formData, "title"),
  };
  const title = values.title.trim();
  const content = values.content;
  const sourceLanguage = values.sourceLanguage.trim();
  const targetLanguage = values.targetLanguage.trim();
  const errors: DocumentFieldErrors = {};

  if (!title) {
    errors.title = "validation.document.title.required";
  } else if (title.length > DOCUMENT_FIELD_LIMITS.title.maxLength) {
    errors.title = "validation.document.title.too_long";
  }

  if (!content.trim()) {
    errors.content = "validation.document.content.required";
  } else if (content.length > DOCUMENT_FIELD_LIMITS.content.maxLength) {
    errors.content = "validation.document.content.too_long";
  }

  if (!isLanguageCode(sourceLanguage)) {
    errors.sourceLanguage = "validation.document.source_language.invalid";
  }

  if (!isLanguageCode(targetLanguage)) {
    errors.targetLanguage = "validation.document.target_language.invalid";
  } else if (sourceLanguage === targetLanguage) {
    errors.targetLanguage = "validation.document.languages_same";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, valid: false, values };
  }

  return {
    input: {
      content,
      sourceLanguage: sourceLanguage as LanguageCode,
      targetLanguage: targetLanguage as LanguageCode,
      title,
    },
    valid: true,
    values,
  };
}
