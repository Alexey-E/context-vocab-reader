import "server-only";

import { LanguagePair } from "@/components/language-pair";
import { processReaderText } from "@/features/reader/text-processing";
import { getLanguage } from "@/lib/languages";

type ReaderProps = Readonly<{
  content: string;
  sourceLanguage: string;
  targetLanguage: string;
  title: string;
  visibility: "private" | "public";
}>;

export function Reader({
  content,
  sourceLanguage,
  targetLanguage,
  title,
  visibility,
}: ReaderProps) {
  const source = getLanguage(sourceLanguage);
  const target = getLanguage(targetLanguage);
  const direction = source?.direction ?? "auto";
  const paragraphs = processReaderText(content, sourceLanguage);

  return (
    <article className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface text-text shadow-sm transition-colors">
      <header className="px-6 py-7 sm:px-10 sm:py-9">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {visibility === "public" ? (
            <span className="rounded-full bg-success-soft px-2.5 py-1 text-success-soft-text">
              Public sample
            </span>
          ) : null}
          <LanguagePair
            sourceLanguage={source?.name ?? sourceLanguage.toUpperCase()}
            targetLanguage={target?.name ?? targetLanguage.toUpperCase()}
          />
        </div>

        <h1 className="mt-7 max-w-[22ch] text-3xl font-bold tracking-[-0.035em] text-balance sm:text-5xl">
          {title}
        </h1>
      </header>

      <div className="border-t border-border px-6 py-8 sm:px-10 sm:py-10">
        <div
          dir={direction}
          data-reader-source-text
          className="mx-auto max-w-[68ch] whitespace-pre-wrap text-lg leading-9 text-muted sm:text-xl sm:leading-10"
        >
          {paragraphs.map((paragraph) => (
            <p
              key={paragraph.id}
              id={paragraph.id}
              data-paragraph-id={paragraph.id}
              className="inline"
            >
              {paragraph.sentences.map((sentence) => (
                <span
                  key={sentence.id}
                  id={sentence.id}
                  data-sentence-id={sentence.id}
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
              ))}
              {paragraph.separatorAfter ? (
                <span data-paragraph-separator>{paragraph.separatorAfter}</span>
              ) : null}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
