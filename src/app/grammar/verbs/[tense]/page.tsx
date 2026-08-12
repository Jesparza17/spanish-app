"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import ExerciseCard, { type ExerciseResult } from "@/components/ExerciseCard";
import {
  buildTenseQuestions,
  isCorrectAnswer,
  recordTenseTestResult,
  type TenseQuestion,
  type VerbCategory,
} from "@/lib/grammarQueue";
import { CORE_TENSES, TENSE_LABELS } from "@/lib/conjugation";
import { CORE_TENSES_PT, TENSE_LABELS_PT } from "@/lib/conjugationPt";
import { useLanguage } from "@/lib/language";

const TEST_LENGTH = 12;

const CATEGORIES: { value: VerbCategory; label: string }[] = [
  { value: "regular", label: "Regulars" },
  { value: "irregular", label: "Irregulars" },
  { value: "mix", label: "Mix" },
];

function TenseSession({ user, tense, label }: { user: User; tense: string; label: string }) {
  const { language } = useLanguage();
  const [mode, setMode] = useState<"practice" | "test">("practice");
  const [category, setCategory] = useState<VerbCategory>("mix");
  const [questions, setQuestions] = useState<TenseQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const startPractice = useCallback(
    async (cat: VerbCategory = category) => {
      setLoading(true);
      setMode("practice");
      setCategory(cat);
      setFinished(false);
      setIndex(0);
      setCorrectCount(0);
      setQuestions(await buildTenseQuestions(tense, 1, cat, language));
      setLoading(false);
    },
    [tense, category, language]
  );

  const startTest = useCallback(async () => {
    setLoading(true);
    setMode("test");
    setFinished(false);
    setIndex(0);
    setCorrectCount(0);
    setQuestions(await buildTenseQuestions(tense, TEST_LENGTH, "mix", language));
    setLoading(false);
  }, [tense, language]);

  useEffect(() => {
    startPractice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tense, language]);

  async function handleNextPractice() {
    setLoading(true);
    setQuestions(await buildTenseQuestions(tense, 1, category, language));
    setIndex(0);
    setLoading(false);
  }

  async function handleNextTest(wasCorrect: boolean) {
    const newCorrect = correctCount + (wasCorrect ? 1 : 0);
    setCorrectCount(newCorrect);
    if (index + 1 >= questions.length) {
      await recordTenseTestResult(user.id, tense, newCorrect, questions.length, language);
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handleNext(result: ExerciseResult) {
    if (mode === "practice") handleNextPractice();
    else handleNextTest(result.correct);
  }

  const current = questions[index];

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Verbos</p>
          <h1 className="font-display text-3xl text-white">{label}</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6 space-y-5 pb-10">
        <div className="flex gap-2">
          <button
            onClick={() => startPractice()}
            className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
              mode === "practice" ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
            }`}
          >
            Practice
          </button>
          <button
            onClick={startTest}
            className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
              mode === "test" ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
            }`}
          >
            Test
          </button>
        </div>

        {mode === "practice" && (
          <div className="flex gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => startPractice(c.value)}
                className={`flex-1 rounded-full px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                  category === c.value ? "bg-marigold text-white" : "bg-card text-ink/55 shadow-card"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {mode === "test" && !finished && questions.length > 0 && !loading && (
          <p className="font-sans text-xs text-ink/45 text-center">
            {Math.min(index + 1, questions.length)} / {questions.length}
          </p>
        )}

        {loading ? (
          <p className="font-sans text-sm text-ink/50 text-center">Loading…</p>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">
              No verbs available yet — run <code>npm run generate:verbs</code> first.
            </p>
          </div>
        ) : finished ? (
          <div className="rounded-2xl bg-card shadow-floating px-6 py-10 text-center">
            <p className="font-display text-2xl text-ink mb-1">
              {correctCount}/{questions.length}
            </p>
            <p className="font-sans text-sm text-ink/60 mb-6">correct</p>
            <button
              onClick={startTest}
              className="rounded-full bg-marigold text-white px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform"
            >
              Retake test
            </button>
          </div>
        ) : current ? (
          <ExerciseCard
            key={`${mode}-${index}-${current.verbId}-${current.prompt}`}
            prompt={current.prompt}
            translation={current.translation}
            onGrade={async (answer) => {
              const correct = isCorrectAnswer(answer, [current.answer]);
              return { correct, correctAnswer: current.answer, explanation: null };
            }}
            onNext={handleNext}
          />
        ) : null}
      </div>
    </main>
  );
}

export default function TensePage() {
  const params = useParams<{ tense: string }>();
  const tense = params.tense;
  const { language } = useLanguage();
  const tenses = language === "pt" ? CORE_TENSES_PT : CORE_TENSES;
  const labels: Record<string, string> = language === "pt" ? TENSE_LABELS_PT : TENSE_LABELS;
  const valid = (tenses as string[]).includes(tense);

  if (!valid) {
    return <p className="font-sans text-sm text-ink/50 px-6 pt-10">Unknown tense.</p>;
  }

  return <AuthGate>{(user) => <TenseSession user={user} tense={tense} label={labels[tense]} />}</AuthGate>;
}
