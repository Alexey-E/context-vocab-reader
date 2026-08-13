"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";

import { TrashIcon } from "@/components/icons/trash-icon";
import type { DeleteDocumentState } from "@/features/documents/actions";

const initialState: DeleteDocumentState = { status: "idle" };

type DeleteDocumentButtonProps = Readonly<{
  deleteAction: (
    previousState: DeleteDocumentState,
    formData: FormData,
  ) => Promise<DeleteDocumentState>;
  documentTitle: string;
}>;

export function DeleteDocumentButton({
  deleteAction,
  documentTitle,
}: DeleteDocumentButtonProps) {
  const t = useTranslations("Documents.delete");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [state, formAction, pending] = useActionState(
    deleteAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "error" && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={t("ariaLabel", { title: documentTitle })}
        title={t("title")}
        className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-subtle transition hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
      >
        <TrashIcon />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-border bg-surface p-0 text-text shadow-2xl backdrop:bg-overlay"
      >
        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.12em] text-danger uppercase">
            {t("eyebrow")}
          </p>
          <h2 id={titleId} className="mt-3 text-2xl font-bold tracking-tight">
            {t("heading")}
          </h2>
          <p id={descriptionId} className="mt-3 text-sm leading-6 text-muted">
            {t("description", { title: documentTitle })}
          </p>

          {state.status === "error" ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger-soft-text"
            >
              {state.error.message}
            </p>
          ) : null}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <form method="dialog">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-border-strong px-4 text-sm font-semibold text-muted transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {t("cancel")}
              </button>
            </form>
            <form action={formAction}>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-danger px-4 text-sm font-semibold text-danger-contrast transition hover:bg-danger-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {pending ? t("pending") : t("confirm")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
