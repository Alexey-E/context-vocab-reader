import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons/arrow-icons";
import { SiteHeader } from "@/components/site-header";
import { listSampleDocuments } from "@/features/documents/queries";
import { getLanguage } from "@/lib/languages";

export const metadata: Metadata = {
  title: "Sample texts",
  description: "Open a curated text and explore the reader without signing in.",
};

export default async function SamplesPage() {
  const samples = await listSampleDocuments();

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <SiteHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.14em] text-blue-600 uppercase">
            Public library
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            Choose a sample text
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Start reading without an account. Translation controls will be added
            in the next stages.
          </p>
        </div>

        {samples.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {samples.map((sample) => {
              const source = getLanguage(sample.source_language);
              const target = getLanguage(sample.target_language);

              return (
                <li key={sample.id}>
                  <Link
                    href={`/samples/${sample.slug}`}
                    className="group flex h-full min-h-48 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:p-7"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                        {source?.name ?? sample.source_language.toUpperCase()}
                      </span>
                      <ArrowRightIcon className="size-3.5 text-slate-300" />
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                        {target?.name ?? sample.target_language.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="mt-6 text-2xl font-bold tracking-tight group-hover:text-blue-700">
                      {sample.title}
                    </h2>
                    <span className="mt-auto inline-flex items-center gap-1 pt-8 text-sm font-semibold text-blue-600">
                      Open sample <ArrowRightIcon />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h2 className="text-xl font-bold">No sample texts yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Curated texts will appear here when they are available.
            </p>
          </div>
        )}

        <aside className="mt-10 flex flex-col gap-4 rounded-3xl bg-slate-900 px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="text-xl font-bold">Want to use your own text?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Create an account to keep private documents and vocabulary.
            </p>
          </div>
          <Link
            href="/login?mode=sign-up"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Create account
          </Link>
        </aside>
      </section>
    </main>
  );
}
