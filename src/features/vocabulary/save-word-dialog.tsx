"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import type { ReaderResourceReference } from "@/features/reader/translation-contract";
import {
  saveVocabularyCard,
  type SaveVocabularyCardState,
} from "@/features/vocabulary/actions";
import { VOCABULARY_FIELD_LIMITS } from "@/features/vocabulary/constants";
import type { ReaderVocabularyCard } from "@/features/vocabulary/contract";
import { getVocabularyFormValues } from "@/features/vocabulary/form-values";
import { getLanguageDirection } from "@/lib/languages";

export type SelectedReaderWord = Readonly<{
  normalizedWord: string;
  sourceText: string;
  tokenId: string;
  usageContext: string;
}>;

const initialState: SaveVocabularyCardState = {
  revision: 0,
  status: "idle",
};

type SaveWordDialogProps = Readonly<{
  existingCard: ReaderVocabularyCard | null;
  onSaved: (card: ReaderVocabularyCard) => void;
  resource: ReaderResourceReference;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  word: SelectedReaderWord;
}>;

export function SaveWordDialog(props: SaveWordDialogProps) {
  const [session, setSession] = useState(0);

  return (
    <SaveWordDialogSession
      key={session}
      {...props}
      reset={() => setSession((currentSession) => currentSession + 1)}
    />
  );
}

function SaveWordDialogSession({
  existingCard,
  onSaved,
  reset,
  resource,
  sourceLanguage,
  targetLanguage,
  translatedText,
  word,
}: SaveWordDialogProps & Readonly<{ reset: () => void }>) {
  const locale = useLocale();
  const t = useTranslations("Reader.vocabulary");
  const action = useMemo(
    () =>
      saveVocabularyCard.bind(
        null,
        locale,
        resource,
        word.tokenId,
        existingCard?.meanings ?? [],
      ),
    [existingCard?.meanings, locale, resource, word.tokenId],
  );
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") {
      onSaved({
        imageUrl: state.card.imageUrl,
        meanings: state.card.meanings,
        note: state.card.note,
        usageContext: state.card.usageContext,
        word: state.card.word,
      });
    }
  }, [onSaved, state]);

  return (
    <DialogTrigger>
      <Button className="mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-contrast outline-none transition hover:bg-primary-hover data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-primary">
        {t("open")}
      </Button>
      <ModalOverlay className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-overlay p-4">
        <Modal className="my-auto w-full max-w-2xl rounded-3xl border border-border bg-surface text-text shadow-2xl outline-none">
          <Dialog className="p-6 outline-none sm:p-8">
            {({ close }) => {
              const closeAndReset = () => {
                close();
                reset();
              };

              return state.status === "success" ? (
                <SavedCard state={state} close={closeAndReset} />
              ) : (
                <VocabularyForm
                  key={state.revision}
                  close={closeAndReset}
                  existingCard={existingCard}
                  formAction={formAction}
                  pending={pending}
                  sourceLanguage={sourceLanguage}
                  state={state}
                  targetLanguage={targetLanguage}
                  translatedText={translatedText}
                  word={word}
                />
              );
            }}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

function VocabularyForm({
  close,
  existingCard,
  formAction,
  pending,
  sourceLanguage,
  state,
  targetLanguage,
  translatedText,
  word,
}: Readonly<{
  close: () => void;
  existingCard: ReaderVocabularyCard | null;
  formAction: (formData: FormData) => void;
  pending: boolean;
  sourceLanguage: string;
  state: Exclude<SaveVocabularyCardState, { status: "success" }>;
  targetLanguage: string;
  translatedText: string;
  word: SelectedReaderWord;
}>) {
  const t = useTranslations("Reader.vocabulary");
  const values =
    state.status === "error"
      ? state.values
      : getVocabularyFormValues(
          existingCard,
          translatedText,
          word.usageContext,
          targetLanguage,
        );
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const [imageUrl, setImageUrl] = useState(values.imageUrl);
  const [imageBroken, setImageBroken] = useState(false);

  return (
    <form action={formAction}>
      <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
        {t("eyebrow")}
      </p>
      <Heading slot="title" className="mt-3 text-2xl font-bold tracking-tight">
        {t("heading", { word: word.sourceText })}
      </Heading>
      <p className="mt-3 text-sm leading-6 text-muted">{t("description")}</p>

      {existingCard && state.status === "idle" ? (
        <p className="mt-5 rounded-xl border border-primary bg-primary-soft px-4 py-3 text-sm text-primary-soft-text">
          {t("existing")}
        </p>
      ) : null}

      {state.status === "error" ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger-soft-text"
        >
          {state.error.message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-muted">{t("word")}</p>
          <p
            lang={sourceLanguage}
            dir={getLanguageDirection(sourceLanguage)}
            className="mt-2 rounded-xl border border-border bg-surface-muted px-4 py-3 font-semibold"
          >
            {word.sourceText}
          </p>
        </div>
        <div>
          <label
            htmlFor="meanings"
            className="text-sm font-semibold text-muted"
          >
            {t("meanings")}
          </label>
          <input
            id="meanings"
            name="meanings"
            required
            defaultValue={values.meanings}
            dir={getLanguageDirection(targetLanguage)}
            lang={targetLanguage}
            aria-invalid={Boolean(errors?.meanings)}
            aria-describedby={errors?.meanings ? "meanings-error" : undefined}
            className="mt-2 h-12 w-full rounded-xl border border-border-strong bg-surface px-4 text-[15px] text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
          />
          <p className="mt-1.5 text-xs text-subtle">{t("meaningsHint")}</p>
          {errors?.meanings ? (
            <p id="meanings-error" className="mt-1.5 text-sm text-danger">
              {errors.meanings.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="usageContext"
          className="text-sm font-semibold text-muted"
        >
          {t("context")}
        </label>
        <textarea
          id="usageContext"
          name="usageContext"
          defaultValue={values.usageContext}
          maxLength={VOCABULARY_FIELD_LIMITS.usageContext.maxLength}
          rows={3}
          lang={sourceLanguage}
          dir={getLanguageDirection(sourceLanguage)}
          aria-invalid={Boolean(errors?.usageContext)}
          aria-describedby={
            errors?.usageContext ? "usage-context-error" : undefined
          }
          className="mt-2 w-full resize-y rounded-xl border border-border-strong bg-surface px-4 py-3 text-[15px] leading-6 text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        {errors?.usageContext ? (
          <p id="usage-context-error" className="mt-1.5 text-sm text-danger">
            {errors.usageContext.message}
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <label htmlFor="note" className="text-sm font-semibold text-muted">
          {t("note")}
        </label>
        <textarea
          id="note"
          name="note"
          defaultValue={values.note}
          maxLength={VOCABULARY_FIELD_LIMITS.note.maxLength}
          rows={2}
          aria-invalid={Boolean(errors?.note)}
          aria-describedby={errors?.note ? "note-error" : undefined}
          className="mt-2 w-full resize-y rounded-xl border border-border-strong bg-surface px-4 py-3 text-[15px] leading-6 text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        {errors?.note ? (
          <p id="note-error" className="mt-1.5 text-sm text-danger">
            {errors.note.message}
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <label htmlFor="imageUrl" className="text-sm font-semibold text-muted">
          {t("imageUrl")}
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          inputMode="url"
          defaultValue={values.imageUrl}
          maxLength={VOCABULARY_FIELD_LIMITS.imageUrl.maxLength}
          placeholder="https://example.com/image.jpg"
          aria-invalid={Boolean(errors?.imageUrl)}
          aria-describedby={errors?.imageUrl ? "image-url-error" : undefined}
          onChange={(event) => {
            setImageUrl(event.currentTarget.value.trim());
            setImageBroken(false);
          }}
          className="mt-2 h-12 w-full rounded-xl border border-border-strong bg-surface px-4 text-[15px] text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        {errors?.imageUrl ? (
          <p id="image-url-error" className="mt-1.5 text-sm text-danger">
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
                src={imageUrl}
                alt={t("imagePreview", { word: word.sourceText })}
                onError={() => setImageBroken(true)}
                className="max-h-52 w-full object-cover"
              />
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          onPress={close}
          isDisabled={pending}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border-strong px-4 text-sm font-semibold text-muted outline-none hover:bg-surface-muted data-disabled:cursor-wait data-disabled:opacity-60"
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          isDisabled={pending}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast outline-none hover:bg-primary-hover data-disabled:cursor-wait data-disabled:opacity-60"
        >
          {pending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function SavedCard({
  close,
  state,
}: Readonly<{
  close: () => void;
  state: Extract<SaveVocabularyCardState, { status: "success" }>;
}>) {
  const t = useTranslations("Reader.vocabulary");

  return (
    <div>
      <p className="text-xs font-bold tracking-[0.12em] text-success uppercase">
        {t(state.outcome)}
      </p>
      <Heading slot="title" className="mt-3 text-2xl font-bold tracking-tight">
        {state.card.sourceText}
      </Heading>
      <ul className="mt-4 flex flex-wrap gap-2">
        {state.card.meanings.map((meaning) => (
          <li
            key={meaning}
            className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-semibold text-primary-soft-text"
          >
            {meaning}
          </li>
        ))}
      </ul>
      {state.card.usageContext ? (
        <p className="mt-5 text-sm leading-6 text-muted">
          {state.card.usageContext}
        </p>
      ) : null}
      {state.card.note ? (
        <p className="mt-3 text-sm leading-6 text-text">{state.card.note}</p>
      ) : null}
      {state.card.imageUrl ? (
        <SavedCardImage
          imageUrl={state.card.imageUrl}
          word={state.card.sourceText}
        />
      ) : null}
      <div className="mt-7 flex justify-end">
        <Button
          onPress={close}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast outline-none hover:bg-primary-hover"
        >
          {t("close")}
        </Button>
      </div>
    </div>
  );
}

function SavedCardImage({
  imageUrl,
  word,
}: Readonly<{ imageUrl: string; word: string }>) {
  const t = useTranslations("Reader.vocabulary");
  const [broken, setBroken] = useState(false);

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface-muted">
      {broken ? (
        <p role="status" className="px-4 py-6 text-center text-sm text-muted">
          {t("imageBroken")}
        </p>
      ) : (
        // Arbitrary user-provided remote hosts cannot use next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={t("imagePreview", { word })}
          onError={() => setBroken(true)}
          className="max-h-60 w-full object-cover"
        />
      )}
    </div>
  );
}
