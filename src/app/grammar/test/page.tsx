"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import ExerciseCard from "@/components/ExerciseCard";
import MasteryTierBadge from "@/components/MasteryTierBadge";
import {
  fetchCombinedTestExercises,
  isCorrectAnswer,
  recordCombinedTestResult,
  TEST_PASS_THRESHOLD,
  type TestOutcome,
  type TopicExercise,
} from "@/lib/grammarQueue";
import { useTestRunner } from "@/lib/useTestRunner";
import { useLanguage } from "@/lib/language";

const TEST_LENGTH = 15;

function CombinedTestSession({ user }: { user: User }) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<TestOutcome | null>(null);
  const runner = useTestRunner<TopicExercise>((correct, total) => {
    setOutcome(null);
    recordCombinedTestResult(user.id, correct, total).then(setOutcome);
  });

  const start = useCallback(async () => {
    setLoading(true);
    setOutcome(null);
    const exercises = await fetchCombinedTestExercises(language, TEST_LENGTH);
    runner.start(exercises);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const current = runner.current;
  const passed = runner.firstRoundTotal > 0 && runner.firstRoundCorrect / runner.firstRoundTotal >= TEST_PASS_THRESHOLD;

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Gramática</p>
          <h1 className="font-display text-3xl text-white">Test general</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6 space-y-5 pb-10">
        {runner.phase === "active" && runner.roundLength > 0 && !loading && (
          <p className="font-sans text-xs text-ink/45 text-center">
            {runner.isReview ? "Reviewing missed · " : ""}
            {Math.min(runner.index + 1, runner.roundLength)} / {runner.roundLength}
          </p>
        )}

        {loading ? (
          <p className="font-sans text-sm text-ink/50 text-center">Loading…</p>
        ) : runner.roundLength === 0 ? (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">No hay suficientes ejercicios todavía.</p>
          </div>
        ) : runner.phase === "results" ? (
          <div className="rounded-2xl bg-card shadow-floating px-6 py-10 text-center">
            {runner.isReview ? (
              <>
                <p className="font-display text-2xl text-ink mb-1">
                  {runner.roundCorrect}/{runner.roundLength}
                </p>
                <p className="font-sans text-sm text-ink/60 mb-6">correct this round</p>
              </>
            ) : (
              <>
                <p className="font-display text-2xl text-ink mb-1">
                  {runner.firstRoundCorrect}/{runner.firstRoundTotal}
                </p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <p className="font-sans text-sm text-ink/60">{passed ? "¡Aprobado!" : "No aprobado"} · across every topic</p>
                  {outcome && <MasteryTierBadge tier={outcome.tier} />}
                </div>
              </>
            )}

            {runner.roundWrongCount > 0 ? (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={runner.reviewMissed}
                  className="rounded-full bg-marigold text-white px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform"
                >
                  Review {runner.roundWrongCount} missed
                </button>
                <button
                  onClick={runner.finishNow}
                  className="rounded-full bg-ink/8 text-ink/60 px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform"
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                onClick={start}
                className="rounded-full bg-marigold text-white px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform"
              >
                Retake test
              </button>
            )}
          </div>
        ) : current ? (
          <ExerciseCard
            key={`${runner.isReview ? "r" : "f"}-${runner.index}-${current.id}`}
            prompt={current.prompt}
            onGrade={async (answer) => {
              const correct = isCorrectAnswer(answer, current.acceptedAnswers);
              return { correct, correctAnswer: current.acceptedAnswers[0], explanation: current.explanation };
            }}
            onNext={(result) => runner.submit(result.correct, current)}
          />
        ) : null}
      </div>
    </main>
  );
}

export default function CombinedGrammarTestPage() {
  return <AuthGate>{(user) => <CombinedTestSession user={user} />}</AuthGate>;
}
