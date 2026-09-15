import type { Metadata } from "next";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";

import { LanguagePair } from "@/components/language-pair";
import { SiteHeader } from "@/components/site-header";
import type { VocabularyCard } from "@/features/vocabulary/contract";
import {
  createVocabularyPairKey,
  filterVocabularyCards,
  normalizeVocabularySearch,
  VOCABULARY_SEARCH_MAX_LENGTH,
} from "@/features/vocabulary/dashboard-filters";
import { listVocabularyCards } from "@/features/vocabulary/queries.server";
import { VocabularyCardActions } from "@/features/vocabulary/vocabulary-card-actions";
import { VocabularyCardImage } from "@/features/vocabulary/vocabulary-card-image";
import { Link } from "@/i18n/navigation";
import { getLanguageDirection, getLanguageDisplayName } from "@/lib/languages";

type SearchParams = Promise<{
  pair?: string | string[];
  q?: string | string[];
}>;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("vocabulary") };
}

function firstSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function VocabularyPage({
  searchParams,
}: Readonly<{ searchParams: SearchParams }>) {
  const [cards, params, t, format, locale] = await Promise.all([
    listVocabularyCards(),
    searchParams,
    getTranslations("Vocabulary"),
    getFormatter(),
    getLocale(),
  ]);
  const pairs = [
    ...new Map(
      cards.map((card) => [
        createVocabularyPairKey(card.sourceLanguage, card.targetLanguage),
        card,
      ]),
    ).entries(),
  ];
  const requestedPair = firstSearchParam(params.pair);
  const pair = pairs.some(([key]) => key === requestedPair)
    ? requestedPair
    : "";
  const search = normalizeVocabularySearch(firstSearchParam(params.q));
  const filteredCards = filterVocabularyCards(cards, { pair, search });
  const filtering = Boolean(pair || search);

  return (
    <main className="min-h-dvh bg-page text-text">
      <SiteHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
          {t("heading")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          {t("description")}
        </p>

        {cards.length > 0 ? (
          <>
            <form
              method="get"
              className="mt-9 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,auto)_auto] sm:items-end"
            >
              <div>
                <label
                  htmlFor="vocabulary-search"
                  className="text-sm font-semibold text-muted"
                >
                  {t("filters.searchLabel")}
                </label>
                <input
                  id="vocabulary-search"
                  type="search"
                  name="q"
                  defaultValue={search}
                  maxLength={VOCABULARY_SEARCH_MAX_LENGTH}
                  placeholder={t("filters.searchPlaceholder")}
                  className="mt-2 h-11 w-full rounded-xl border border-border-strong bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                />
              </div>
              <div>
                <label
                  htmlFor="vocabulary-pair"
                  className="text-sm font-semibold text-muted"
                >
                  {t("filters.pairLabel")}
                </label>
                <select
                  id="vocabulary-pair"
                  name="pair"
                  defaultValue={pair}
                  className="mt-2 h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                >
                  <option value="">{t("filters.allPairs")}</option>
                  {pairs.map(([key, card]) => (
                    <option key={key} value={key}>
                      {getLanguageDisplayName(card.sourceLanguage, locale)} →{" "}
                      {getLanguageDisplayName(card.targetLanguage, locale)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {t("filters.apply")}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-sm text-muted">
                {t("results", { count: filteredCards.length })}
              </p>
              {filtering ? (
                <Link
                  href="/vocabulary"
                  className="text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {t("filters.clear")}
                </Link>
              ) : null}
            </div>

            {filteredCards.length > 0 ? (
              <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCards.map((card) => (
                  <VocabularyCardItem
                    key={card.id}
                    card={card}
                    updatedLabel={t("card.updated", {
                      date: format.dateTime(new Date(card.updatedAt), {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }),
                    })}
                  />
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
                <h2 className="text-xl font-bold">{t("noResults.heading")}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                  {t("noResults.description")}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
            <h2 className="text-2xl font-bold">{t("empty.heading")}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              {t("empty.description")}
            </p>
            <Link
              href="/documents"
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t("empty.action")}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function VocabularyCardItem({
  card,
  updatedLabel,
}: Readonly<{ card: VocabularyCard; updatedLabel: string }>) {
  return (
    <li>
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <VocabularyCardImage
          key={card.imageUrl ?? "missing"}
          imageUrl={card.imageUrl}
          word={card.word}
        />
        <div className="flex flex-1 flex-col p-5">
          <LanguagePair
            sourceLanguageCode={card.sourceLanguage}
            targetLanguageCode={card.targetLanguage}
            className="flex-wrap"
          />
          <h2
            lang={card.sourceLanguage}
            dir={getLanguageDirection(card.sourceLanguage)}
            className="mt-4 text-2xl font-bold tracking-tight"
          >
            {card.word}
          </h2>
          <ul
            lang={card.targetLanguage}
            dir={getLanguageDirection(card.targetLanguage)}
            className="mt-3 flex flex-wrap gap-2"
          >
            {card.meanings.map((meaning) => (
              <li
                key={meaning}
                className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary-soft-text"
              >
                {meaning}
              </li>
            ))}
          </ul>
          {card.usageContext ? (
            <p
              lang={card.sourceLanguage}
              dir={getLanguageDirection(card.sourceLanguage)}
              className="mt-4 line-clamp-3 text-sm leading-6 text-muted"
            >
              {card.usageContext}
            </p>
          ) : null}
          {card.note ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-text">
              {card.note}
            </p>
          ) : null}
          <div className="mt-auto flex items-end justify-between gap-3 pt-6">
            <p className="text-xs text-subtle">{updatedLabel}</p>
            <VocabularyCardActions card={card} />
          </div>
        </div>
      </article>
    </li>
  );
}
