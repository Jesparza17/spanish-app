"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import ExerciseCard, { type ExerciseResult } from "@/components/ExerciseCard";
import { fetchCombinedTestExercises, isCorrectAnswer, recordCombinedTestResult, type TopicExercise } from "@/lib/grammarQueue";

const TEST_LENGTH = 15;

function CombinedTestSession({ user }: { user: User }) {
  const [exercises, setExercises] = useState<TopicExercise[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const start = useCallback(async () => {
    setLoading(true);
    setFinished(false);
    setIndex(0);
    setCorrectCount(0);
    setExercises(await fetchCombinedTestExercises(TEST_LENGTH));
    setLoading(false);
  }, []);

  useEffect(() => {
    start();
  }, [start]);

  const current = exercises[index];

  async function handleResult(result: ExerciseResult) {
    const newCorrect = correctCount + (result.correct ? 1 : 0);
    setCorrectCount(newCorrect);
    if (index + 1 >= exercises.length) {
      await recordCombinedTestResult(user.id, newCorrect, exercises.length);
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Gramática</p>
          <h1 className="font-display text-3xl text-white">Test general</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6 space-y-5 pb-10">
        {!finished && exercises.length > 0 && !loading && (
          <p className="font-sans text-xs text-ink/45 text-center">
            {Math.min(index + 1, exercises.length)} / {exercises.length}
          </p>
        )}

        {loading ? (
          <p className="font-sans text-sm text-ink/50 text-center">Loading…</p>
        ) : exercises.length === 0 ? (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">No hay suficientes ejercicios todavía.</p>
          </div>
        ) : finished ? (
          <div className="rounded-2xl bg-card shadow-floating px-6 py-10 text-center">
            <p className="font-display text-2xl text-ink mb-1">
              {correctCount}/{exercises.length}
            </p>
            <p className="font-sans text-sm text-ink/60 mb-6">correct, across every topic</p>
            <button
              onClick={start}
              className="rounded-full bg-marigold text-white px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform"
            >
              Retake test
            </button>
          </div>
        ) : current ? (
          <ExerciseCard
            key={current.id}
            prompt={current.prompt}
            onGrade={async (answer) => {
              const correct = isCorrectAnswer(answer, current.acceptedAnswers);
              return { correct, correctAnswer: current.acceptedAnswers[0], explanation: current.explanation };
            }}
            onNext={handleResult}
          />
        ) : null}
      </div>
    </main>
  );
}

export default function CombinedGrammarTestPage() {
  return <AuthGate>{(user) => <CombinedTestSession user={user} />}</AuthGate>;
}
