"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import ExerciseCard, { type ExerciseResult } from "@/components/ExerciseCard";
import {
  buildTenseQuestions,
  isCorrectAnswer,
  recordTenseTestResult,
  recordTenseGroupTestResult,
  type TenseQuestion,
  type VerbCategory,
} from "@/lib/grammarQueue";
import { buildFillBlankPrompt, getTemplateGloss } from "@/lib/fillBlankTemplates";
import type { TenseGroupKey } from "@/lib/conjugation";
import { useLanguage } from "@/lib/language";

const TEST_LENGTH = 12;

const CATEGORIES: { value: VerbCategory; label: string }[] = [
  { value: "regular", label: "Regulars" },
  { value: "irregular", label: "Irregulars" },
  { value: "mix", label: "Mix" },
];

type Mode = "practice" | "fillBlank" | "test";

/**
 * Drives Practice / Fill blank / Test for either a single tense or a
 * broader group ("all past tenses", etc.) — `tenses` always holds one or
 * more tense identifiers; `groupKey` is only set for genuine multi-tense
 * sessions and picks which progress scope a finished test records to.
 */
export default function TenseSession({
  user,
  tenses,
  groupKey,
  label,
}: {
  user: User;
  tenses: string[];
  groupKey?: TenseGroupKey;
  label: string;
}) {
  const { language } = useLanguage();
  const [mode, setMode] = useState<Mode>("practice");
  const [category, setCategory] = useState<VerbCategory>("mix");
  const [questions, setQuestions] = useState<TenseQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [showGloss, setShowGloss] = useState(false);

  const tenseArg = tenses.length === 1 ? tenses[0] : tenses;

  useEffect(() => {
    setShowGloss(false);
  }, [index, mode]);

  const startDrill = useCallback(
    async (nextMode: "practice" | "fillBlank", cat: VerbCategory = category) => {
      setLoading(true);
      setMode(nextMode);
      setCategory(cat);
      setFinished(false);
      setIndex(0);
      setCorrectCount(0);
      setQuestions(await buildTenseQuestions(tenseArg, 1, cat, language));
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tenses.join(","), category, language]
  );

  const startTest = useCallback(async () => {
    setLoading(true);
    setMode("test");
    setFinished(false);
    setIndex(0);
    setCorrectCount(0);
    setQuestions(await buildTenseQuestions(tenseArg, TEST_LENGTH, "mix", language));
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenses.join(","), language]);

  useEffect(() => {
    startDrill("practice");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenses.join(","), language]);

  async function handleNextDrill() {
    setLoading(true);
    setQuestions(await buildTenseQuestions(tenseArg, 1, category, language));
    setIndex(0);
    setLoading(false);
  }

  async function handleNextTest(wasCorrect: boolean) {
    const newCorrect = correctCount + (wasCorrect ? 1 : 0);
    setCorrectCount(newCorrect);
    if (index + 1 >= questions.length) {
      if (groupKey) {
        await recordTenseGroupTestResult(user.id, groupKey, newCorrect, questions.length, language);
      } else {
        await recordTenseTestResult(user.id, tenses[0], newCorrect, questions.length, language);
      }
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handleNext(result: ExerciseResult) {
    if (mode === "test") handleNextTest(result.correct);
    else handleNextDrill();
  }

  const current = questions[index];
  const questionTense = current?.tense ?? tenses[0];
  const displayPrompt =
    current && mode === "fillBlank"
      ? buildFillBlankPrompt(language, questionTense, current.person, current.infinitive, current.polarity)
      : current?.prompt;
  const templateGloss = mode === "fillBlank" ? getTemplateGloss(language, questionTense) : null;

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
            onClick={() => startDrill("practice")}
            className={`flex-1 rounded-full px-3 py-2 font-sans text-sm font-medium transition-colors ${
              mode === "practice" ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => startDrill("fillBlank")}
            className={`flex-1 rounded-full px-3 py-2 font-sans text-sm font-medium transition-colors ${
              mode === "fillBlank" ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
            }`}
          >
            Fill blank
          </button>
          <button
            onClick={startTest}
            className={`flex-1 rounded-full px-3 py-2 font-sans text-sm font-medium transition-colors ${
              mode === "test" ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
            }`}
          >
            Test
          </button>
        </div>

        {(mode === "practice" || mode === "fillBlank") && (
          <div className="flex gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => startDrill(mode, c.value)}
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
          <>
            <ExerciseCard
              key={`${mode}-${index}-${current.verbId}-${current.prompt}`}
              prompt={displayPrompt!}
              translation={current.translation}
              onGrade={async (answer) => {
                const correct = isCorrectAnswer(answer, [current.answer]);
                return { correct, correctAnswer: current.answer, explanation: null };
              }}
              onNext={handleNext}
            />
            {mode === "fillBlank" && templateGloss && (
              <div className="text-center">
                <button
                  onClick={() => setShowGloss((v) => !v)}
                  className="font-sans text-xs text-ink/40 underline decoration-dotted underline-offset-4 active:text-ink/60 transition-colors"
                >
                  What do the other words mean?
                </button>
                {showGloss && (
                  <p className="font-sans text-xs text-ink/55 mt-2 animate-[fadeIn_0.15s_ease-out]">
                    {[templateGloss.prefixGloss, templateGloss.suffixGloss].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
