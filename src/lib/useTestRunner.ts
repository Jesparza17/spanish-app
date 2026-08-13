"use client";

import { useState } from "react";

export type TestRunnerPhase = "idle" | "active" | "results";

interface TestRunnerState<Q> {
  phase: TestRunnerPhase;
  queue: Q[];
  index: number;
  isReview: boolean;
  roundWrong: Q[];
  roundCorrect: number;
  firstRoundCorrect: number;
  firstRoundTotal: number;
}

function idleState<Q>(): TestRunnerState<Q> {
  return { phase: "idle", queue: [], index: 0, isReview: false, roundWrong: [], roundCorrect: 0, firstRoundCorrect: 0, firstRoundTotal: 0 };
}

/**
 * Shared state machine for every scored "test" surface (grammar topic,
 * combined, verb tense/tense-group) and for counted practice sessions: runs
 * through a batch of questions, tracks which were missed, and offers to
 * reprompt just those — repeating until either everything's answered
 * correctly or the user clicks "Done". The graded score is always the FIRST
 * pass only; review rounds never change it, matching Anki-style "the graded
 * attempt is your first try."
 */
export function useTestRunner<Q>(onFirstRoundComplete?: (correct: number, total: number) => void) {
  const [state, setState] = useState<TestRunnerState<Q>>(idleState);

  function start(questions: Q[]) {
    setState({
      phase: "active",
      queue: questions,
      index: 0,
      isReview: false,
      roundWrong: [],
      roundCorrect: 0,
      firstRoundCorrect: 0,
      firstRoundTotal: questions.length,
    });
  }

  function submit(correct: boolean, question: Q) {
    const roundCorrect = state.roundCorrect + (correct ? 1 : 0);
    const firstRoundCorrect = !state.isReview ? state.firstRoundCorrect + (correct ? 1 : 0) : state.firstRoundCorrect;
    const roundWrong = correct ? state.roundWrong : [...state.roundWrong, question];
    const nextIndex = state.index + 1;
    const roundOver = nextIndex >= state.queue.length;

    setState({ ...state, index: nextIndex, roundCorrect, firstRoundCorrect, roundWrong, phase: roundOver ? "results" : "active" });

    if (roundOver && !state.isReview) {
      onFirstRoundComplete?.(firstRoundCorrect, state.firstRoundTotal);
    }
  }

  function reviewMissed() {
    setState((s) => ({
      phase: "active",
      queue: s.roundWrong,
      index: 0,
      isReview: true,
      roundWrong: [],
      roundCorrect: 0,
      firstRoundCorrect: s.firstRoundCorrect,
      firstRoundTotal: s.firstRoundTotal,
    }));
  }

  /** Escape hatch — stop offering further reprompt rounds even if some are still missed. */
  function finishNow() {
    setState((s) => ({ ...s, roundWrong: [] }));
  }

  function reset() {
    setState(idleState());
  }

  const current = state.phase === "active" ? state.queue[state.index] : undefined;

  return {
    phase: state.phase,
    current,
    index: state.index,
    roundLength: state.queue.length,
    isReview: state.isReview,
    roundWrongCount: state.roundWrong.length,
    roundCorrect: state.roundCorrect,
    firstRoundCorrect: state.firstRoundCorrect,
    firstRoundTotal: state.firstRoundTotal,
    start,
    submit,
    reviewMissed,
    finishNow,
    reset,
  };
}
