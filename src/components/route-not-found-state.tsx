import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

type RouteNotFoundStateProps = Readonly<{
  actionHref: string;
  actionLabel: string;
  description: string;
  title: string;
}>;

export function RouteNotFoundState({
  actionHref,
  actionLabel,
  description,
  title,
}: RouteNotFoundStateProps) {
  const t = useTranslations("RouteStates");

  return (
    <main className="grid min-h-dvh place-items-center bg-page px-5 py-16 text-text">
      <section className="w-full max-w-lg rounded-3xl border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
          {t("notFoundEyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
        <Link
          href={actionHref}
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}
