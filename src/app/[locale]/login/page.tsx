import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { signIn, signInWithGoogle, signUp } from "@/app/login/actions";
import { AuthForm } from "@/features/auth/auth-form";
import { LanguageSwitcher } from "@/features/locale/language-switcher";
import { ThemeSwitcher } from "@/features/theme/theme-switcher";
import { redirect } from "@/i18n/navigation";
import { getAuthContext } from "@/lib/auth/require-user";
import { parseAppErrorCode } from "@/lib/errors/catalog";
import { createErrorPayload } from "@/lib/errors/localize";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    description: t("loginDescription"),
    title: t("login"),
  };
}

type LoginPageProps = Readonly<{
  searchParams: Promise<{
    error?: string | string[];
  }>;
}>;

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const [{ authenticated }, locale, t] = await Promise.all([
    getAuthContext(),
    getLocale(),
    getTranslations("Auth"),
  ]);

  if (authenticated) {
    redirect({ href: "/account", locale });
  }

  const errorCode = getFirstValue(params.error);
  const parsedErrorCode = parseAppErrorCode(errorCode);
  const initialError = parsedErrorCode
    ? await createErrorPayload(parsedErrorCode, locale)
    : undefined;
  const signInAction = signIn.bind(null, locale);
  const signUpAction = signUp.bind(null, locale);
  const signInWithGoogleAction = signInWithGoogle.bind(null, locale);

  return (
    <main className="min-h-dvh overflow-x-clip bg-surface lg:grid lg:grid-cols-[minmax(520px,650px)_1fr] lg:bg-page">
      <section className="relative hidden min-h-screen overflow-hidden bg-inverse px-[clamp(3rem,5vw,4.75rem)] py-14 text-inverse-text lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-40 size-[420px] rounded-full bg-primary/10 blur-3xl"
        />
        <header className="relative flex items-center justify-between gap-4">
          <p
            lang="en"
            dir="ltr"
            className="text-2xl font-bold tracking-[-0.02em]"
          >
            Smart Reader
          </p>
          <div className="flex items-center gap-2">
            <LanguageSwitcher inverse />
            <ThemeSwitcher inverse />
          </div>
        </header>

        <div className="relative mt-24">
          <h2 className="max-w-[490px] text-[clamp(2.8rem,4vw,3.375rem)] leading-[0.97] font-bold tracking-[-0.045em]">
            {t("side.heading")}
          </h2>
          <p className="mt-7 max-w-[480px] text-lg leading-[1.45] text-inverse-text-muted">
            {t("side.description")}
          </p>
        </div>

        <aside className="relative mt-auto max-w-[470px] rounded-3xl border border-inverse-border bg-inverse-muted/50 p-7">
          <h3 className="text-lg font-semibold">{t("side.storageHeading")}</h3>
          <p className="mt-3 text-[15px] leading-6 text-inverse-text-muted">
            {t("side.storageDescription")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              {t("side.badgePrivate")}
            </span>
            <span className="rounded-full border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              {t("side.badgeAuth")}
            </span>
          </div>
        </aside>
      </section>

      <section className="flex min-h-dvh min-w-0 flex-col lg:items-center lg:justify-center lg:px-12 lg:py-20">
        <header className="bg-inverse px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10 text-inverse-text sm:px-8 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <p lang="en" dir="ltr" className="text-lg font-bold tracking-tight">
              Smart Reader
            </p>
            <div className="flex items-center gap-2">
              <LanguageSwitcher inverse />
              <ThemeSwitcher inverse />
            </div>
          </div>
          <h2 className="mt-7 max-w-sm text-[32px] leading-[1.05] font-bold tracking-[-0.04em]">
            {t("side.mobileHeading")}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-5 text-inverse-text-muted">
            {t("side.mobileDescription")}
          </p>
        </header>

        <div className="-mt-5 flex w-full min-w-0 flex-1 flex-col rounded-t-[28px] bg-surface px-5 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:mx-auto sm:-mt-6 sm:max-w-[550px] sm:px-10 lg:m-0 lg:max-w-none lg:flex-none lg:rounded-none lg:bg-transparent lg:p-0">
          <AuthForm
            initialError={initialError}
            signInAction={signInAction}
            signInWithGoogleAction={signInWithGoogleAction}
            signUpAction={signUpAction}
          />
          <aside className="mt-6 w-full max-w-[470px] rounded-2xl border border-primary bg-primary-soft px-5 py-4">
            <p className="text-sm font-bold text-primary-soft-text">
              {t("tier.heading")}
            </p>
            <p className="mt-1 text-xs leading-5 text-primary-soft-text">
              {t("tier.description")}
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
