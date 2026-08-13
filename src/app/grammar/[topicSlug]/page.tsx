"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import ExerciseCard, { type ExerciseResult } from "@/components/ExerciseCard";
import MasteryTierBadge from "@/components/MasteryTierBadge";
import {
  fetchGrammarTopicBySlug,
  fetchTopicExercises,
  isCorrectAnswer,
  recordTopicAttempt,
  recordTopicTestResult,
  TEST_PASS_THRESHOLD,
  type TestOutcome,
  type TopicExercise,
} from "@/lib/grammarQueue";
import { useTestRunner } from "@/lib/useTestRunner";
import { renderMiniMarkdown } from "@/lib/miniMarkdown";
import type { GrammarTopic } from "@/lib/types";

const TEST_LENGTH = 10;
const FREE_BATCH = 12;
const PRACTICE_COUNTS = [10, 20, 30] as const;

function TopicSession({ user, slug }: { user: User; slug: string }) {
  const [topic, setTopic] = useState<GrammarTopic | null | undefined>(undefined);
  const [mode, setMode] = useState<"practice" | "test">("practice");
  const [practiceCount, setPracticeCount] = useState<"free" | number>("free");
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<TestOutcome | null>(null);

  // Free practice — a simple continuous queue that silently refills when exhausted, not a graded round.
  const [freeQueue, setFreeQueue] = useState<TopicExercise[]>([]);
  const [freeIndex, setFreeIndex] = useState(0);

  const runner = useTestRunner<TopicExercise>((correct, total) => {
    if (mode === "test" && topic) {
      setOutcome(null);
      recordTopicTestResult(user.id, topic.slug, correct, total).then(setOutcome);
    }
  });

  const loadFreePractice = useCallback(async (topicId: string) => {
    setLoading(true);
    setMode("practice");
    setPracticeCount("free");
    setFreeIndex(0);
    setFreeQueue(await fetchTopicExercises(topicId, FREE_BATCH));
    setLoading(false);
  }, []);

  const loadCountedPractice = useCallback(async (topicId: string, count: number) => {
    setLoading(true);
    setMode("practice");
    setPracticeCount(count);
    const exercises = await fetchTopicExercises(topicId, count);
    runner.start(exercises);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTest = useCallback(async (topicId: string) => {
    setLoading(true);
    setMode("test");
    setOutcome(null);
    const exercises = await fetchTopicExercises(topicId, TEST_LENGTH);
    runner.start(exercises);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGrammarTopicBySlug(slug).then(async (t) => {
      if (cancelled) return;
      setTopic(t);
      if (t) await loadFreePractice(t.id);
      else setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (topic === undefined) return <p className="font-sans text-sm text-ink/50 px-6 pt-10">Loading…</p>;
  if (topic === null) return <p className="font-sans text-sm text-ink/50 px-6 pt-10">Topic not found.</p>;

  const isFree = mode === "practice" && practiceCount === "free";
  const current = isFree ? freeQueue[freeIndex] : runner.current;
  const passed = mode === "test" && runner.firstRoundTotal > 0 && runner.firstRoundCorrect / runner.firstRoundTotal >= TEST_PASS_THRESHOLD;

  async function handleResult(result: ExerciseResult, exercise: TopicExercise) {
    if (mode === "practice") {
      await recordTopicAttempt(user.id, topic!.slug, result.correct);
    }
    if (isFree) {
      const nextIndex = freeIndex + 1;
      if (nextIndex >= freeQueue.length) {
        setFreeQueue(await fetchTopicExercises(topic!.id, FREE_BATCH));
        setFreeIndex(0);
      } else {
        setFreeIndex(nextIndex);
      }
    } else {
      runner.submit(result.correct, exercise);
    }
  }

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Gramática</p>
          <h1 className="font-display text-3xl text-white">{topic.title}</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6 space-y-5 pb-10">
        <div className="rounded-2xl bg-card shadow-card px-6 py-6 font-sans text-sm text-ink/75 leading-relaxed space-y-3">
          {renderMiniMarkdown(topic.explanationMd)}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => loadFreePractice(topic.id)}
            className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
              mode === "practice" ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => loadTest(topic.id)}
            className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
              mode === "test" ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
            }`}
          >
            Test
          </button>
        </div>

        {mode === "practice" && (
          <div className="flex gap-2">
            <button
              onClick={() => loadFreePractice(topic.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors ${
                practiceCount === "free" ? "bg-marigold text-white" : "bg-card text-ink/55 shadow-card"
              }`}
            >
              Free
            </button>
            {PRACTICE_COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => loadCountedPractice(topic.id, c)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors ${
                  practiceCount === c ? "bg-marigold text-white" : "bg-card text-ink/55 shadow-card"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {!isFree && !loading && runner.phase === "active" && runner.roundLength > 0 && (
          <p className="font-sans text-xs text-ink/45 text-center">
            {runner.isReview ? "Reviewing missed · " : ""}
            {Math.min(runner.index + 1, runner.roundLength)} / {runner.roundLength}
          </p>
        )}

        {loading ? (
          <p className="font-sans text-sm text-ink/50 text-center">Loading…</p>
        ) : isFree ? (
          freeQueue.length === 0 ? (
            <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
              <p className="font-sans text-sm text-ink/60">No exercises yet for this topic.</p>
            </div>
          ) : current ? (
            <ExerciseCard
              key={`free-${freeIndex}-${current.id}`}
              prompt={current.prompt}
              onGrade={async (answer) => {
                const correct = isCorrectAnswer(answer, current.acceptedAnswers);
                return { correct, correctAnswer: current.acceptedAnswers[0], explanation: current.explanation };
              }}
              onNext={(result) => handleResult(result, current)}
            />
          ) : null
        ) : runner.roundLength === 0 ? (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">No exercises yet for this topic.</p>
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
                  <p className="font-sans text-sm text-ink/60">
                    {mode === "test" ? (passed ? "¡Aprobado!" : "No aprobado") : "correct"}
                  </p>
                  {mode === "test" && outcome && <MasteryTierBadge tier={outcome.tier} />}
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
                onClick={() => (mode === "test" ? loadTest(topic.id) : loadCountedPractice(topic.id, practiceCount as number))}
                className="rounded-full bg-marigold text-white px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform"
              >
                {mode === "test" ? "Retake test" : "Practice again"}
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
            onNext={(result) => handleResult(result, current)}
          />
        ) : null}
      </div>
    </main>
  );
}

export default function TopicPage() {
  const params = useParams<{ topicSlug: string }>();
  return <AuthGate>{(user) => <TopicSession user={user} slug={params.topicSlug} />}</AuthGate>;
}
