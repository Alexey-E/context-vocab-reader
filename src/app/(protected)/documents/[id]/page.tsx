import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { SiteHeader } from "@/components/site-header";
import { getDocument, isDocumentId } from "@/features/documents/queries";
import { Reader } from "@/features/reader/reader";

export const metadata: Metadata = {
  title: "Document",
};

type DocumentPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params;

  if (!isDocumentId(id)) {
    notFound();
  }

  const document = await getDocument(id);

  if (!document) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-page text-text">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <BackLink href="/documents" label="My documents" />

        <Reader
          content={document.content}
          sourceLanguage={document.source_language}
          targetLanguage={document.target_language}
          title={document.title}
          visibility="private"
        />
      </div>
    </main>
  );
}
