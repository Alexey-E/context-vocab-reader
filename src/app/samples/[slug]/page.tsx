import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons/arrow-icons";
import { SiteHeader } from "@/components/site-header";
import { getSampleDocument } from "@/features/documents/queries";
import { getLanguage } from "@/lib/languages";

export const metadata: Metadata = {
  title: "Sample reader",
};

type SamplePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SamplePage({ params }: SamplePageProps) {
  const { slug } = await params;
  const sample = await getSampleDocument(slug);

  if (!sample) {
    notFound();
  }

  const source = getLanguage(sample.source_language);
  const target = getLanguage(sample.target_language);

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/samples"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowLeftIcon />
          All samples
        </Link>

        <article className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
              Public sample
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {source?.name ?? sample.source_language.toUpperCase()}
            </span>
            <ArrowRightIcon className="size-3.5 text-slate-300" />
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
              {target?.name ?? sample.target_language.toUpperCase()}
            </span>
          </div>

          <h1 className="mt-7 text-3xl font-bold tracking-[-0.035em] sm:text-5xl">
            {sample.title}
          </h1>
          <div
            dir={source?.direction ?? "auto"}
            className="mt-8 whitespace-pre-wrap border-t border-slate-100 pt-8 text-lg leading-9 text-slate-700 sm:text-xl sm:leading-10"
          >
            {sample.content}
          </div>
        </article>

        <p className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-800">
          This sample is read-only. Sentence and word translation will be added
          in the next implementation stages.
        </p>
      </div>
    </main>
  );
}
