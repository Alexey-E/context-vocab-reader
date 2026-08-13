import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { RedirectType } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { Link, redirect } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("account") };
}

export default async function AccountPage() {
  const [locale, { claims }, t, common] = await Promise.all([
    getLocale(),
    requireUser(),
    getTranslations("Account"),
    getTranslations("Common"),
  ]);

  async function signOut() {
    "use server";

    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    const destination = error ? "/login?error=auth.signout_failed" : "/login";

    revalidatePath("/", "layout");
    redirect({ href: destination, locale }, RedirectType.replace);
  }

  const email = typeof claims.email === "string" ? claims.email : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6 py-16">
      <section className="w-full max-w-lg rounded-3xl border border-border bg-surface p-10 shadow-sm">
        <p
          lang="en"
          dir="ltr"
          className="text-sm font-semibold tracking-[0.08em] text-primary uppercase"
        >
          Context Vocab Reader
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text">
          {t("heading")}
        </h1>
        {email && (
          <p dir="ltr" className="mt-3 text-muted">
            {email}
          </p>
        )}
        <p className="mt-8 text-sm leading-6 text-muted">{t("description")}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/documents"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {common("myDocuments")}
          </Link>
          <Link
            href="/samples"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-muted transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {common("browseSamples")}
          </Link>
        </div>
        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-inverse px-5 font-semibold text-inverse-text transition-colors hover:bg-inverse-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("signOut")}
          </button>
        </form>
      </section>
    </main>
  );
}
