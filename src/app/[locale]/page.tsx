import { getTranslations } from "next-intl/server";

import { AuthNavigationLink } from "@/components/auth-navigation-link";
import { LanguagePair } from "@/components/language-pair";
import { LanguageSwitcher } from "@/features/locale/language-switcher";
import { ThemeSwitcher } from "@/features/theme/theme-switcher";
import { Link } from "@/i18n/navigation";

export default async function Home() {
  const [t, common] = await Promise.all([
    getTranslations("Landing"),
    getTranslations("Common"),
  ]);

  return (
    <main className="min-h-dvh w-full overflow-hidden bg-page text-text">
      <header className="relative z-40 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            lang="en"
            dir="ltr"
            className="text-lg font-bold tracking-tight"
          >
            Smart Reader
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="https://github.com/Alexey-E/context-vocab-reader"
              className="hidden rounded-full border border-success bg-success-soft px-3 py-1.5 text-xs font-semibold text-success-soft-text sm:inline-flex"
            >
              {common("portfolioMvp")}
            </Link>
            <LanguageSwitcher />
            <ThemeSwitcher />
            <AuthNavigationLink className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)] lg:gap-16 lg:px-10 lg:py-16 xl:gap-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary-soft px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-primary-soft-text uppercase">
            {t("badge")}
          </div>

          <h1 className="mt-6 text-4xl leading-[1.04] font-bold tracking-[-0.045em] sm:text-6xl lg:text-[68px] xl:text-[76px]">
            {t("headingFirst")}{" "}
            <span className="block text-primary">{t("headingSecond")}</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted sm:text-xl sm:leading-9">
            {t("description")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/samples"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-contrast shadow-lg transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t("startReading")}
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border-strong bg-surface px-6 text-sm font-semibold text-muted transition hover:border-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t("existingAccount")}
            </Link>
          </div>

          <ul className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
            <li>
              <span className="text-xs leading-4 text-muted">
                {t("stats.readLabel")}
              </span>
              <strong className="mt-1 block text-sm text-text">
                {t("stats.readValue")}
              </strong>
            </li>
            <li>
              <span className="text-xs leading-4 text-muted">
                {t("stats.translateLabel")}
              </span>
              <strong className="mt-1 block text-sm text-text">
                {t("stats.translateValue")}
              </strong>
            </li>
            <li>
              <span className="text-xs leading-4 text-muted">
                {t("stats.rememberLabel")}
              </span>
              <strong className="mt-1 block text-sm text-text">
                {t("stats.rememberValue")}
              </strong>
            </li>
          </ul>
        </div>

        <div
          className="relative hidden min-w-0 lg:block"
          aria-label={t("preview.ariaLabel")}
        >
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-24 size-72 rounded-full bg-primary-soft blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-20 size-64 rounded-full bg-success-soft blur-3xl"
          />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-surface p-3 shadow-[0_32px_80px_rgba(15,23,42,0.14)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-red-300" />
                <span className="size-2.5 rounded-full bg-amber-300" />
                <span className="size-2.5 rounded-full bg-emerald-300" />
              </div>
              <span className="text-xs font-semibold text-subtle">
                {t("preview.reader")}
              </span>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_190px] gap-5 p-6 xl:grid-cols-[minmax(0,1fr)_210px] xl:p-8">
              <article>
                <LanguagePair sourceLanguageCode="en" targetLanguageCode="es" />

                <h2 className="mt-7 text-2xl font-bold tracking-tight text-text">
                  {t("preview.contextTitle")}
                </h2>
                <p className="mt-4 text-[17px] leading-8 text-muted">
                  {t("preview.contextBodyBefore")}{" "}
                  <mark className="rounded-md bg-selected px-1.5 py-1 font-semibold text-selected-text">
                    {t("preview.meaningfulContext")}
                  </mark>
                  {". "}
                  {t("preview.contextBodyAfter")}
                </p>

                <div className="mt-7 flex items-center gap-3 border-t border-border pt-5 text-xs text-subtle">
                  <span>{t("preview.minutes", { count: 2 })}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t("preview.savedWords", { count: 4 })}</span>
                </div>
              </article>

              <aside className="self-center rounded-2xl border border-primary bg-primary-soft p-4 shadow-sm">
                <p className="text-[11px] font-bold tracking-widest text-primary uppercase">
                  {t("preview.translation")}
                </p>
                <p className="mt-3 text-sm font-bold text-text">
                  {t("preview.meaningfulContext")}
                </p>
                <p
                  lang="es"
                  dir="ltr"
                  className="mt-2 text-sm leading-5 text-muted"
                >
                  contexto significativo
                </p>
                <span
                  aria-hidden="true"
                  className="mt-5 flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold text-primary-contrast"
                >
                  {t("preview.saveWord")}
                </span>
              </aside>
            </div>
          </div>

          <div className="relative -mt-5 ms-auto me-8 flex w-fit items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-lg">
            <span className="flex size-9 items-center justify-center rounded-full bg-success-soft text-sm font-bold text-success-soft-text">
              4
            </span>
            <div>
              <p className="text-xs text-muted">
                {t("preview.vocabularyCards")}
              </p>
              <p className="text-sm font-bold text-text">
                {t("preview.savedWithContext")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
