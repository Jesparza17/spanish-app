"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import SpeakButton from "@/components/SpeakButton";
import { fetchDueGenderQueue, submitGenderGrade } from "@/lib/genderQueue";
import type { GenderNoun } from "@/lib/glossary";
import { useLanguage, type Language } from "@/lib/language";

const GENDER_ARTICLES: Record<Language, { m: string; f: string }> = {
  es: { m: "el", f: "la" },
  pt: { m: "o", f: "a" },
  fr: { m: "le", f: "la" },
};

const FEEDBACK_DELAY_MS = 500;
const GRADE_CORRECT = 4;
const GRADE_INCORRECT = 1;

function GenderDrill({ user }: { user: User }) {
  const { language } = useLanguage();
  const [queue, setQueue] = useState<GenderNoun[]>([]);
  const [poolSize, setPoolSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { due, totalPoolSize } = await fetchDueGenderQueue(user.id, language);
    setQueue(due);
    setPoolSize(totalPoolSize);
    setCorrectCount(0);
    setTotalCount(0);
    setFeedback(null);
    setLoading(false);
  }, [user.id, language]);

  useEffect(() => {
    load();
  }, [load]);

  const current = queue[0];
  const articles = GENDER_ARTICLES[language];

  async function handleChoice(choice: "m" | "f") {
    if (!current || feedback) return;
    const correct = choice === current.gender;
    setFeedback(correct ? "correct" : "incorrect");
    setTotalCount((n) => n + 1);
    if (correct) setCorrectCount((n) => n + 1);

    await submitGenderGrade(user.id, current.id, correct ? GRADE_CORRECT : GRADE_INCORRECT);

    setTimeout(() => {
      setFeedback(null);
      setQueue((q) => q.slice(1));
    }, FEEDBACK_DELAY_MS);
  }

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Gramática</p>
          <h1 className="font-display text-3xl text-white">
            {!loading && poolSize > 0 ? (queue.length > 0 ? `${queue.length} due` : "All caught up") : "Género"}
          </h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6 space-y-5 pb-10">
        {totalCount > 0 && (
          <p className="font-sans text-xs text-ink/45 text-center">
            {correctCount}/{totalCount} correct
          </p>
        )}

        {loading ? (
          <p className="font-sans text-sm text-ink/50 text-center">Loading…</p>
        ) : !current ? (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">
              {poolSize === 0
                ? "No gender-tagged nouns yet for this language — run the gender backfill first."
                : "Nothing due right now — check back later."}
            </p>
          </div>
        ) : (
          <div
            className={`rounded-2xl shadow-floating px-6 py-10 text-center transition-colors ${
              feedback === "correct" ? "bg-agave-light" : feedback === "incorrect" ? "bg-marigold-light" : "bg-card"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="font-display text-4xl text-ink">{current.lemma}</p>
              <SpeakButton text={current.lemma} />
            </div>
            <p className="font-sans text-sm text-ink/50 mb-8">{current.translation}</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChoice("m")}
                disabled={!!feedback}
                className={`rounded-2xl py-6 font-display text-2xl transition-transform active:scale-[0.97] disabled:opacity-60 ${
                  feedback && current.gender === "m" ? "bg-agave text-white" : "bg-ink/8 text-ink"
                }`}
              >
                {articles.m}
              </button>
              <button
                onClick={() => handleChoice("f")}
                disabled={!!feedback}
                className={`rounded-2xl py-6 font-display text-2xl transition-transform active:scale-[0.97] disabled:opacity-60 ${
                  feedback && current.gender === "f" ? "bg-agave text-white" : "bg-ink/8 text-ink"
                }`}
              >
                {articles.f}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function GenderPage() {
  return <AuthGate>{(user) => <GenderDrill user={user} />}</AuthGate>;
}
