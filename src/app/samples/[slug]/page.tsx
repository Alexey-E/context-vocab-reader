import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { SiteHeader } from "@/components/site-header";
import { getSampleDocument } from "@/features/documents/queries";
import { Reader } from "@/features/reader/reader";

export const metadata: Metadata = {
  title: "Sample reader",
};

type SamplePageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export default async function SamplePage({ params }: SamplePageProps) {
  const { slug } = await params;
  const sample = await getSampleDocument(slug);

  if (!sample) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-page text-text">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <BackLink href="/samples" label="All samples" />

        <Reader
          content={sample.content}
          sourceLanguage={sample.source_language}
          targetLanguage={sample.target_language}
          title={sample.title}
          visibility="public"
        />

        <p className="mt-6 rounded-2xl border border-primary bg-primary-soft px-5 py-4 text-sm leading-6 text-primary-soft-text">
          This sample is read-only. Translation controls for selected text and
          complete sentences will be added in the next implementation stages.
        </p>
      </div>
    </main>
  );
}
