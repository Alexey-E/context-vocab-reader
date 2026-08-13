import { getTranslations } from "next-intl/server";

import { AuthNavigationLink } from "@/components/auth-navigation-link";
import { LanguageSwitcher } from "@/features/locale/language-switcher";
import { ThemeSwitcher } from "@/features/theme/theme-switcher";
import { Link } from "@/i18n/navigation";
import { getAuthContext } from "@/lib/auth/require-user";

export async function SiteHeader() {
  const { authenticated } = await getAuthContext();
  const [common, navigation] = await Promise.all([
    getTranslations("Common"),
    getTranslations("Navigation"),
  ]);

  return (
    <header className="relative z-40 border-b border-border bg-surface">
      <div className="mx-auto flex min-h-18 w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href="/"
          lang="en"
          dir="ltr"
          className="font-bold tracking-tight text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Smart Reader
        </Link>
        <nav
          className="flex items-center gap-1 sm:gap-2"
          aria-label={navigation("primary")}
        >
          <Link
            href={authenticated ? "/documents" : "/samples"}
            className="hidden min-h-10 items-center rounded-full px-3 text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-primary sm:inline-flex"
          >
            {authenticated ? common("documents") : common("samples")}
          </Link>
          <LanguageSwitcher />
          <ThemeSwitcher />
          <AuthNavigationLink className="inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-contrast transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
        </nav>
      </div>
    </header>
  );
}
