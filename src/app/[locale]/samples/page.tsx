import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ArrowRightIcon } from "@/components/icons/arrow-icons";
import { LanguagePair } from "@/components/language-pair";
import { SiteHeader } from "@/components/site-header";
import { listSampleDocuments } from "@/features/documents/queries";
import { getAuthContext } from "@/lib/auth/require-user";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    description: t("samplesDescription"),
    title: t("samples"),
  };
}

export default async function SamplesPage() {
  const [samples, { authenticated }, t, auth] = await Promise.all([
    listSampleDocuments(),
    getAuthContext(),
    getTranslations("Samples"),
    getTranslations("Auth"),
  ]);

  return (
    <main className="min-h-dvh bg-page text-text">
      <SiteHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
            {t("description")}
          </p>
        </div>

        {samples.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {samples.map((sample) => {
              return (
                <li key={sample.id}>
                  <Link
                    href={`/samples/${sample.slug}`}
                    className="group flex h-full min-h-48 flex-col rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-7"
                  >
                    <LanguagePair
                      sourceLanguageCode={sample.source_language}
                      targetLanguageCode={sample.target_language}
                    />
                    <h2
                      dir="auto"
                      className="mt-6 text-2xl font-bold tracking-tight group-hover:text-primary"
                    >
                      {sample.title}
                    </h2>
                    <span className="mt-auto inline-flex items-center gap-1 pt-8 text-sm font-semibold text-primary">
                      {t("open")}{" "}
                      <span className="rtl:rotate-180">
                        <ArrowRightIcon />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
            <h2 className="text-xl font-bold">{t("emptyHeading")}</h2>
            <p className="mt-2 text-sm text-muted">{t("emptyDescription")}</p>
          </div>
        )}

        {!authenticated ? (
          <aside className="mt-10 flex flex-col gap-4 rounded-3xl bg-inverse px-6 py-7 text-inverse-text sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="text-xl font-bold">{t("signupHeading")}</h2>
              <p className="mt-1 text-sm leading-6 text-inverse-text-muted">
                {t("signupDescription")}
              </p>
            </div>
            <Link
              href="/login?mode=sign-up"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-surface px-5 text-sm font-semibold text-text transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {auth("createAccount")}
            </Link>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
