import type { Metadata } from "next";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";

import { ArrowRightIcon } from "@/components/icons/arrow-icons";
import { LanguagePair } from "@/components/language-pair";
import { SiteHeader } from "@/components/site-header";
import { DeleteDocumentButton } from "@/features/documents/delete-document-button";
import { deleteDocument } from "@/features/documents/actions";
import { listDocuments } from "@/features/documents/queries";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("documents") };
}

export default async function DocumentsPage() {
  const [documents, t, common, format, locale] = await Promise.all([
    listDocuments(),
    getTranslations("Documents"),
    getTranslations("Common"),
    getFormatter(),
    getLocale(),
  ]);

  return (
    <main className="min-h-dvh bg-page text-text">
      <SiteHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
              {t("eyebrow")}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              {t("heading")}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              {t("description")}
            </p>
          </div>
          <Link
            href="/documents/new"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast shadow-lg transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("add")}
          </Link>
        </div>

        {documents.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => {
              return (
                <li key={document.id}>
                  <article className="group flex h-full min-h-56 flex-col rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                    <div className="flex items-start gap-2">
                      <LanguagePair
                        className="flex-wrap pt-1"
                        sourceLanguageCode={document.source_language}
                        targetLanguageCode={document.target_language}
                      />
                      <div className="ms-auto -mt-1 -me-2">
                        <DeleteDocumentButton
                          deleteAction={deleteDocument.bind(
                            null,
                            locale,
                            document.id,
                          )}
                          documentTitle={document.title}
                        />
                      </div>
                    </div>
                    <h2
                      dir="auto"
                      className="mt-6 text-xl font-bold tracking-tight"
                    >
                      <Link
                        href={`/documents/${document.id}`}
                        className="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {document.title}
                      </Link>
                    </h2>
                    <div className="mt-auto flex items-center justify-between gap-4 pt-8 text-xs text-subtle">
                      <span>
                        {format.dateTime(new Date(document.created_at), {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <Link
                        href={`/documents/${document.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {common("open")}{" "}
                        <span className="rtl:rotate-180">
                          <ArrowRightIcon />
                        </span>
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
            <h2 className="text-2xl font-bold">{t("emptyHeading")}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              {t("emptyDescription")}
            </p>
            <Link
              href="/documents/new"
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t("createFirst")}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
