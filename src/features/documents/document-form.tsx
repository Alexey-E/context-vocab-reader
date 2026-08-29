"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import type { DocumentFormState } from "@/features/documents/actions";
import { DOCUMENT_FIELD_LIMITS } from "@/features/documents/constants";
import { LanguageComboBox } from "@/features/documents/language-combobox";
import type { DocumentFormValues } from "@/features/documents/validation";
import type { SupportedLanguage } from "@/features/translation/contract";
import { getLanguageDirection } from "@/lib/languages";
import { Link } from "@/i18n/navigation";

const initialState: DocumentFormState = { revision: 0, status: "idle" };

type DocumentFormProps = Readonly<{
  createAction: (
    previousState: DocumentFormState,
    formData: FormData,
  ) => Promise<DocumentFormState>;
  initialLanguagePair: Readonly<{
    sourceLanguage: string;
    targetLanguage: string;
  }>;
  languages: readonly SupportedLanguage[];
}>;

export function DocumentForm({
  createAction,
  initialLanguagePair,
  languages,
}: DocumentFormProps) {
  const t = useTranslations("Documents.form");
  const common = useTranslations("Common");
  const initialValues: DocumentFormValues = {
    content: "",
    ...initialLanguagePair,
    title: "",
  };
  const [state, formAction, pending] = useActionState(
    createAction,
    initialState,
  );
  const [sourceLanguage, setSourceLanguage] = useState(
    initialLanguagePair.sourceLanguage,
  );
  const [targetLanguage, setTargetLanguage] = useState(
    initialLanguagePair.targetLanguage,
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : initialValues;
  const sourceDirection = getLanguageDirection(sourceLanguage);
  const contentDescribedBy = [
    "content-guidance",
    "content-hint",
    fieldErrors?.content ? "content-error" : null,
  ]
    .filter(Boolean)
    .join(" ");

  // A rejected React form action resets uncontrolled fields. Remount the form
  // so they adopt the submitted values returned by the server action.
  return (
    <form key={state.revision} action={formAction} className="mt-8 space-y-6">
      {state.status === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger bg-danger-soft px-4 py-3 text-sm leading-6 text-danger-soft-text"
        >
          {state.error.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="title" className="text-sm font-semibold text-muted">
          {t("title")}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={DOCUMENT_FIELD_LIMITS.title.maxLength}
          defaultValue={values.title}
          dir="auto"
          aria-invalid={Boolean(fieldErrors?.title)}
          aria-describedby={fieldErrors?.title ? "title-error" : undefined}
          placeholder={t("titlePlaceholder")}
          className="mt-2 h-12 w-full rounded-xl border border-border-strong bg-surface px-4 text-[15px] text-text outline-none transition placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        {fieldErrors?.title ? (
          <p id="title-error" className="mt-1.5 text-sm text-danger">
            {fieldErrors.title.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <LanguageComboBox
          emptyMessage={t("languageNoResults")}
          error={fieldErrors?.sourceLanguage}
          label={t("sourceLanguage")}
          languages={languages}
          name="sourceLanguage"
          onChange={setSourceLanguage}
          openLabel={t("openSourceLanguages")}
          placeholder={t("languageSearchPlaceholder")}
          value={sourceLanguage}
        />
        <LanguageComboBox
          emptyMessage={t("languageNoResults")}
          error={fieldErrors?.targetLanguage}
          label={t("targetLanguage")}
          languages={languages}
          name="targetLanguage"
          onChange={setTargetLanguage}
          openLabel={t("openTargetLanguages")}
          placeholder={t("languageSearchPlaceholder")}
          value={targetLanguage}
        />
      </div>

      <div>
        <label htmlFor="content" className="text-sm font-semibold text-muted">
          {t("content")}
        </label>
        <p id="content-guidance" className="mt-1.5 text-sm text-muted">
          {t("contentGuidance")}
        </p>
        <textarea
          id="content"
          name="content"
          required
          maxLength={DOCUMENT_FIELD_LIMITS.content.maxLength}
          defaultValue={values.content}
          lang={sourceLanguage}
          dir={sourceDirection}
          rows={14}
          aria-invalid={Boolean(fieldErrors?.content)}
          aria-describedby={contentDescribedBy}
          className="mt-2 min-h-72 w-full resize-y rounded-xl border border-border-strong bg-surface px-4 py-3 text-[15px] leading-7 text-text outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        <div className="mt-1.5 flex items-start justify-between gap-4">
          {fieldErrors?.content ? (
            <p id="content-error" className="text-sm text-danger">
              {fieldErrors.content.message}
            </p>
          ) : (
            <span />
          )}
          <p id="content-hint" className="shrink-0 text-xs text-subtle">
            {t("contentHint", {
              count: DOCUMENT_FIELD_LIMITS.content.maxLength,
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/documents"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-muted transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {common("cancel")}
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-contrast transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? t("creating") : t("create")}
        </button>
      </div>
    </form>
  );
}
