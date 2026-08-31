import { VOCABULARY_FIELD_LIMITS } from "@/features/vocabulary/constants";
import type { AppErrorCode } from "@/lib/errors/catalog";

export type VocabularyField = "imageUrl" | "meanings" | "note" | "usageContext";

export type VocabularyFormValues = Readonly<{
  imageUrl: string;
  meanings: string;
  note: string;
  usageContext: string;
}>;

type VocabularyInput = Readonly<{
  imageUrl: string | null;
  meanings: string[];
  note: string | null;
  usageContext: string | null;
}>;

export type VocabularyValidationResult =
  | Readonly<{
      errors: Partial<Record<VocabularyField, AppErrorCode>>;
      valid: false;
      values: VocabularyFormValues;
    }>
  | Readonly<{
      input: VocabularyInput;
      valid: true;
      values: VocabularyFormValues;
    }>;

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateVocabularyForm(
  formData: FormData,
): VocabularyValidationResult {
  const values = {
    imageUrl: readText(formData, "imageUrl"),
    meanings: readText(formData, "meanings"),
    note: readText(formData, "note"),
    usageContext: readText(formData, "usageContext"),
  };
  const meanings = values.meanings
    .split(",")
    .map((meaning) => meaning.normalize("NFC").trim())
    .filter(Boolean);
  const imageUrl = values.imageUrl.trim();
  const note = values.note.trim();
  const usageContext = values.usageContext.trim();
  const errors: Partial<Record<VocabularyField, AppErrorCode>> = {};

  if (meanings.length === 0) {
    errors.meanings = "validation.vocabulary.meanings.required";
  } else if (
    meanings.length > VOCABULARY_FIELD_LIMITS.meaning.maxCount ||
    meanings.some(
      (meaning) => meaning.length > VOCABULARY_FIELD_LIMITS.meaning.maxLength,
    )
  ) {
    errors.meanings = "validation.vocabulary.meanings.invalid";
  }

  if (usageContext.length > VOCABULARY_FIELD_LIMITS.usageContext.maxLength) {
    errors.usageContext = "validation.vocabulary.context.too_long";
  }

  if (note.length > VOCABULARY_FIELD_LIMITS.note.maxLength) {
    errors.note = "validation.vocabulary.note.too_long";
  }

  if (
    imageUrl &&
    (imageUrl.length > VOCABULARY_FIELD_LIMITS.imageUrl.maxLength ||
      !isHttpUrl(imageUrl))
  ) {
    errors.imageUrl = "validation.vocabulary.image_url.invalid";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, valid: false, values };
  }

  return {
    input: {
      imageUrl: imageUrl || null,
      meanings,
      note: note || null,
      usageContext: usageContext || null,
    },
    valid: true,
    values,
  };
}

export function mergeMeanings(
  existing: readonly string[],
  additions: readonly string[],
  targetLanguage: string,
) {
  const meanings: string[] = [];
  const keys = new Set<string>();

  for (const meaning of [...existing, ...additions]) {
    const value = meaning.normalize("NFC").trim();
    let key: string;

    try {
      key = value.normalize("NFKC").toLocaleLowerCase(targetLanguage);
    } catch {
      key = value.normalize("NFKC").toLowerCase();
    }

    if (value && !keys.has(key)) {
      keys.add(key);
      meanings.push(value);
    }
  }

  return meanings;
}
