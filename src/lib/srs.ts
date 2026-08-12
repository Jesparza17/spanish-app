// Spaced repetition engine (SM-2 variant), shared by vocab and verb review.
// A "grade" is how well the user knew the item on a 0-5 scale, same shape as Anki:
//   0-2 = didn't know it (resets the item)
//   3   = knew it, but it was effortful
//   4-5 = knew it easily

export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface SrsResult extends SrsState {
  dueAt: Date;
}

const MIN_EASE_FACTOR = 1.3;

export function nextReview(state: SrsState, grade: number, now: Date = new Date()): SrsResult {
  if (grade < 0 || grade > 5) throw new Error("grade must be between 0 and 5");

  let { easeFactor, intervalDays, repetitions } = state;

  if (grade < 3) {
    // Forgot it — restart the interval but keep the (slightly penalized) ease factor,
    // so items that keep getting missed still drift toward showing up more often.
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }

  // Ease factor adjustment, same formula as SM-2.
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  const dueAt = new Date(now);
  dueAt.setDate(dueAt.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, dueAt };
}

export function isDue(dueAt: string | Date, now: Date = new Date()): boolean {
  return new Date(dueAt).getTime() <= now.getTime();
}

// "I already know this" — for words well below your level that the normal
// grade progression would still resurface every few months. Skips the SM-2
// formula entirely and jumps straight to a multi-year interval, rather than
// requiring a string of "Easy" grades to earn a long gap.
const MASTERED_INTERVAL_DAYS = 3650;

export function masterItem(state: SrsState, now: Date = new Date()): SrsResult {
  const dueAt = new Date(now);
  dueAt.setDate(dueAt.getDate() + MASTERED_INTERVAL_DAYS);
  return {
    easeFactor: Math.max(state.easeFactor, 2.5),
    intervalDays: MASTERED_INTERVAL_DAYS,
    repetitions: state.repetitions + 1,
    dueAt,
  };
}
