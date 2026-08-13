"use client";

import { useCallback, useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import SpeakButton from "@/components/SpeakButton";
import { fetchGenderPool, type GenderNoun } from "@/lib/glossary";
import { useLanguage, type Language } from "@/lib/language";

const GENDER_ARTICLES: Record<Language, { m: string; f: string }> = {
  es: { m: "el", f: "la" },
  pt: { m: "o", f: "a" },
  fr: { m: "le", f: "la" },
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const FEEDBACK_DELAY_MS = 500;

function GenderDrill() {
  const { language } = useLanguage();
  const [pool, setPool] = useState<GenderNoun[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const nouns = await fetchGenderPool(language);
    setPool(shuffle(nouns));
    setIndex(0);
    setCorrectCount(0);
    setTotalCount(0);
    setFeedback(null);
    setLoading(false);
  }, [language]);

  useEffect(() => {
    load();
  }, [load]);

  const current = pool[index];
  const articles = GENDER_ARTICLES[language];

  async function handleChoice(choice: "m" | "f") {
    if (!current || feedback) return;
    const correct = choice === current.gender;
    setFeedback(correct ? "correct" : "incorrect");
    setTotalCount((n) => n + 1);
    if (correct) setCorrectCount((n) => n + 1);

    setTimeout(async () => {
      setFeedback(null);
      const nextIndex = index + 1;
      if (nextIndex >= pool.length) {
        const more = await fetchGenderPool(language);
        setPool(shuffle(more));
        setIndex(0);
      } else {
        setIndex(nextIndex);
      }
    }, FEEDBACK_DELAY_MS);
  }

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Gramática</p>
          <h1 className="font-display text-3xl text-white">Género</h1>
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
              No gender-tagged nouns yet for this language — run the gender backfill first.
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
  return <AuthGate>{() => <GenderDrill />}</AuthGate>;
}
