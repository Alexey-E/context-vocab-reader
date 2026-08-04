import Link from "next/link";

import { AuthNavigationLink } from "@/components/auth-navigation-link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-18 w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="font-bold tracking-tight text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          Smart Reader
        </Link>
        <nav
          className="flex items-center gap-2"
          aria-label="Primary navigation"
        >
          <Link
            href="/samples"
            className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            Samples
          </Link>
          <AuthNavigationLink className="inline-flex min-h-10 items-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900" />
        </nav>
      </div>
    </header>
  );
}
