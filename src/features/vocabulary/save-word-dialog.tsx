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
import type { ReaderVocabularyCard } from "@/features/vocabulary/contract";
import { getVocabularyFormValues } from "@/features/vocabulary/form-values";
import { VocabularyCardFields } from "@/features/vocabulary/vocabulary-card-fields";

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

      <VocabularyCardFields
        errors={errors}
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        values={values}
        word={word.sourceText}
      />

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
