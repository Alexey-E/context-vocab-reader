import type { Metadata } from "next";

import { BackLink } from "@/components/back-link";
import { SiteHeader } from "@/components/site-header";
import { DocumentForm } from "@/features/documents/document-form";

export const metadata: Metadata = {
  title: "New document",
};

export default function NewDocumentPage() {
  return (
    <main className="min-h-dvh bg-page text-text">
      <SiteHeader />
      <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <BackLink href="/documents" label="My documents" />
        <div className="mt-6 rounded-3xl border border-border bg-surface px-5 py-7 shadow-sm sm:px-9 sm:py-10">
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
            New document
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            Add a text to your library
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Paste plain text and choose the language pair you want to use while
            reading.
          </p>
          <DocumentForm />
        </div>
      </section>
    </main>
  );
}
