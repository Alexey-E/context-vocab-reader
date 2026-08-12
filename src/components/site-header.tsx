import Link from "next/link";

import { AuthNavigationLink } from "@/components/auth-navigation-link";
import { ThemeSwitcher } from "@/features/theme/theme-switcher";
import { getAuthContext } from "@/lib/auth/require-user";

export async function SiteHeader() {
  const { authenticated } = await getAuthContext();

  return (
    <header className="relative z-40 border-b border-border bg-surface">
      <div className="mx-auto flex min-h-18 w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="font-bold tracking-tight text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Smart Reader
        </Link>
        <nav
          className="flex items-center gap-1 sm:gap-2"
          aria-label="Primary navigation"
        >
          <Link
            href={authenticated ? "/documents" : "/samples"}
            className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
          >
            {authenticated ? "Documents" : "Samples"}
          </Link>
          <ThemeSwitcher />
          <AuthNavigationLink className="inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-contrast transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
        </nav>
      </div>
    </header>
  );
}
