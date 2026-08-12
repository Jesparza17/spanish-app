"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import { fetchGrammarProgress, fetchGrammarTopics } from "@/lib/grammarQueue";
import { CORE_TENSES, TENSE_CEFR_LEVELS, TENSE_LABELS } from "@/lib/conjugation";
import type { GrammarProgress, GrammarTopic } from "@/lib/types";

function progressPct(progress: GrammarProgress[], scopeType: "topic" | "tense", scopeKey: string): number | null {
  const row = progress.find((p) => p.scopeType === scopeType && p.scopeKey === scopeKey);
  if (!row) return null;
  if (scopeType === "tense") return row.bestTestScore !== null ? Math.round(row.bestTestScore * 100) : null;
  return row.attemptCount > 0 ? Math.round((row.correctCount / row.attemptCount) * 100) : null;
}

function GrammarHome({ user }: { user: User }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"gramatica" | "verbos">(searchParams.get("tab") === "verbos" ? "verbos" : "gramatica");
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [progress, setProgress] = useState<GrammarProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchGrammarTopics(), fetchGrammarProgress(user.id)])
      .then(([t, p]) => {
        setTopics(t);
        setProgress(p);
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Cuaderno</p>
          <h1 className="font-display text-3xl text-white">Gramática</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("gramatica")}
            className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
              tab === "gramatica" ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
            }`}
          >
            Gramática
          </button>
          <button
            onClick={() => setTab("verbos")}
            className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
              tab === "verbos" ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
            }`}
          >
            Verbos
          </button>
        </div>

        {loading ? (
          <p className="font-sans text-sm text-ink/50">Loading…</p>
        ) : tab === "gramatica" ? (
          <div className="flex flex-col gap-2">
            <Link
              href="/grammar/test"
              className="flex items-center justify-between rounded-2xl bg-ink px-5 py-4 active:scale-[0.98] transition-transform"
            >
              <span className="font-display text-base text-white">Test general</span>
              <span className="font-sans text-xs text-white/60">todos los temas</span>
            </Link>
            {topics.map((topic) => {
              const pct = progressPct(progress, "topic", topic.slug);
              return (
                <Link
                  key={topic.id}
                  href={`/grammar/${topic.slug}`}
                  className="flex items-center justify-between rounded-2xl bg-card shadow-card px-5 py-4 active:scale-[0.98] transition-transform"
                >
                  <span>
                    <span className="block font-display text-base text-ink">{topic.title}</span>
                    <span className="block font-sans text-xs text-ink/45 mt-0.5 uppercase tracking-wide">{topic.cefrLevel}</span>
                  </span>
                  {pct !== null && (
                    <span className="font-sans text-xs font-medium text-agave-dark bg-agave-light rounded-full px-2.5 py-1 shrink-0">
                      {pct}%
                    </span>
                  )}
                </Link>
              );
            })}
            {topics.length === 0 && (
              <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
                <p className="font-sans text-sm text-ink/60">
                  No hay temas todavía — run <code>npm run seed:grammar-topics</code> then{" "}
                  <code>npm run generate:grammar</code>.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {CORE_TENSES.map((tense) => {
              const pct = progressPct(progress, "tense", tense);
              return (
                <Link
                  key={tense}
                  href={`/grammar/verbs/${tense}`}
                  className="flex items-center justify-between rounded-2xl bg-card shadow-card px-5 py-4 active:scale-[0.98] transition-transform"
                >
                  <span>
                    <span className="block font-display text-base text-ink">{TENSE_LABELS[tense]}</span>
                    <span className="block font-sans text-xs text-ink/45 mt-0.5 uppercase tracking-wide">
                      {TENSE_CEFR_LEVELS[tense]}
                    </span>
                  </span>
                  <span className="font-sans text-xs font-medium text-agave-dark bg-agave-light rounded-full px-2.5 py-1 shrink-0">
                    {pct ?? 0}%
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function GrammarPage() {
  return <AuthGate>{(user) => <GrammarHome user={user} />}</AuthGate>;
}
