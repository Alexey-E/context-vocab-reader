import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons/arrow-icons";
import { SiteHeader } from "@/components/site-header";
import { DocumentForm } from "@/features/documents/document-form";

export const metadata: Metadata = {
  title: "New document",
};

export default function NewDocumentPage() {
  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <SiteHeader />
      <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowLeftIcon />
          My documents
        </Link>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-9 sm:py-10">
          <p className="text-xs font-bold tracking-[0.14em] text-blue-600 uppercase">
            New document
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            Add a text to your library
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Paste plain text and choose the language pair you want to use while
            reading.
          </p>
          <DocumentForm />
        </div>
      </section>
    </main>
  );
}
