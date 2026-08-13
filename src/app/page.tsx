"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Flame } from "lucide-react";
import AuthGate from "@/components/AuthGate";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { fetchDashboardStats, type DashboardStats, type BucketCounts } from "@/lib/dashboard";
import { useLanguage, type Language } from "@/lib/language";
import type { CefrLevel } from "@/lib/types";

const LANGUAGES: { code: Language; flag: string; label: string }[] = [
  { code: "es", flag: "🇲🇽", label: "Español" },
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
];

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const MASTERY_LEGEND: { key: keyof Omit<BucketCounts, "total">; label: string; barClass: string; dotClass: string }[] = [
  { key: "new", label: "Nuevo", barClass: "bg-ink/15", dotClass: "bg-ink/15" },
  { key: "learning", label: "Aprendiendo", barClass: "bg-ink/40", dotClass: "bg-ink/40" },
  { key: "known", label: "Sabido", barClass: "bg-agave", dotClass: "bg-agave" },
  { key: "mastered", label: "Dominado", barClass: "bg-marigold", dotClass: "bg-marigold" },
];

function MasteryBar({ label, buckets }: { label: string; buckets: BucketCounts }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="font-sans text-xs text-ink/55">{label}</p>
        <p className="font-sans text-[10px] text-ink/40">
          {buckets.known + buckets.mastered}/{buckets.total} sabidas
        </p>
      </div>
      {buckets.total === 0 ? (
        <div className="h-2 rounded-full bg-ink/8" />
      ) : (
        <div className="h-2 rounded-full overflow-hidden flex">
          {MASTERY_LEGEND.map(({ key, barClass }) => (
            <div key={key} className={barClass} style={{ width: `${(buckets[key] / buckets.total) * 100}%` }} />
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard({ user }: { user: User }) {
  const { language, setLanguage } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDashboardStats(user.id, language)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [user.id, language]);

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
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex-1 rounded-2xl px-3 py-3 text-center shadow-card transition-colors ${
                language === lang.code ? "bg-ink text-white" : "bg-card text-ink/55"
              }`}
            >
              <span className="block text-xl">{lang.flag}</span>
              <span className="block font-sans text-[11px] font-medium mt-1">{lang.label}</span>
            </button>
          ))}
        </div>

        {loading || !stats ? (
          <p className="font-sans text-sm text-ink/50">Loading…</p>
        ) : (
          <>
            <div className="rounded-2xl bg-ink shadow-card px-6 py-6 flex items-center gap-5">
              <div className="w-20 h-20 shrink-0 rounded-full bg-marigold flex items-center justify-center">
                <span className="font-display text-2xl font-semibold text-white">
                  {stats.cefr.overallLevel ?? "—"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-sans text-xs tracking-[0.15em] text-white/50 uppercase mb-1">Tu nivel general</p>
                {stats.cefr.overallLevel === null ? (
                  <p className="font-sans text-sm text-white/70">Aún no hay suficientes datos.</p>
                ) : stats.cefr.nextLevel ? (
                  <p className="font-sans text-sm text-white/70">
                    {stats.cefr.nextLevelCoveragePct}% hacia {stats.cefr.nextLevel}
                  </p>
                ) : (
                  <p className="font-sans text-sm text-white/70">Nivel máximo alcanzado</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-card shadow-card px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={20} className={stats.activity.currentStreakDays > 0 ? "text-marigold" : "text-ink/25"} />
                <span className="font-display text-lg text-ink">
                  {stats.activity.currentStreakDays} día{stats.activity.currentStreakDays === 1 ? "" : "s"} seguidos
                </span>
              </div>
              <ActivityHeatmap activityByDate={stats.activity.activityByDate} />
              <p className="font-sans text-xs text-ink/40 mt-3">
                Racha más larga: {stats.activity.longestStreakDays} días · {stats.activity.totalReviews} repasos en
                total · {stats.activity.reviewsThisWeek} esta semana
              </p>
            </div>

            <div className="rounded-2xl bg-card shadow-card px-5 py-5">
              <p className="font-display text-lg text-ink mb-4">Dominio</p>
              <div className="space-y-4">
                <MasteryBar label="Vocab" buckets={stats.masteryBuckets.vocab} />
                <MasteryBar label="Verbos" buckets={stats.masteryBuckets.verbs} />
              </div>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {MASTERY_LEGEND.map(({ key, label, dotClass }) => (
                  <span key={key} className="inline-flex items-center gap-1.5 font-sans text-[10px] text-ink/45">
                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

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
                {stats.vocabVerbs.totalCount} palabras y verbos en tu repaso · {stats.vocabVerbs.seenCount} vistas
              </p>

              <p className="font-sans text-[10px] text-ink/35 uppercase tracking-wide mt-3">Vocab</p>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {LEVELS.map((level) => (
                  <span key={level} className="font-sans text-[10px] text-ink/45 bg-ink/5 rounded px-1.5 py-0.5">
                    {level} · {stats.vocabVerbs.knownVocabByLevel[level]}
                  </span>
                ))}
              </div>

              <p className="font-sans text-[10px] text-ink/35 uppercase tracking-wide mt-2.5">Verbos</p>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {LEVELS.map((level) => (
                  <span key={level} className="font-sans text-[10px] text-ink/45 bg-ink/5 rounded px-1.5 py-0.5">
                    {level} · {stats.vocabVerbs.knownVerbByLevel[level]}
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
              {stats.grammar.testsDue > 0 && (
                <span className="inline-block mt-2 font-sans text-xs font-medium text-marigold-dark bg-marigold-light rounded-full px-2.5 py-1">
                  {stats.grammar.testsDue} test{stats.grammar.testsDue === 1 ? "" : "s"} ready for retest
                </span>
              )}
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
              {stats.verbos.testsDue > 0 && (
                <span className="inline-block mt-2 font-sans text-xs font-medium text-marigold-dark bg-marigold-light rounded-full px-2.5 py-1">
                  {stats.verbos.testsDue} test{stats.verbos.testsDue === 1 ? "" : "s"} ready for retest
                </span>
              )}
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
