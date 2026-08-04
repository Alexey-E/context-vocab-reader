"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createDocument,
  type DocumentFormState,
} from "@/features/documents/actions";
import {
  DOCUMENT_CONTENT_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
} from "@/features/documents/constants";
import type { DocumentFormValues } from "@/features/documents/validation";
import { LANGUAGES } from "@/lib/languages";

const initialState: DocumentFormState = { revision: 0, status: "idle" };
const initialValues: DocumentFormValues = {
  content: "",
  sourceLanguage: "en",
  targetLanguage: "es",
  title: "",
};

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
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.error.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="title" className="text-sm font-semibold text-slate-700">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={DOCUMENT_TITLE_MAX_LENGTH}
          defaultValue={values.title}
          aria-invalid={Boolean(fieldErrors?.title)}
          aria-describedby={fieldErrors?.title ? "title-error" : undefined}
          placeholder="A useful article"
          className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10"
        />
        {fieldErrors?.title ? (
          <p id="title-error" className="mt-1.5 text-sm text-red-600">
            {fieldErrors.title.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="sourceLanguage"
            className="text-sm font-semibold text-slate-700"
          >
            Source language
          </label>
          <select
            id="sourceLanguage"
            name="sourceLanguage"
            required
            defaultValue={values.sourceLanguage}
            aria-invalid={Boolean(fieldErrors?.sourceLanguage)}
            aria-describedby={
              fieldErrors?.sourceLanguage ? "source-language-error" : undefined
            }
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-slate-950 outline-none transition focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
          {fieldErrors?.sourceLanguage ? (
            <p
              id="source-language-error"
              className="mt-1.5 text-sm text-red-600"
            >
              {fieldErrors.sourceLanguage.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="targetLanguage"
            className="text-sm font-semibold text-slate-700"
          >
            Translate into
          </label>
          <select
            id="targetLanguage"
            name="targetLanguage"
            required
            defaultValue={values.targetLanguage}
            aria-invalid={Boolean(fieldErrors?.targetLanguage)}
            aria-describedby={
              fieldErrors?.targetLanguage ? "target-language-error" : undefined
            }
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-slate-950 outline-none transition focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
          {fieldErrors?.targetLanguage ? (
            <p
              id="target-language-error"
              className="mt-1.5 text-sm text-red-600"
            >
              {fieldErrors.targetLanguage.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="content"
          className="text-sm font-semibold text-slate-700"
        >
          Document text
        </label>
        <textarea
          id="content"
          name="content"
          required
          maxLength={DOCUMENT_CONTENT_MAX_LENGTH}
          defaultValue={values.content}
          rows={14}
          aria-invalid={Boolean(fieldErrors?.content)}
          aria-describedby={fieldErrors?.content ? "content-error" : undefined}
          placeholder="Paste the text you want to read…"
          className="mt-2 min-h-72 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10"
        />
        <div className="mt-1.5 flex items-start justify-between gap-4">
          {fieldErrors?.content ? (
            <p id="content-error" className="text-sm text-red-600">
              {fieldErrors.content.message}
            </p>
          ) : (
            <span />
          )}
          <p className="shrink-0 text-xs text-slate-400">
            Up to {DOCUMENT_CONTENT_MAX_LENGTH.toLocaleString("en-US")}{" "}
            characters
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/documents"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create document"}
        </button>
      </div>
    </form>
  );
}
