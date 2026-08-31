import "server-only";

import { useTranslations } from "next-intl";

import { LanguagePair } from "@/components/language-pair";
import { ReaderExperience } from "@/features/reader/reader-experience";
import { processReaderText } from "@/features/reader/text-processing";
import type { ReaderResourceReference } from "@/features/reader/translation-contract";
import type { ReaderVocabularyCard } from "@/features/vocabulary/contract";

type ReaderProps = Readonly<{
  content: string;
  resource: ReaderResourceReference;
  sourceLanguage: string;
  targetLanguage: string;
  title: string;
  visibility: "private" | "public";
  vocabularyCards: readonly ReaderVocabularyCard[];
}>;

export function Reader({
  content,
  resource,
  sourceLanguage,
  targetLanguage,
  title,
  visibility,
  vocabularyCards,
}: ReaderProps) {
  const t = useTranslations("Reader");
  const paragraphs = processReaderText(content, sourceLanguage);

  return (
    <article className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface text-text shadow-sm transition-colors">
      <header className="px-6 py-7 sm:px-10 sm:py-9">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {visibility === "public" ? (
            <span className="rounded-full bg-success-soft px-2.5 py-1 text-success-soft-text">
              {t("publicSample")}
            </span>
          ) : null}
          <LanguagePair
            sourceLanguageCode={sourceLanguage}
            targetLanguageCode={targetLanguage}
          />
        </div>

        <h1
          dir="auto"
          className="mt-7 max-w-[22ch] text-3xl font-bold tracking-[-0.035em] text-balance sm:text-5xl"
        >
          {title}
        </h1>
      </header>

      <ReaderExperience
        paragraphs={paragraphs}
        resource={resource}
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        vocabularyCards={vocabularyCards}
      />
    </article>
  );
}
