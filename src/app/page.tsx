export default function Home() {
  return (
    <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
      <section className="w-full max-w-3xl">
        <p className="mb-4 text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Context-based language learning
        </p>

        <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
          Read naturally. Save what matters.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Translate sentences on demand and turn useful words into vocabulary
          cards without losing their original context.
        </p>

        <div className="mt-10 inline-flex rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          MVP in development
        </div>
      </section>
    </main>
  );
}
