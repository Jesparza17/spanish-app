import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <p className="font-sans text-sm tracking-wide text-agave uppercase mb-2">Cuaderno</p>
      <h1 className="font-display text-4xl text-ink mb-8">Buenos días.</h1>

      <Link
        href="/vocab"
        className="block rounded-lg border border-line bg-white/60 px-5 py-4 hover:border-marigold transition-colors"
      >
        <span className="font-display text-lg text-ink">Vocab &amp; verbs</span>
        <span className="block font-sans text-sm text-ink/60 mt-1">Review what's due today</span>
      </Link>

      <div className="mt-4 rounded-lg border border-dashed border-line px-5 py-4 opacity-50">
        <span className="font-display text-lg text-ink">Grammar practice</span>
        <span className="block font-sans text-sm text-ink/60 mt-1">Coming next</span>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-line px-5 py-4 opacity-50">
        <span className="font-display text-lg text-ink">Diario</span>
        <span className="block font-sans text-sm text-ink/60 mt-1">Coming next</span>
      </div>
    </main>
  );
}
