import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BackLink } from "@/components/back-link";
import { SiteHeader } from "@/components/site-header";
import { getSampleDocument } from "@/features/documents/queries";
import { Reader } from "@/features/reader/reader";
import { listReaderVocabularyCards } from "@/features/vocabulary/queries.server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("sample") };
}

type SamplePageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export default async function SamplePage({ params }: SamplePageProps) {
  const [{ slug }, t] = await Promise.all([params, getTranslations("Samples")]);
  const sample = await getSampleDocument(slug);

  if (!sample) {
    notFound();
  }

  const vocabularyCards = await listReaderVocabularyCards(
    sample.source_language,
    sample.target_language,
  );

  return (
    <main className="min-h-dvh bg-page text-text">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <BackLink href="/samples" label={t("readerBack")} />

        <Reader
          content={sample.content}
          resource={{ kind: "sample", slug: sample.slug }}
          sourceLanguage={sample.source_language}
          targetLanguage={sample.target_language}
          title={sample.title}
          visibility="public"
          vocabularyCards={vocabularyCards}
        />

        <p className="mt-6 rounded-2xl border border-primary bg-primary-soft px-5 py-4 text-sm leading-6 text-primary-soft-text">
          {t("readerNotice")}
        </p>
      </div>
    </main>
  );
}
