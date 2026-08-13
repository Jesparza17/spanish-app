"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import MasteryTierBadge from "@/components/MasteryTierBadge";
import { fetchGrammarProgress, fetchGrammarTopics, masteryTierFromInterval, tenseScopeKey, tenseGroupScopeKey } from "@/lib/grammarQueue";
import { CORE_TENSES, TENSE_CEFR_LEVELS, TENSE_LABELS, TENSE_GROUPS, TENSE_GROUP_LABELS, type TenseGroupKey } from "@/lib/conjugation";
import { CORE_TENSES_PT, TENSE_CEFR_LEVELS_PT, TENSE_LABELS_PT, TENSE_GROUP_LABELS_PT, TENSE_GROUPS_PT } from "@/lib/conjugationPt";
import { CORE_TENSES_FR, TENSE_CEFR_LEVELS_FR, TENSE_LABELS_FR, TENSE_GROUP_LABELS_FR, TENSE_GROUPS_FR } from "@/lib/conjugationFr";
import { useLanguage } from "@/lib/language";
import type { GrammarProgress, GrammarTopic } from "@/lib/types";

const GROUP_KEYS: TenseGroupKey[] = ["present", "past", "subjunctive", "perfect", "all"];

function progressPct(progress: GrammarProgress[], scopeType: "topic" | "tense" | "tense_group", scopeKey: string): number | null {
  const row = progress.find((p) => p.scopeType === scopeType && p.scopeKey === scopeKey);
  if (!row) return null;
  if (scopeType === "tense" || scopeType === "tense_group") return row.bestTestScore !== null ? Math.round(row.bestTestScore * 100) : null;
  return row.attemptCount > 0 ? Math.round((row.correctCount / row.attemptCount) * 100) : null;
}

function tierFor(progress: GrammarProgress[], scopeType: "topic" | "tense" | "tense_group", scopeKey: string) {
  const row = progress.find((p) => p.scopeType === scopeType && p.scopeKey === scopeKey);
  return masteryTierFromInterval(row?.intervalDays ?? 0);
}

function GrammarHome({ user }: { user: User }) {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [tab, setTab] = useState<"gramatica" | "verbos">(searchParams.get("tab") === "verbos" ? "verbos" : "gramatica");
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [progress, setProgress] = useState<GrammarProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const tenses = language === "pt" ? CORE_TENSES_PT : language === "fr" ? CORE_TENSES_FR : CORE_TENSES;
  const tenseLabels: Record<string, string> = language === "pt" ? TENSE_LABELS_PT : language === "fr" ? TENSE_LABELS_FR : TENSE_LABELS;
  const tenseCefr: Record<string, string> =
    language === "pt" ? TENSE_CEFR_LEVELS_PT : language === "fr" ? TENSE_CEFR_LEVELS_FR : TENSE_CEFR_LEVELS;
  const groupLabels = language === "pt" ? TENSE_GROUP_LABELS_PT : language === "fr" ? TENSE_GROUP_LABELS_FR : TENSE_GROUP_LABELS;
  const groups = language === "pt" ? TENSE_GROUPS_PT : language === "fr" ? TENSE_GROUPS_FR : TENSE_GROUPS;

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchGrammarTopics(language), fetchGrammarProgress(user.id)])
      .then(([t, p]) => {
        setTopics(t);
        setProgress(p);
      })
      .finally(() => setLoading(false));
  }, [user.id, language]);

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
            <Link
              href="/grammar/gender"
              className="flex items-center justify-between rounded-2xl bg-ink px-5 py-4 active:scale-[0.98] transition-transform"
            >
              <span className="font-display text-base text-white">Género</span>
              <span className="font-sans text-xs text-white/60">práctica rápida</span>
            </Link>
            {topics.map((topic) => {
              const pct = progressPct(progress, "topic", topic.slug);
              const tier = tierFor(progress, "topic", topic.slug);
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
                  <span className="flex items-center gap-1.5 shrink-0">
                    <MasteryTierBadge tier={tier} />
                    {pct !== null && (
                      <span className="font-sans text-xs font-medium text-agave-dark bg-agave-light rounded-full px-2.5 py-1">{pct}%</span>
                    )}
                  </span>
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
            {GROUP_KEYS.map((key) => {
              const pct = progressPct(progress, "tense_group", tenseGroupScopeKey(key, language));
              const tier = tierFor(progress, "tense_group", tenseGroupScopeKey(key, language));
              return (
                <Link
                  key={key}
                  href={`/grammar/verbs/group/${key}`}
                  className="flex items-center justify-between rounded-2xl bg-ink px-5 py-4 active:scale-[0.98] transition-transform"
                >
                  <span>
                    <span className="block font-display text-base text-white">{groupLabels[key]}</span>
                    <span className="block font-sans text-xs text-white/50 mt-0.5">{groups[key].length} tenses</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <MasteryTierBadge tier={tier} />
                    {pct !== null && (
                      <span className="font-sans text-xs font-medium text-marigold bg-white/10 rounded-full px-2.5 py-1">{pct}%</span>
                    )}
                  </span>
                </Link>
              );
            })}
            {tenses.map((tense) => {
              const pct = progressPct(progress, "tense", tenseScopeKey(tense, language));
              const tier = tierFor(progress, "tense", tenseScopeKey(tense, language));
              return (
                <Link
                  key={tense}
                  href={`/grammar/verbs/${tense}`}
                  className="flex items-center justify-between rounded-2xl bg-card shadow-card px-5 py-4 active:scale-[0.98] transition-transform"
                >
                  <span>
                    <span className="block font-display text-base text-ink">{tenseLabels[tense]}</span>
                    <span className="block font-sans text-xs text-ink/45 mt-0.5 uppercase tracking-wide">
                      {tenseCefr[tense]}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <MasteryTierBadge tier={tier} />
                    <span className="font-sans text-xs font-medium text-agave-dark bg-agave-light rounded-full px-2.5 py-1">{pct ?? 0}%</span>
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
