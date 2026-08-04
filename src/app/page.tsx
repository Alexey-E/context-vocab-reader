import Link from "next/link";

import { AuthNavigationLink } from "@/components/auth-navigation-link";
import { ArrowRightIcon } from "@/components/icons/arrow-icons";
export default function Home() {
  return (
    <main className="min-h-dvh w-full overflow-hidden bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Smart Reader
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/Alexey-E/context-vocab-reader"
              className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex"
            >
              Portfolio MVP
            </Link>
            <AuthNavigationLink className="inline-flex min-h-10 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900" />
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)] lg:gap-16 lg:px-10 lg:py-16 xl:gap-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-blue-700 uppercase">
            Context-based language learning
          </div>

          <h1 className="mt-6 text-4xl leading-[1.04] font-bold tracking-[-0.045em] sm:text-6xl lg:text-[68px] xl:text-[76px]">
            Read naturally.
            <span className="block text-blue-600">Remember deeply.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
            Translate only what you need and turn useful words into vocabulary
            cards without losing the context where you found them.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/samples"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Start reading
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            >
              I already have an account
            </Link>
          </div>

          <ul className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6">
            <li>
              <span className="text-xs leading-4 text-slate-500">Read</span>
              <strong className="mt-1 block text-sm text-slate-900">
                Real texts
              </strong>
            </li>
            <li>
              <span className="text-xs leading-4 text-slate-500">
                Translate
              </span>
              <strong className="mt-1 block text-sm text-slate-900">
                On demand
              </strong>
            </li>
            <li>
              <span className="text-xs leading-4 text-slate-500">Remember</span>
              <strong className="mt-1 block text-sm text-slate-900">
                In context
              </strong>
            </li>
          </ul>
        </div>

        <div
          className="relative hidden min-w-0 lg:block"
          aria-label="Reader workflow preview"
        >
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-24 size-72 rounded-full bg-blue-200/70 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-20 size-64 rounded-full bg-teal-200/60 blur-3xl"
          />

          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_32px_80px_rgba(15,23,42,0.14)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-red-300" />
                <span className="size-2.5 rounded-full bg-amber-300" />
                <span className="size-2.5 rounded-full bg-emerald-300" />
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Reader preview
              </span>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_190px] gap-5 p-6 xl:grid-cols-[minmax(0,1fr)_210px] xl:p-8">
              <article>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    English
                  </span>
                  <ArrowRightIcon className="size-3.5 text-slate-300" />
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                    Spanish
                  </span>
                </div>

                <h2 className="mt-7 text-2xl font-bold tracking-tight text-slate-900">
                  Learning from context
                </h2>
                <p className="mt-4 text-[17px] leading-8 text-slate-600">
                  Language learning becomes more effective when new words appear
                  in{" "}
                  <mark className="rounded-md bg-blue-100 px-1.5 py-1 font-semibold text-blue-800">
                    meaningful context
                  </mark>
                  . Instead of memorizing isolated definitions, readers build
                  connections between meaning, tone, and real usage.
                </p>

                <div className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5 text-xs text-slate-400">
                  <span>2 min read</span>
                  <span aria-hidden="true">·</span>
                  <span>4 saved words</span>
                </div>
              </article>

              <aside className="self-center rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                <p className="text-[11px] font-bold tracking-[0.1em] text-blue-600 uppercase">
                  Translation
                </p>
                <p className="mt-3 text-sm font-bold text-slate-900">
                  meaningful context
                </p>
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  contexto significativo
                </p>
                <span
                  aria-hidden="true"
                  className="mt-5 flex min-h-10 w-full items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white"
                >
                  Save word
                </span>
              </aside>
            </div>
          </div>

          <div className="relative -mt-5 ml-auto mr-8 flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              4
            </span>
            <div>
              <p className="text-xs text-slate-500">Vocabulary cards</p>
              <p className="text-sm font-bold text-slate-900">
                Saved with context
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
