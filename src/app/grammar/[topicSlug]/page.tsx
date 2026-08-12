"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import ExerciseCard, { type ExerciseResult } from "@/components/ExerciseCard";
import {
  fetchGrammarTopicBySlug,
  fetchTopicExercises,
  isCorrectAnswer,
  recordTopicAttempt,
  recordTopicTestResult,
  type TopicExercise,
} from "@/lib/grammarQueue";
import { renderMiniMarkdown } from "@/lib/miniMarkdown";
import type { GrammarTopic } from "@/lib/types";

const TEST_LENGTH = 10;

function TopicSession({ user, slug }: { user: User; slug: string }) {
  const [topic, setTopic] = useState<GrammarTopic | null | undefined>(undefined);
  const [mode, setMode] = useState<"practice" | "test">("practice");
  const [exercises, setExercises] = useState<TopicExercise[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPractice = useCallback(async (topicId: string) => {
    setLoading(true);
    setMode("practice");
    setFinished(false);
    setIndex(0);
    setCorrectCount(0);
    setExercises(await fetchTopicExercises(topicId, 12));
    setLoading(false);
  }, []);

  const loadTest = useCallback(async (topicId: string) => {
    setLoading(true);
    setMode("test");
    setFinished(false);
    setIndex(0);
    setCorrectCount(0);
    setExercises(await fetchTopicExercises(topicId, TEST_LENGTH));
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGrammarTopicBySlug(slug).then(async (t) => {
      if (cancelled) return;
      setTopic(t);
      if (t) await loadPractice(t.id);
      else setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (topic === undefined) return <p className="font-sans text-sm text-ink/50 px-6 pt-10">Loading…</p>;
  if (topic === null) return <p className="font-sans text-sm text-ink/50 px-6 pt-10">Topic not found.</p>;

  const current = exercises[index];

  async function handleResult(result: ExerciseResult) {
    if (mode === "practice") {
      await recordTopicAttempt(user.id, topic!.slug, result.correct);
      setIndex((i) => i + 1);
      return;
    }
    const newCorrect = correctCount + (result.correct ? 1 : 0);
    setCorrectCount(newCorrect);
    if (index + 1 >= exercises.length) {
      await recordTopicTestResult(user.id, topic!.slug, newCorrect, exercises.length);
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
          <h1 className="font-display text-3xl text-white">{topic.title}</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6 space-y-5 pb-10">
        <div className="rounded-2xl bg-card shadow-card px-6 py-6 font-sans text-sm text-ink/75 leading-relaxed space-y-3">
          {renderMiniMarkdown(topic.explanationMd)}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => loadPractice(topic.id)}
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

        {mode === "test" && !finished && exercises.length > 0 && !loading && (
          <p className="font-sans text-xs text-ink/45 text-center">
            {Math.min(index + 1, exercises.length)} / {exercises.length}
          </p>
        )}

        {loading ? (
          <p className="font-sans text-sm text-ink/50 text-center">Loading…</p>
        ) : exercises.length === 0 ? (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">No exercises yet for this topic.</p>
          </div>
        ) : finished ? (
          <div className="rounded-2xl bg-card shadow-floating px-6 py-10 text-center">
            <p className="font-display text-2xl text-ink mb-1">
              {correctCount}/{exercises.length}
            </p>
            <p className="font-sans text-sm text-ink/60 mb-6">correct</p>
            <button
              onClick={() => loadTest(topic.id)}
              className="rounded-full bg-marigold text-white px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform"
            >
              Retake test
            </button>
          </div>
        ) : current ? (
          <ExerciseCard
            key={`${mode}-${current.id}`}
            prompt={current.prompt}
            onGrade={async (answer) => {
              const correct = isCorrectAnswer(answer, current.acceptedAnswers);
              return { correct, correctAnswer: current.acceptedAnswers[0], explanation: current.explanation };
            }}
            onNext={handleResult}
          />
        ) : (
          <div className="rounded-2xl bg-card shadow-floating px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">¡Listo! You finished this set.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TopicPage() {
  const params = useParams<{ topicSlug: string }>();
  return <AuthGate>{(user) => <TopicSession user={user} slug={params.topicSlug} />}</AuthGate>;
}
