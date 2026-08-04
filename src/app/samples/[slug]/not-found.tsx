import Link from "next/link";

export default function SampleNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 px-5 py-16 text-slate-950">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold tracking-[0.12em] text-blue-600 uppercase">
          Not found
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          This sample is unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          It may have been removed, or the link may be incorrect.
        </p>
        <Link
          href="/samples"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Browse samples
        </Link>
      </section>
    </main>
  );
}
