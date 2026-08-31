import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BackLink } from "@/components/back-link";
import { SiteHeader } from "@/components/site-header";
import { getDocument, isDocumentId } from "@/features/documents/queries";
import { Reader } from "@/features/reader/reader";
import { listReaderVocabularyCards } from "@/features/vocabulary/queries.server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("document") };
}

type DocumentPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function DocumentPage({ params }: DocumentPageProps) {
  const [{ id }, common] = await Promise.all([
    params,
    getTranslations("Common"),
  ]);

  if (!isDocumentId(id)) {
    notFound();
  }

  const document = await getDocument(id);

  if (!document) {
    notFound();
  }

  const vocabularyCards = await listReaderVocabularyCards(
    document.source_language,
    document.target_language,
  );

  return (
    <main className="min-h-dvh bg-page text-text">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <BackLink href="/documents" label={common("myDocuments")} />

        <Reader
          content={document.content}
          resource={{ id: document.id, kind: "document" }}
          sourceLanguage={document.source_language}
          targetLanguage={document.target_language}
          title={document.title}
          visibility="private"
          vocabularyCards={vocabularyCards}
        />
      </div>
    </main>
  );
}
