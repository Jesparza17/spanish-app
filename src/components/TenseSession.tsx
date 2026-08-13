"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import ExerciseCard, { type ExerciseResult } from "@/components/ExerciseCard";
import MasteryTierBadge from "@/components/MasteryTierBadge";
import {
  buildTenseQuestions,
  isCorrectAnswer,
  recordTenseTestResult,
  recordTenseGroupTestResult,
  TEST_PASS_THRESHOLD,
  type TenseQuestion,
  type TestOutcome,
  type VerbCategory,
} from "@/lib/grammarQueue";
import { useTestRunner } from "@/lib/useTestRunner";
import { buildFillBlankPrompt, getTemplateGloss } from "@/lib/fillBlankTemplates";
import type { TenseGroupKey } from "@/lib/conjugation";
import { useLanguage } from "@/lib/language";

const TEST_LENGTH = 12;
const PRACTICE_COUNTS = [10, 20, 30] as const;

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
  const [practiceCount, setPracticeCount] = useState<"free" | number>("free");
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<TestOutcome | null>(null);
  const [showGloss, setShowGloss] = useState(false);

  // Free practice/fill-blank — a single continuously-redrawn question, not a graded round.
  const [freeQuestion, setFreeQuestion] = useState<TenseQuestion | undefined>(undefined);

  const runner = useTestRunner<TenseQuestion>((correct, total) => {
    if (mode !== "test") return;
    setOutcome(null);
    const record = groupKey
      ? recordTenseGroupTestResult(user.id, groupKey, correct, total, language)
      : recordTenseTestResult(user.id, tenses[0], correct, total, language);
    record.then(setOutcome);
  });

  const tenseArg = tenses.length === 1 ? tenses[0] : tenses;

  useEffect(() => {
    setShowGloss(false);
  }, [freeQuestion, runner.current, mode]);

  const startDrill = useCallback(
    async (nextMode: "practice" | "fillBlank", cat: VerbCategory = category, count: "free" | number = practiceCount) => {
      setLoading(true);
      setMode(nextMode);
      setCategory(cat);
      setPracticeCount(count);
      if (count === "free") {
        const qs = await buildTenseQuestions(tenseArg, 1, cat, language);
        setFreeQuestion(qs[0]);
      } else {
        runner.start(await buildTenseQuestions(tenseArg, count, cat, language));
      }
      setLoading(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [tenses.join(","), category, practiceCount, language]
  );

  const startTest = useCallback(async () => {
    setLoading(true);
    setMode("test");
    setOutcome(null);
    runner.start(await buildTenseQuestions(tenseArg, TEST_LENGTH, "mix", language));
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenses.join(","), language]);

  useEffect(() => {
    startDrill("practice", "mix", "free");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenses.join(","), language]);

  async function handleFreeNext() {
    setLoading(true);
    const qs = await buildTenseQuestions(tenseArg, 1, category, language);
    setFreeQuestion(qs[0]);
    setLoading(false);
  }

  function handleAnswered(result: ExerciseResult, question: TenseQuestion) {
    if (mode !== "test" && practiceCount === "free") {
      handleFreeNext();
    } else {
      runner.submit(result.correct, question);
    }
  }

  const isFree = mode !== "test" && practiceCount === "free";
  const current = isFree ? freeQuestion : runner.current;
  const questionTense = current?.tense ?? tenses[0];
  const displayPrompt =
    current && mode === "fillBlank"
      ? buildFillBlankPrompt(language, questionTense, current.person, current.infinitive, current.polarity)
      : current?.prompt;
  const templateGloss = mode === "fillBlank" ? getTemplateGloss(language, questionTense) : null;
  const passed = mode === "test" && runner.firstRoundTotal > 0 && runner.firstRoundCorrect / runner.firstRoundTotal >= TEST_PASS_THRESHOLD;

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
          <>
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
            <div className="flex gap-2">
              <button
                onClick={() => startDrill(mode, category, "free")}
                className={`shrink-0 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors ${
                  practiceCount === "free" ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
                }`}
              >
                Free
              </button>
              {PRACTICE_COUNTS.map((c) => (
                <button
                  key={c}
                  onClick={() => startDrill(mode, category, c)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors ${
                    practiceCount === c ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}

        {!isFree && !loading && runner.phase === "active" && runner.roundLength > 0 && (
          <p className="font-sans text-xs text-ink/45 text-center">
            {runner.isReview ? "Reviewing missed · " : ""}
            {Math.min(runner.index + 1, runner.roundLength)} / {runner.roundLength}
          </p>
        )}

        {loading ? (
          <p className="font-sans text-sm text-ink/50 text-center">Loading…</p>
        ) : !current && (isFree || runner.roundLength === 0) ? (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">
              No verbs available yet — run <code>npm run generate:verbs</code> first.
            </p>
          </div>
        ) : !isFree && runner.phase === "results" ? (
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
                  <p className="font-sans text-sm text-ink/60">{mode === "test" ? (passed ? "¡Aprobado!" : "No aprobado") : "correct"}</p>
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
                onClick={() => (mode === "test" ? startTest() : startDrill(mode, category, practiceCount))}
                className="rounded-full bg-marigold text-white px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform"
              >
                {mode === "test" ? "Retake test" : "Practice again"}
              </button>
            )}
          </div>
        ) : current ? (
          <>
            <ExerciseCard
              key={`${isFree ? "free" : runner.isReview ? "r" : "f"}-${isFree ? "" : runner.index}-${current.verbId}-${current.prompt}`}
              prompt={displayPrompt!}
              translation={current.translation}
              onGrade={async (answer) => {
                const correct = isCorrectAnswer(answer, [current.answer]);
                return { correct, correctAnswer: current.answer, explanation: null };
              }}
              onNext={(result) => handleAnswered(result, current)}
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
