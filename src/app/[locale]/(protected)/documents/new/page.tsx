import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { BackLink } from "@/components/back-link";
import { SiteHeader } from "@/components/site-header";
import { createDocument } from "@/features/documents/actions";
import { DocumentForm } from "@/features/documents/document-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("newDocument") };
}

export default async function NewDocumentPage() {
  const [t, common, locale] = await Promise.all([
    getTranslations("Documents.form"),
    getTranslations("Common"),
    getLocale(),
  ]);
  const createAction = createDocument.bind(null, locale);

  return (
    <main className="min-h-dvh bg-page text-text">
      <SiteHeader />
      <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <BackLink href="/documents" label={common("myDocuments")} />
        <div className="mt-6 rounded-3xl border border-border bg-surface px-5 py-7 shadow-sm sm:px-9 sm:py-10">
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            {t("heading")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {t("description")}
          </p>
          <DocumentForm createAction={createAction} />
        </div>
      </section>
    </main>
  );
}
