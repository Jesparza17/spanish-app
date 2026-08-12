import { supabase } from "./supabaseClient";
import { logReviewEvent } from "./reviewLog";
import type { Language } from "./language";
import type { ReviewCard } from "./types";

export type ReviewMode =
  | { type: "frequency" } // all due items, most-overdue first, then most-frequent as tiebreaker
  | { type: "theme"; themeId: string }; // this week's themed list

const MAX_QUEUE_SIZE = 30;

export async function fetchDueQueue(
  userId: string,
  itemKind: "vocab" | "verb" | "both",
  mode: ReviewMode,
  language: Language = "es"
): Promise<ReviewCard[]> {
  const cards: ReviewCard[] = [];

  if (itemKind === "vocab" || itemKind === "both") {
    cards.push(...(await fetchDueVocab(userId, mode, language)));
  }
  if (itemKind === "verb" || itemKind === "both") {
    cards.push(...(await fetchDueVerbs(userId, mode, language)));
  }

  return cards.slice(0, MAX_QUEUE_SIZE);
}

async function fetchDueVocab(userId: string, mode: ReviewMode, language: Language): Promise<ReviewCard[]> {
  let query = supabase
    .from("srs_state")
    .select(
      `id, due_at, vocab_items!inner(id, lemma, translation, example_sentence, example_translation, cefr_level, frequency_rank, language${
        mode.type === "theme" ? ", vocab_item_themes!inner(theme_id)" : ""
      })`
    )
    .eq("user_id", userId)
    .not("vocab_item_id", "is", null)
    .eq("vocab_items.language", language)
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true });

  if (mode.type === "theme") {
    query = query.eq("vocab_items.vocab_item_themes.theme_id", mode.themeId);
  } else {
    query = query.order("frequency_rank", { foreignTable: "vocab_items", ascending: true, nullsFirst: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    srsId: row.id,
    kind: "vocab" as const,
    front: row.vocab_items.lemma,
    translation: row.vocab_items.translation,
    example: row.vocab_items.example_sentence,
    exampleTranslation: row.vocab_items.example_translation,
    cefrLevel: row.vocab_items.cefr_level,
  }));
}

async function fetchDueVerbs(userId: string, mode: ReviewMode, language: Language): Promise<ReviewCard[]> {
  let query = supabase
    .from("srs_state")
    .select(
      `id, due_at, verbs!inner(id, infinitive, translation, example_sentence, example_translation, cefr_level, frequency_rank, language${
        mode.type === "theme" ? ", verb_themes!inner(theme_id)" : ""
      })`
    )
    .eq("user_id", userId)
    .not("verb_id", "is", null)
    .eq("verbs.language", language)
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true });

  if (mode.type === "theme") {
    query = query.eq("verbs.verb_themes.theme_id", mode.themeId);
  } else {
    query = query.order("frequency_rank", { foreignTable: "verbs", ascending: true, nullsFirst: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    srsId: row.id,
    kind: "verb" as const,
    front: row.verbs.infinitive,
    translation: row.verbs.translation,
    example: row.verbs.example_sentence,
    exampleTranslation: row.verbs.example_translation,
    cefrLevel: row.verbs.cefr_level,
  }));
}

export async function submitGrade(
  srsId: string,
  easeFactor: number,
  intervalDays: number,
  repetitions: number,
  dueAt: Date,
  userId: string
) {
  const { error } = await supabase
    .from("srs_state")
    .update({
      ease_factor: easeFactor,
      interval_days: intervalDays,
      repetitions,
      due_at: dueAt.toISOString(),
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", srsId);
  if (error) throw error;
  await logReviewEvent(userId, "srs_grade");
}
