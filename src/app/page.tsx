"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import { fetchDashboardStats, type DashboardStats } from "@/lib/dashboard";
import type { CefrLevel } from "@/lib/types";

const LANGUAGES: { code: string; flag: string; label: string; active: boolean }[] = [
  { code: "es", flag: "🇲🇽", label: "Español", active: true },
  { code: "fr", flag: "🇫🇷", label: "Français", active: false },
  { code: "pt", flag: "🇧🇷", label: "Português", active: false },
];

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function Dashboard({ user }: { user: User }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats(user.id)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Cuaderno</p>
          <h1 className="font-display text-3xl text-white">Buenos días.</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6 space-y-5 pb-10">
        <div className="flex gap-2">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className={`flex-1 rounded-2xl px-3 py-3 text-center shadow-card ${
                lang.active ? "bg-ink text-white" : "bg-card text-ink/35 opacity-60"
              }`}
            >
              <span className="block text-xl">{lang.flag}</span>
              <span className="block font-sans text-[11px] font-medium mt-1">{lang.label}</span>
              {!lang.active && (
                <span className="block font-sans text-[9px] text-ink/35 mt-0.5 uppercase tracking-wide">Próximamente</span>
              )}
            </div>
          ))}
        </div>

        {loading || !stats ? (
          <p className="font-sans text-sm text-ink/50">Loading…</p>
        ) : (
          <>
            <Link href="/vocab" className="block rounded-2xl bg-card shadow-card px-5 py-5 active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-lg text-ink">Vocab & verbos</span>
                {stats.vocabVerbs.dueCount > 0 && (
                  <span className="font-sans text-xs font-medium text-marigold-dark bg-marigold-light rounded-full px-2.5 py-1">
                    {stats.vocabVerbs.dueCount} due
                  </span>
                )}
              </div>
              <p className="font-sans text-sm text-ink/55">
                {stats.vocabVerbs.totalCount} palabras y verbos en tu repaso
              </p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {LEVELS.map((level) => (
                  <span key={level} className="font-sans text-[10px] text-ink/45 bg-ink/5 rounded px-1.5 py-0.5">
                    {level} · {stats.vocabVerbs.knownByLevel[level]}
                  </span>
                ))}
              </div>
            </Link>

            <Link href="/grammar" className="block rounded-2xl bg-card shadow-card px-5 py-5 active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-lg text-ink">Gramática</span>
                <span className="font-sans text-xs font-medium text-agave-dark bg-agave-light rounded-full px-2.5 py-1">
                  {stats.grammar.topicsPracticed}/{stats.grammar.topicsTotal} temas
                </span>
              </div>
              <p className="font-sans text-sm text-ink/55">
                {stats.grammar.averageAccuracyPct !== null
                  ? `${stats.grammar.averageAccuracyPct}% de precisión promedio`
                  : "Aún no hay práctica"}
              </p>
            </Link>

            <Link
              href="/grammar?tab=verbos"
              className="block rounded-2xl bg-card shadow-card px-5 py-5 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-lg text-ink">Verbos</span>
                <span className="font-sans text-xs font-medium text-agave-dark bg-agave-light rounded-full px-2.5 py-1">
                  {stats.verbos.tensesTested}/{stats.verbos.tensesTotal} tiempos
                </span>
              </div>
              <p className="font-sans text-sm text-ink/55">
                {stats.verbos.averageBestScorePct !== null
                  ? `${stats.verbos.averageBestScorePct}% mejor puntaje promedio`
                  : "Aún no hay exámenes"}
              </p>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return <AuthGate>{(user) => <Dashboard user={user} />}</AuthGate>;
}
