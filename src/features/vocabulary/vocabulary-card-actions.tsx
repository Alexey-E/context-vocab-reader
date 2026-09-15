"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { TrashIcon } from "@/components/icons/trash-icon";
import {
  deleteVocabularyCard,
  type DeleteVocabularyCardState,
  updateVocabularyCard,
  type UpdateVocabularyCardState,
} from "@/features/vocabulary/actions";
import type { VocabularyCard } from "@/features/vocabulary/contract";
import { VocabularyCardFields } from "@/features/vocabulary/vocabulary-card-fields";

const updateInitialState: UpdateVocabularyCardState = {
  revision: 0,
  status: "idle",
};
const deleteInitialState: DeleteVocabularyCardState = { status: "idle" };

export function VocabularyCardActions({
  card,
}: Readonly<{ card: VocabularyCard }>) {
  const [session, setSession] = useState(0);
  return (
    <VocabularyCardActionsSession
      key={session}
      card={card}
      reset={() => setSession((value) => value + 1)}
    />
  );
}

function VocabularyCardActionsSession({
  card,
  reset,
}: Readonly<{ card: VocabularyCard; reset: () => void }>) {
  const locale = useLocale();
  const t = useTranslations("Vocabulary");
  const router = useRouter();
  const editDialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const editTitleId = useId();
  const deleteTitleId = useId();
  const [updateState, updateAction, updatePending] = useActionState(
    updateVocabularyCard.bind(null, locale, card.id),
    updateInitialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteVocabularyCard.bind(null, locale, card.id),
    deleteInitialState,
  );

  useEffect(() => {
    if (updateState.status === "success" || deleteState.status === "success")
      router.refresh();
  }, [deleteState.status, router, updateState.status]);

  const values =
    updateState.status === "error"
      ? updateState.values
      : {
          imageUrl: card.imageUrl ?? "",
          meanings: card.meanings.join(", "),
          note: card.note ?? "",
          usageContext: card.usageContext ?? "",
        };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => editDialog.current?.showModal()}
        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-border-strong px-3 text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
      >
        {t("edit.action")}
      </button>
      <button
        type="button"
        onClick={() => deleteDialog.current?.showModal()}
        aria-label={t("delete.ariaLabel", { word: card.word })}
        title={t("delete.action")}
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl text-subtle transition hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-danger"
      >
        <TrashIcon />
      </button>

      <dialog
        ref={editDialog}
        aria-labelledby={editTitleId}
        onClose={reset}
        className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-3xl border border-border bg-surface p-0 text-text shadow-2xl backdrop:bg-overlay"
      >
        <form action={updateAction} className="p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
            {t("edit.eyebrow")}
          </p>
          <h2
            id={editTitleId}
            className="mt-3 text-2xl font-bold tracking-tight"
          >
            {t("edit.heading", { word: card.word })}
          </h2>
          {updateState.status === "error" ? (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger-soft-text"
            >
              {updateState.error.message}
            </p>
          ) : null}
          {updateState.status === "success" ? (
            <p
              role="status"
              className="mt-5 rounded-xl border border-success bg-success-soft px-4 py-3 text-sm text-success-soft-text"
            >
              {t("edit.success")}
            </p>
          ) : (
            <VocabularyCardFields
              errors={
                updateState.status === "error"
                  ? updateState.fieldErrors
                  : undefined
              }
              sourceLanguage={card.sourceLanguage}
              targetLanguage={card.targetLanguage}
              values={values}
              word={card.word}
            />
          )}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={updatePending}
              onClick={() => editDialog.current?.close()}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border-strong px-4 text-sm font-semibold text-muted hover:bg-surface-muted disabled:opacity-60"
            >
              {updateState.status === "success"
                ? t("edit.close")
                : t("edit.cancel")}
            </button>
            {updateState.status !== "success" ? (
              <button
                type="submit"
                disabled={updatePending}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
              >
                {updatePending ? t("edit.saving") : t("edit.save")}
              </button>
            ) : null}
          </div>
        </form>
      </dialog>

      <dialog
        ref={deleteDialog}
        aria-labelledby={deleteTitleId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-border bg-surface p-0 text-text shadow-2xl backdrop:bg-overlay"
      >
        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.12em] text-danger uppercase">
            {t("delete.eyebrow")}
          </p>
          <h2
            id={deleteTitleId}
            className="mt-3 text-2xl font-bold tracking-tight"
          >
            {t("delete.heading")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            {t.rich("delete.description", {
              cardWord: (chunks) => <bdi dir="auto">{chunks}</bdi>,
              word: card.word,
            })}
          </p>
          {deleteState.status === "error" ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger-soft-text"
            >
              {deleteState.error.message}
            </p>
          ) : null}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={deletePending}
              onClick={() => deleteDialog.current?.close()}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border-strong px-4 text-sm font-semibold text-muted hover:bg-surface-muted disabled:opacity-60"
            >
              {t("delete.cancel")}
            </button>
            <form action={deleteAction}>
              <button
                type="submit"
                disabled={deletePending}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-danger px-4 text-sm font-semibold text-danger-contrast hover:bg-danger-hover disabled:cursor-wait disabled:opacity-60"
              >
                {deletePending ? t("delete.pending") : t("delete.confirm")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
