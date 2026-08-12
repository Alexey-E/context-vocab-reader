"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createDocument,
  type DocumentFormState,
} from "@/features/documents/actions";
import { DOCUMENT_FIELD_LIMITS } from "@/features/documents/constants";
import type { DocumentFormValues } from "@/features/documents/validation";
import type { AppErrorPayload } from "@/lib/errors/catalog";
import { LANGUAGES } from "@/lib/languages";

const initialState: DocumentFormState = { revision: 0, status: "idle" };
const initialValues: DocumentFormValues = {
  content: "",
  sourceLanguage: "en",
  targetLanguage: "es",
  title: "",
};

type LanguageSelectFieldProps = Readonly<{
  error?: AppErrorPayload;
  label: string;
  name: "sourceLanguage" | "targetLanguage";
  value: string;
}>;

function LanguageSelectField({
  error,
  label,
  name,
  value,
}: LanguageSelectFieldProps) {
  const errorId =
    name === "sourceLanguage"
      ? "source-language-error"
      : "target-language-error";

  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-muted">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required
        defaultValue={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 h-12 w-full rounded-xl border border-border-strong bg-surface px-4 text-[15px] text-text outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}

export function DocumentForm() {
  const [state, formAction, pending] = useActionState(
    createDocument,
    initialState,
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : initialValues;

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
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={DOCUMENT_FIELD_LIMITS.title.maxLength}
          defaultValue={values.title}
          aria-invalid={Boolean(fieldErrors?.title)}
          aria-describedby={fieldErrors?.title ? "title-error" : undefined}
          placeholder="A useful article"
          className="mt-2 h-12 w-full rounded-xl border border-border-strong bg-surface px-4 text-[15px] text-text outline-none transition placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        {fieldErrors?.title ? (
          <p id="title-error" className="mt-1.5 text-sm text-danger">
            {fieldErrors.title.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <LanguageSelectField
          error={fieldErrors?.sourceLanguage}
          label="Source language"
          name="sourceLanguage"
          value={values.sourceLanguage}
        />
        <LanguageSelectField
          error={fieldErrors?.targetLanguage}
          label="Translate into"
          name="targetLanguage"
          value={values.targetLanguage}
        />
      </div>

      <div>
        <label htmlFor="content" className="text-sm font-semibold text-muted">
          Document text
        </label>
        <textarea
          id="content"
          name="content"
          required
          maxLength={DOCUMENT_FIELD_LIMITS.content.maxLength}
          defaultValue={values.content}
          rows={14}
          aria-invalid={Boolean(fieldErrors?.content)}
          aria-describedby={fieldErrors?.content ? "content-error" : undefined}
          placeholder="Paste the text you want to read…"
          className="mt-2 min-h-72 w-full resize-y rounded-xl border border-border-strong bg-surface px-4 py-3 text-[15px] leading-7 text-text outline-none transition placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        <div className="mt-1.5 flex items-start justify-between gap-4">
          {fieldErrors?.content ? (
            <p id="content-error" className="text-sm text-danger">
              {fieldErrors.content.message}
            </p>
          ) : (
            <span />
          )}
          <p className="shrink-0 text-xs text-subtle">
            Up to{" "}
            {DOCUMENT_FIELD_LIMITS.content.maxLength.toLocaleString("en-US")}{" "}
            characters
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/documents"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-muted transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-contrast transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create document"}
        </button>
      </div>
    </form>
  );
}
