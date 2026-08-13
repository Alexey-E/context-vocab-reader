export default function SamplesLoading() {
  return (
    <main className="min-h-dvh bg-page px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-4 w-28 rounded bg-surface-muted" />
        <div className="mt-5 h-12 max-w-xl rounded bg-surface-muted" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-48 rounded-3xl bg-surface" />
          ))}
        </div>
      </div>
    </main>
  );
}
