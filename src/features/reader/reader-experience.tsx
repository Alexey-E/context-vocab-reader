"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Disclosure,
  DisclosurePanel,
  Heading,
  Label,
  Modal,
  ModalOverlay,
  TextArea,
  TextField,
} from "react-aria-components";

import type {
  ReaderParagraph,
  ReaderSentence,
} from "@/features/reader/text-processing";
import type {
  ReaderResourceReference,
  ReaderTranslationResponse,
} from "@/features/reader/translation-contract";
import {
  invalidateLatestRequest,
  startLatestRequest,
} from "@/features/reader/latest-request";
import { TRANSLATION_POLICY } from "@/features/translation/constants";
import {
  SaveWordDialog,
  type SelectedReaderWord,
} from "@/features/vocabulary/save-word-dialog";
import { getLanguageDirection } from "@/lib/languages";

type TranslationState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "pending" }>
  | Readonly<{ error: string; status: "error" }>
  | Readonly<{ translatedText: string; status: "success" }>;

type SentenceState = Readonly<{
  expanded: boolean;
  translation: TranslationState;
}>;

type SelectionTranslation = Readonly<{
  sourceText: string;
  translatedText: string;
  word: SelectedReaderWord | null;
}>;

type ReaderExperienceProps = Readonly<{
  paragraphs: readonly ReaderParagraph[];
  resource: ReaderResourceReference;
  sourceLanguage: string;
  targetLanguage: string;
}>;

function isTranslationResponse(
  value: unknown,
): value is ReaderTranslationResponse {
  if (typeof value !== "object" || value === null || !("status" in value)) {
    return false;
  }

  if (value.status === "success") {
    return (
      "translatedText" in value &&
      typeof value.translatedText === "string" &&
      "provider" in value &&
      (value.provider === "google" || value.provider === "mock")
    );
  }

  return (
    value.status === "error" &&
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "message" in value.error &&
    typeof value.error.message === "string"
  );
}

function nodeElement(node: Node | null) {
  return node instanceof Element ? node : (node?.parentElement ?? null);
}

function selectionIsWithinSource(selection: Selection, container: HTMLElement) {
  const anchor = nodeElement(selection.anchorNode);
  const focus = nodeElement(selection.focusNode);

  return Boolean(
    anchor?.closest("[data-reader-source-segment]") &&
    focus?.closest("[data-reader-source-segment]") &&
    container.contains(anchor) &&
    container.contains(focus),
  );
}

function getSelectedSourceText(selection: Selection) {
  if (selection.rangeCount === 0) return "";

  const contents = selection.getRangeAt(0).cloneContents();
  contents
    .querySelectorAll("button, [data-reader-translation-panel]")
    .forEach((element) => element.remove());

  return contents.textContent?.trim() ?? "";
}

function getSelectedWord(
  selection: Selection,
  paragraphs: readonly ReaderParagraph[],
): SelectedReaderWord | null {
  const anchor = nodeElement(selection.anchorNode)?.closest<HTMLElement>(
    '[data-token-kind="word"]',
  );
  const focus = nodeElement(selection.focusNode)?.closest<HTMLElement>(
    '[data-token-kind="word"]',
  );

  if (
    !anchor ||
    anchor !== focus ||
    selection.toString() !== anchor.textContent
  ) {
    return null;
  }

  const tokenId = anchor.dataset.tokenId;
  if (!tokenId) return null;

  for (const paragraph of paragraphs) {
    for (const sentence of paragraph.sentences) {
      if (sentence.tokens.some((token) => token.id === tokenId)) {
        return {
          sourceText: anchor.textContent,
          tokenId,
          usageContext: sentence.text.trim(),
        };
      }
    }
  }

  return null;
}

function TranslateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        d="M4 5h10M9 3v2c0 4-2 7-5 9m3-5c1 2 3 4 6 5m2-5h3l3 9m-7 0 1.2-3.5h5.6L22 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function ReaderExperience({
  paragraphs,
  resource,
  sourceLanguage,
  targetLanguage,
}: ReaderExperienceProps) {
  const t = useTranslations("Reader");
  const locale = useLocale();
  const sourceDirection = getLanguageDirection(sourceLanguage);
  const targetDirection = getLanguageDirection(targetLanguage);
  const [selectedText, setSelectedText] = useState("");
  const [selectedWord, setSelectedWord] = useState<SelectedReaderWord | null>(
    null,
  );
  const [selectionState, setSelectionState] = useState<TranslationState>({
    status: "idle",
  });
  const [selectionTranslation, setSelectionTranslation] =
    useState<SelectionTranslation | null>(null);
  const [sentenceStates, setSentenceStates] = useState<
    Record<string, SentenceState>
  >({});
  const selectionRequestId = useRef(0);

  const requestTranslation = useCallback(
    async (text: string) => {
      try {
        const response = await fetch("/api/translation", {
          body: JSON.stringify({ locale, resource, text }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const body: unknown = await response.json();

        if (!isTranslationResponse(body)) {
          return { error: t("errors.failed"), status: "error" } as const;
        }

        if (body.status === "error") {
          return { error: body.error.message, status: "error" } as const;
        }

        return {
          status: "success",
          translatedText: body.translatedText,
        } as const;
      } catch {
        return { error: t("errors.failed"), status: "error" } as const;
      }
    },
    [locale, resource, t],
  );

  const translateSelection = useCallback(
    async (text: string, word: SelectedReaderWord | null = null) => {
      const normalizedText = text.trim();
      if (!normalizedText) {
        return { error: t("errors.failed"), status: "error" } as const;
      }

      const isLatestRequest = startLatestRequest(selectionRequestId);
      setSelectionState({ status: "pending" });
      setSelectionTranslation(null);
      const result = await requestTranslation(normalizedText);

      if (!isLatestRequest()) {
        return { status: "idle" } as const;
      }

      setSelectionState(result);

      if (result.status === "success") {
        setSelectionTranslation({
          sourceText: normalizedText,
          translatedText: result.translatedText,
          word,
        });
        return result;
      }

      return result;
    },
    [requestTranslation, t],
  );

  function updateNativeSelection(event: React.SyntheticEvent<HTMLElement>) {
    const container = event.currentTarget;

    requestAnimationFrame(() => {
      invalidateLatestRequest(selectionRequestId);
      const selection = window.getSelection();
      if (
        !selection ||
        selection.isCollapsed ||
        !selectionIsWithinSource(selection, container)
      ) {
        setSelectedText("");
        setSelectedWord(null);
        setSelectionState({ status: "idle" });
        setSelectionTranslation(null);
        return;
      }

      setSelectedText(getSelectedSourceText(selection));
      setSelectedWord(getSelectedWord(selection, paragraphs));
      setSelectionState({ status: "idle" });
      setSelectionTranslation(null);
    });
  }

  async function translateSentence(sentence: ReaderSentence) {
    setSentenceStates((states) => ({
      ...states,
      [sentence.id]: { expanded: true, translation: { status: "pending" } },
    }));
    const result = await requestTranslation(sentence.text);
    setSentenceStates((states) => ({
      ...states,
      [sentence.id]: {
        expanded: states[sentence.id]?.expanded ?? true,
        translation: result,
      },
    }));
  }

  function setSentenceExpanded(sentence: ReaderSentence, expanded: boolean) {
    const state = sentenceStates[sentence.id];
    setSentenceStates((states) => ({
      ...states,
      [sentence.id]: {
        expanded,
        translation: state?.translation ?? { status: "idle" },
      },
    }));

    if (expanded && (!state || state.translation.status === "idle")) {
      void translateSentence(sentence);
    }
  }

  return (
    <div className="border-t border-border">
      <div className="flex flex-col gap-3 border-b border-border bg-surface-muted px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <p className="text-sm font-semibold text-text">{t("toolsHeading")}</p>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            {selectedText ? t("selectionReady") : t("selectionHint")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            isDisabled={!selectedText || selectionState.status === "pending"}
            onPress={() => void translateSelection(selectedText, selectedWord)}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-contrast outline-none transition hover:bg-primary-hover data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-primary"
          >
            <TranslateIcon />
            {selectionState.status === "pending"
              ? t("translating")
              : t("translateSelection")}
          </Button>

          <DialogTrigger>
            <Button className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-border-strong bg-surface px-4 text-sm font-semibold text-muted outline-none transition hover:bg-surface hover:text-text data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-primary">
              {t("custom.open")}
            </Button>
            <ModalOverlay className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
              <Modal className="w-full max-w-lg rounded-3xl border border-border bg-surface text-text shadow-2xl outline-none">
                <Dialog className="p-6 outline-none sm:p-8">
                  {({ close }) => (
                    <CustomTranslationForm
                      close={close}
                      sourceDirection={sourceDirection}
                      sourceLanguage={sourceLanguage}
                      translate={(text) => translateSelection(text, null)}
                    />
                  )}
                </Dialog>
              </Modal>
            </ModalOverlay>
          </DialogTrigger>
        </div>
      </div>

      {selectionTranslation || selectionState.status === "error" ? (
        <div className="px-6 pt-6 sm:px-10">
          <section
            aria-live="polite"
            className={`rounded-2xl border px-5 py-4 ${
              selectionState.status === "error"
                ? "border-danger bg-danger-soft text-danger-soft-text"
                : "border-primary bg-primary-soft text-primary-soft-text"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-bold">{t("selectionResult")}</h2>
                {selectionState.status === "error" ? (
                  <div>
                    <p className="mt-2 text-sm leading-6">
                      {selectionState.error}
                    </p>
                    <Button
                      onPress={() =>
                        void translateSelection(selectedText, selectedWord)
                      }
                      className="mt-2 cursor-pointer rounded-lg text-sm font-semibold underline decoration-1 underline-offset-4 outline-none data-focus-visible:outline-2 data-focus-visible:outline-current"
                    >
                      {t("retry")}
                    </Button>
                  </div>
                ) : selectionTranslation ? (
                  <>
                    <p
                      lang={sourceLanguage}
                      dir={sourceDirection}
                      className="mt-2 text-sm leading-6 opacity-80"
                    >
                      {selectionTranslation.sourceText}
                    </p>
                    <p
                      lang={targetLanguage}
                      dir={targetDirection}
                      className="mt-2 text-base font-semibold leading-7"
                    >
                      {selectionTranslation.translatedText}
                    </p>
                    {selectionTranslation.word ? (
                      <SaveWordDialog
                        resource={resource}
                        sourceLanguage={sourceLanguage}
                        targetLanguage={targetLanguage}
                        translatedText={selectionTranslation.translatedText}
                        word={selectionTranslation.word}
                      />
                    ) : null}
                  </>
                ) : null}
              </div>
              <Button
                aria-label={t("dismissSelection")}
                onPress={() => {
                  invalidateLatestRequest(selectionRequestId);
                  setSelectionState({ status: "idle" });
                  setSelectionTranslation(null);
                }}
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-current outline-none transition hover:bg-surface/50 data-focus-visible:outline-2 data-focus-visible:outline-current"
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  ×
                </span>
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <div
          lang={sourceLanguage}
          dir={sourceDirection}
          data-reader-source-text
          onPointerUp={updateNativeSelection}
          onKeyUp={updateNativeSelection}
          className="mx-auto max-w-[68ch] whitespace-pre-wrap text-lg leading-9 text-muted sm:text-xl sm:leading-10"
        >
          {paragraphs.map((paragraph) => (
            <div
              key={paragraph.id}
              id={paragraph.id}
              role="paragraph"
              data-paragraph-id={paragraph.id}
            >
              {paragraph.sentences.map((sentence) => {
                const state = sentenceStates[sentence.id] ?? {
                  expanded: false,
                  translation: { status: "idle" } as const,
                };

                return (
                  <Disclosure
                    key={sentence.id}
                    id={sentence.id}
                    isExpanded={state.expanded}
                    onExpandedChange={(expanded) =>
                      setSentenceExpanded(sentence, expanded)
                    }
                    className="group/sentence inline"
                  >
                    <span
                      id={`${sentence.id}-source`}
                      data-sentence-id={sentence.id}
                      data-reader-source-segment
                    >
                      {sentence.tokens.map((token) => (
                        <span
                          key={token.id}
                          id={token.id}
                          data-token-id={token.id}
                          data-token-kind={token.kind}
                        >
                          {token.text}
                        </span>
                      ))}
                    </span>
                    <Button
                      slot="trigger"
                      aria-label={
                        state.expanded ? t("sentence.hide") : t("sentence.show")
                      }
                      className="ms-1 inline-flex size-7 translate-y-1 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-primary opacity-70 outline-none transition hover:border-primary hover:opacity-100 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-primary sm:opacity-0 sm:group-hover/sentence:opacity-100 sm:data-focus-visible:opacity-100 sm:data-expanded:opacity-100"
                    >
                      <TranslateIcon />
                    </Button>
                    <DisclosurePanel
                      data-reader-translation-panel
                      role="region"
                      aria-labelledby={`${sentence.id}-source`}
                      className="my-3 block rounded-2xl border-s-4 border-primary bg-primary-soft px-4 py-3 text-base leading-7 text-primary-soft-text sm:text-lg"
                    >
                      <SentenceTranslation
                        direction={targetDirection}
                        language={targetLanguage}
                        retry={() => void translateSentence(sentence)}
                        state={state.translation}
                      />
                    </DisclosurePanel>
                  </Disclosure>
                );
              })}
              {paragraph.separatorAfter ? (
                <span data-paragraph-separator>{paragraph.separatorAfter}</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SentenceTranslation({
  direction,
  language,
  retry,
  state,
}: Readonly<{
  direction: "ltr" | "rtl";
  language: string;
  retry: () => void;
  state: TranslationState;
}>) {
  const t = useTranslations("Reader");

  if (state.status === "pending" || state.status === "idle") {
    return (
      <p role="status" className="animate-pulse">
        {t("translating")}
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert">
        <p>{state.error}</p>
        <Button
          onPress={retry}
          className="mt-2 cursor-pointer rounded-lg font-semibold underline decoration-1 underline-offset-4 outline-none data-focus-visible:outline-2 data-focus-visible:outline-current"
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <p lang={language} dir={direction} aria-live="polite">
      {state.translatedText}
    </p>
  );
}

function CustomTranslationForm({
  close,
  sourceDirection,
  sourceLanguage,
  translate,
}: Readonly<{
  close: () => void;
  sourceDirection: "ltr" | "rtl";
  sourceLanguage: string;
  translate: (text: string) => Promise<TranslationState>;
}>) {
  const t = useTranslations("Reader.custom");
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await translate(text);
    setPending(false);

    if (result.status === "success") close();
    else if (result.status === "error") setError(result.error);
    else setError(t("failed"));
  }

  return (
    <form onSubmit={submit}>
      <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
        {t("eyebrow")}
      </p>
      <Heading slot="title" className="mt-3 text-2xl font-bold tracking-tight">
        {t("heading")}
      </Heading>
      <p className="mt-3 text-sm leading-6 text-muted">{t("description")}</p>

      <TextField value={text} onChange={setText} isRequired className="mt-5">
        <Label className="text-sm font-semibold text-muted">{t("label")}</Label>
        <TextArea
          autoFocus
          lang={sourceLanguage}
          dir={sourceDirection}
          maxLength={TRANSLATION_POLICY.text.maxCodePoints}
          rows={7}
          className="mt-2 min-h-40 w-full resize-y rounded-xl border border-border-strong bg-surface px-4 py-3 text-base leading-7 text-text outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
      </TextField>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger-soft-text"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          onPress={close}
          isDisabled={pending}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border-strong px-4 text-sm font-semibold text-muted outline-none transition hover:bg-surface-muted data-disabled:cursor-wait data-disabled:opacity-60 data-focus-visible:outline-2 data-focus-visible:outline-primary"
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          isDisabled={!text.trim() || pending}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-contrast outline-none transition hover:bg-primary-hover data-disabled:cursor-wait data-disabled:opacity-60 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-primary"
        >
          {pending ? t("pending") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
