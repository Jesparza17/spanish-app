"use client";

import { useState } from "react";
import SpeakButton from "@/components/SpeakButton";

export interface ExerciseResult {
  correct: boolean;
  correctAnswer: string;
  explanation?: string | null;
}

export default function ExerciseCard({
  prompt,
  translation,
  onGrade,
  onNext,
}: {
  prompt: string;
  translation?: string;
  onGrade: (answer: string) => Promise<ExerciseResult>;
  onNext: (result: ExerciseResult) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [grading, setGrading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || result || grading) return;
    setGrading(true);
    const graded = await onGrade(answer);
    setResult(graded);
    setGrading(false);
  }

  function handleNext() {
    if (!result) return;
    setAnswer("");
    const finished = result;
    setResult(null);
    onNext(finished);
  }

  return (
    <div className="rounded-2xl bg-card shadow-floating px-6 py-8">
      {translation && <p className="font-sans text-xs text-ink/45 uppercase tracking-wide mb-2">{translation}</p>}
      <div className="flex items-start gap-2 mb-5">
        <p className="font-display text-xl text-ink leading-snug">{prompt}</p>
        <SpeakButton text={prompt} className="mt-1 shrink-0" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!result || grading}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={`rounded-lg border px-3.5 py-2.5 font-sans text-base ${
            result ? (result.correct ? "border-agave bg-agave-light" : "border-marigold bg-marigold-light") : "border-line"
          }`}
          placeholder="Escribe tu respuesta"
        />

        {result && (
          <div className="rounded-lg bg-ink/5 px-3.5 py-3 text-sm font-sans">
            {result.correct ? (
              <p className="text-agave-dark font-medium">¡Correcto!</p>
            ) : (
              <p className="text-marigold-dark font-medium">
                Respuesta correcta: <span className="italic">{result.correctAnswer}</span>
              </p>
            )}
            {result.explanation && <p className="text-ink/60 mt-1">{result.explanation}</p>}
          </div>
        )}

        {result ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full bg-ink text-white px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            disabled={grading || !answer.trim()}
            className="rounded-full bg-marigold text-white px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            {grading ? "…" : "Comprobar"}
          </button>
        )}
      </form>
    </div>
  );
}
