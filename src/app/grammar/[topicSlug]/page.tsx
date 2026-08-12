"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import ExerciseCard from "@/components/ExerciseCard";
import { fetchGrammarTopicBySlug, fetchTopicExercises, isCorrectAnswer, recordTopicAttempt, type TopicExercise } from "@/lib/grammarQueue";
import { renderMiniMarkdown } from "@/lib/miniMarkdown";
import type { GrammarTopic } from "@/lib/types";

function TopicSession({ user, slug }: { user: User; slug: string }) {
  const [topic, setTopic] = useState<GrammarTopic | null>(null);
  const [exercises, setExercises] = useState<TopicExercise[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGrammarTopicBySlug(slug).then(async (t) => {
      if (cancelled) return;
      setTopic(t);
      if (t) setExercises(await fetchTopicExercises(t.id));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <p className="font-sans text-sm text-ink/50 px-6 pt-10">Loading…</p>;
  if (!topic) return <p className="font-sans text-sm text-ink/50 px-6 pt-10">Topic not found.</p>;

  const current = exercises[index];

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

        {exercises.length === 0 ? (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">
              No practice exercises yet for this topic — run <code>npm run generate:grammar -- --topic {topic.slug}</code>.
            </p>
          </div>
        ) : current ? (
          <ExerciseCard
            key={current.id}
            prompt={current.prompt}
            onGrade={async (answer) => {
              const correct = isCorrectAnswer(answer, current.acceptedAnswers);
              await recordTopicAttempt(user.id, topic.slug, correct);
              return { correct, correctAnswer: current.acceptedAnswers[0], explanation: current.explanation };
            }}
            onNext={() => setIndex((i) => i + 1)}
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
