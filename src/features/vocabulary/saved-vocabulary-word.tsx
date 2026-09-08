"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Dialog,
  Focusable,
  Heading,
  Popover,
  PreviewTrigger,
} from "react-aria-components";

import {
  isReaderWordActivationKey,
  shouldActivateReaderWordFromClick,
} from "@/features/reader/word-activation";
import type { ReaderVocabularyCard } from "@/features/vocabulary/contract";
import { getLanguageDirection } from "@/lib/languages";

type SavedVocabularyWordProps = Readonly<{
  actionLabelId: string;
  card: ReaderVocabularyCard;
  onTranslate: () => void;
  sourceLanguage: string;
  targetLanguage: string;
  tokenId: string;
  word: string;
}>;

export function SavedVocabularyWord({
  actionLabelId,
  card,
  onTranslate,
  sourceLanguage,
  targetLanguage,
  tokenId,
  word,
}: SavedVocabularyWordProps) {
  const t = useTranslations("Reader.vocabulary");
  const [isOpen, setIsOpen] = useState(false);
  const targetDirection = getLanguageDirection(targetLanguage);

  return (
    <PreviewTrigger
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      delay={300}
      closeDelay={150}
    >
      <Focusable>
        <span
          id={tokenId}
          role="button"
          aria-labelledby={`${actionLabelId} ${tokenId}-label`}
          data-saved-word
          data-token-id={tokenId}
          data-token-kind="word"
          onClick={(event) => {
            const selection = window.getSelection();
            if (
              shouldActivateReaderWordFromClick(
                event.detail,
                selection?.isCollapsed ?? true,
              )
            ) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(event) => {
            if (!isReaderWordActivationKey(event.key)) return;

            event.preventDefault();
            event.stopPropagation();
            setIsOpen(true);
          }}
          onKeyUp={(event) => {
            if (isReaderWordActivationKey(event.key)) {
              event.stopPropagation();
            }
          }}
          className="cursor-pointer rounded-sm bg-selected px-0.5 text-selected-text underline decoration-primary/60 decoration-2 underline-offset-4 outline-none transition hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span id={`${tokenId}-label`} lang={sourceLanguage}>
            {word}
          </span>
        </span>
      </Focusable>
      <Popover
        placement="top"
        offset={8}
        className="z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface text-text shadow-xl outline-none"
      >
        <Dialog
          aria-label={t("savedHeading", { word })}
          className="p-4 outline-none"
        >
          {({ close }) => (
            <>
              <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
                {t("eyebrow")}
              </p>
              <Heading
                slot="title"
                lang={sourceLanguage}
                dir="auto"
                className="mt-2 text-xl font-bold tracking-tight"
              >
                {word}
              </Heading>

              {card.imageUrl ? (
                // The URL is validated when the card is saved. The dashboard
                // stage will add a shared image fallback.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={card.imageUrl}
                  src={card.imageUrl}
                  alt={t("imagePreview", { word })}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                  className="mt-3 max-h-36 w-full rounded-xl border border-border object-cover"
                />
              ) : null}

              <div className="mt-3">
                <p className="text-xs font-semibold text-muted">
                  {t("meanings")}
                </p>
                <ul
                  lang={targetLanguage}
                  dir={targetDirection}
                  className="mt-1 list-inside list-disc text-sm leading-6"
                >
                  {card.meanings.map((meaning) => (
                    <li key={meaning}>{meaning}</li>
                  ))}
                </ul>
              </div>

              {card.usageContext ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-muted">
                    {t("context")}
                  </p>
                  <p
                    lang={sourceLanguage}
                    dir="auto"
                    className="mt-1 text-sm leading-6"
                  >
                    {card.usageContext}
                  </p>
                </div>
              ) : null}

              {card.note ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-muted">
                    {t("note")}
                  </p>
                  <p dir="auto" className="mt-1 text-sm leading-6">
                    {card.note}
                  </p>
                </div>
              ) : null}

              <Button
                onPress={() => {
                  close();
                  onTranslate();
                }}
                className="mt-4 inline-flex min-h-9 cursor-pointer items-center justify-center rounded-xl bg-primary px-3 text-sm font-semibold text-primary-contrast outline-none transition hover:bg-primary-hover data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-primary"
              >
                {t("translateSaved")}
              </Button>
            </>
          )}
        </Dialog>
      </Popover>
    </PreviewTrigger>
  );
}
