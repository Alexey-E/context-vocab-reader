"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

import { VOCABULARY_FIELD_LIMITS } from "@/features/vocabulary/constants";
import type {
  VocabularyFormValues,
  VocabularyField,
} from "@/features/vocabulary/validation";
import type { AppErrorPayload } from "@/lib/errors/catalog";
import { getLanguageDirection } from "@/lib/languages";

export function VocabularyCardFields({
  errors,
  sourceLanguage,
  targetLanguage,
  values,
  word,
}: Readonly<{
  errors?: Partial<Record<VocabularyField, AppErrorPayload>>;
  sourceLanguage: string;
  targetLanguage: string;
  values: VocabularyFormValues;
  word: string;
}>) {
  const t = useTranslations("Reader.vocabulary");
  const fieldId = useId();
  const [imageUrl, setImageUrl] = useState(values.imageUrl);
  const [imageBroken, setImageBroken] = useState(false);
  const id = (name: string) => `${fieldId}-${name}`;

  return (
    <>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-muted">{t("word")}</p>
          <p
            lang={sourceLanguage}
            dir={getLanguageDirection(sourceLanguage)}
            className="mt-2 rounded-xl border border-border bg-surface-muted px-4 py-3 font-semibold"
          >
            {word}
          </p>
        </div>
        <div>
          <label
            htmlFor={id("meanings")}
            className="text-sm font-semibold text-muted"
          >
            {t("meanings")}
          </label>
          <input
            id={id("meanings")}
            name="meanings"
            required
            defaultValue={values.meanings}
            dir={getLanguageDirection(targetLanguage)}
            lang={targetLanguage}
            aria-invalid={Boolean(errors?.meanings)}
            aria-describedby={
              errors?.meanings ? id("meanings-error") : undefined
            }
            className="mt-2 h-12 w-full rounded-xl border border-border-strong bg-surface px-4 text-[15px] text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
          />
          <p className="mt-1.5 text-xs text-subtle">{t("meaningsHint")}</p>
          {errors?.meanings ? (
            <p id={id("meanings-error")} className="mt-1.5 text-sm text-danger">
              {errors.meanings.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor={id("usage-context")}
          className="text-sm font-semibold text-muted"
        >
          {t("context")}
        </label>
        <textarea
          id={id("usage-context")}
          name="usageContext"
          defaultValue={values.usageContext}
          maxLength={VOCABULARY_FIELD_LIMITS.usageContext.maxLength}
          rows={3}
          lang={sourceLanguage}
          dir={getLanguageDirection(sourceLanguage)}
          aria-invalid={Boolean(errors?.usageContext)}
          aria-describedby={
            errors?.usageContext ? id("usage-context-error") : undefined
          }
          className="mt-2 w-full resize-y rounded-xl border border-border-strong bg-surface px-4 py-3 text-[15px] leading-6 text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        {errors?.usageContext ? (
          <p
            id={id("usage-context-error")}
            className="mt-1.5 text-sm text-danger"
          >
            {errors.usageContext.message}
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <label
          htmlFor={id("note")}
          className="text-sm font-semibold text-muted"
        >
          {t("note")}
        </label>
        <textarea
          id={id("note")}
          name="note"
          defaultValue={values.note}
          maxLength={VOCABULARY_FIELD_LIMITS.note.maxLength}
          rows={2}
          aria-invalid={Boolean(errors?.note)}
          aria-describedby={errors?.note ? id("note-error") : undefined}
          className="mt-2 w-full resize-y rounded-xl border border-border-strong bg-surface px-4 py-3 text-[15px] leading-6 text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        {errors?.note ? (
          <p id={id("note-error")} className="mt-1.5 text-sm text-danger">
            {errors.note.message}
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <label
          htmlFor={id("image-url")}
          className="text-sm font-semibold text-muted"
        >
          {t("imageUrl")}
        </label>
        <input
          id={id("image-url")}
          name="imageUrl"
          type="url"
          inputMode="url"
          defaultValue={values.imageUrl}
          maxLength={VOCABULARY_FIELD_LIMITS.imageUrl.maxLength}
          placeholder="https://example.com/image.jpg"
          aria-invalid={Boolean(errors?.imageUrl)}
          aria-describedby={
            errors?.imageUrl ? id("image-url-error") : undefined
          }
          onChange={(event) => {
            setImageUrl(event.currentTarget.value.trim());
            setImageBroken(false);
          }}
          className="mt-2 h-12 w-full rounded-xl border border-border-strong bg-surface px-4 text-[15px] text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        {errors?.imageUrl ? (
          <p id={id("image-url-error")} className="mt-1.5 text-sm text-danger">
            {errors.imageUrl.message}
          </p>
        ) : null}
        {imageUrl ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface-muted">
            {imageBroken ? (
              <p
                role="status"
                className="px-4 py-6 text-center text-sm text-muted"
              >
                {t("imageBroken")}
              </p>
            ) : (
              // Arbitrary user-provided remote hosts cannot use next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={imageUrl}
                src={imageUrl}
                alt={t("imagePreview", { word })}
                onError={() => setImageBroken(true)}
                className="max-h-52 w-full object-cover"
              />
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
