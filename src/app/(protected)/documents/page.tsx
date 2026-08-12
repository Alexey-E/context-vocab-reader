import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons/arrow-icons";
import { LanguagePair } from "@/components/language-pair";
import { SiteHeader } from "@/components/site-header";
import { DeleteDocumentButton } from "@/features/documents/delete-document-button";
import { listDocuments } from "@/features/documents/queries";
import { getLanguage } from "@/lib/languages";

export const metadata: Metadata = {
  title: "My documents",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function DocumentsPage() {
  const documents = await listDocuments();

  return (
    <main className="min-h-dvh bg-page text-text">
      <SiteHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
              Private library
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              My documents
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              Add texts you want to read and keep them private to your account.
            </p>
          </div>
          <Link
            href="/documents/new"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast shadow-lg transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Add document
          </Link>
        </div>

        {documents.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => {
              const source = getLanguage(document.source_language);
              const target = getLanguage(document.target_language);

              return (
                <li key={document.id}>
                  <article className="group flex h-full min-h-56 flex-col rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                    <div className="flex items-start gap-2">
                      <LanguagePair
                        className="flex-wrap pt-1"
                        sourceLanguage={
                          source?.name ?? document.source_language.toUpperCase()
                        }
                        targetLanguage={
                          target?.name ?? document.target_language.toUpperCase()
                        }
                      />
                      <div className="ml-auto -mt-1 -mr-2">
                        <DeleteDocumentButton
                          documentId={document.id}
                          documentTitle={document.title}
                        />
                      </div>
                    </div>
                    <h2 className="mt-6 text-xl font-bold tracking-tight">
                      <Link
                        href={`/documents/${document.id}`}
                        className="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {document.title}
                      </Link>
                    </h2>
                    <div className="mt-auto flex items-center justify-between gap-4 pt-8 text-xs text-subtle">
                      <span>
                        {dateFormatter.format(new Date(document.created_at))}
                      </span>
                      <Link
                        href={`/documents/${document.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        Open <ArrowRightIcon />
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
            <h2 className="text-2xl font-bold">Your library is empty</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              Paste your first text to prepare it for contextual reading and
              translation.
            </p>
            <Link
              href="/documents/new"
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Create first document
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
