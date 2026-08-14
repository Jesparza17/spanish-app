// Due-queue + grading for the género (gender) drill's persistent SRS state
// (gender_srs_state, see supabase/011_gender_srs.sql) — same SM-2 engine
// (./srs.ts) as vocab/verb review, kept in its own table since gender
// mastery is a separate skill from vocab-meaning mastery for the same word.

import { supabase } from "./supabaseClient";
import { nextReview, type SrsState } from "./srs";
import { fetchGenderPool, type GenderNoun } from "./glossary";
import { logReviewEvent } from "./reviewLog";
import type { Language } from "./language";

const MAX_QUEUE_SIZE = 30;
const DEFAULT_STATE: SrsState = { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface GenderQueueResult {
  due: GenderNoun[];
  /** Total gender-tagged nouns for this language, regardless of due status — lets the UI tell "nothing tagged yet" apart from "all caught up". */
  totalPoolSize: number;
}

/** Due nouns for this user — never-reviewed nouns count as due (lazy enrollment). */
export async function fetchDueGenderQueue(userId: string, language: Language = "es"): Promise<GenderQueueResult> {
  const [pool, { data: stateRows, error }] = await Promise.all([
    fetchGenderPool(language),
    supabase
      .from("gender_srs_state")
      .select("vocab_item_id, due_at, vocab_items!inner(language)")
      .eq("user_id", userId)
      .eq("vocab_items.language", language),
  ]);
  if (error) throw error;

  const dueAtByItem = new Map<string, string>((stateRows ?? []).map((r: any) => [r.vocab_item_id, r.due_at]));
  const now = Date.now();

  const due = shuffle(pool)
    .map((noun) => ({ noun, dueAt: dueAtByItem.get(noun.id) }))
    .filter(({ dueAt }) => !dueAt || new Date(dueAt).getTime() <= now)
    .sort((a, b) => new Date(a.dueAt ?? now).getTime() - new Date(b.dueAt ?? now).getTime())
    .map(({ noun }) => noun)
    .slice(0, MAX_QUEUE_SIZE);

  return { due, totalPoolSize: pool.length };
}

export async function submitGenderGrade(userId: string, vocabItemId: string, grade: number) {
  const { data: existing, error: fetchError } = await supabase
    .from("gender_srs_state")
    .select("ease_factor, interval_days, repetitions")
    .eq("user_id", userId)
    .eq("vocab_item_id", vocabItemId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  const state: SrsState = existing
    ? { easeFactor: existing.ease_factor, intervalDays: existing.interval_days, repetitions: existing.repetitions }
    : DEFAULT_STATE;
  const result = nextReview(state, grade);

  const { error } = await supabase.from("gender_srs_state").upsert(
    {
      user_id: userId,
      vocab_item_id: vocabItemId,
      ease_factor: result.easeFactor,
      interval_days: result.intervalDays,
      repetitions: result.repetitions,
      due_at: result.dueAt.toISOString(),
      last_reviewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,vocab_item_id" }
  );
  if (error) throw error;
  await logReviewEvent(userId, "srs_grade");
}
