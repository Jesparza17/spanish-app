import { supabase } from "./supabaseClient";
import {
  PERSONS,
  PERSON_LABELS,
  conjugate,
  conjugateImperative,
  isFullySupported,
  isIrregularForm,
  type ConjugableTense,
  type ImperativePerson,
  type ImperativePolarity,
  type Person,
  type Tense,
} from "./conjugation";
import { logReviewEvent } from "./reviewLog";
import type { GrammarProgress, GrammarTopic } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function fetchGrammarTopics(): Promise<GrammarTopic[]> {
  const { data, error } = await supabase
    .from("grammar_topics")
    .select("id, slug, title, category, explanation_md, cefr_level, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    explanationMd: row.explanation_md,
    cefrLevel: row.cefr_level,
    sortOrder: row.sort_order,
  }));
}

export async function fetchGrammarTopicBySlug(slug: string): Promise<GrammarTopic | null> {
  const { data, error } = await supabase
    .from("grammar_topics")
    .select("id, slug, title, category, explanation_md, cefr_level, sort_order")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    category: data.category,
    explanationMd: data.explanation_md,
    cefrLevel: data.cefr_level,
    sortOrder: data.sort_order,
  };
}

export async function fetchGrammarProgress(userId: string): Promise<GrammarProgress[]> {
  const { data, error } = await supabase
    .from("grammar_progress")
    .select("scope_type, scope_key, correct_count, attempt_count, best_test_score, last_practiced_at")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    scopeType: row.scope_type,
    scopeKey: row.scope_key,
    correctCount: row.correct_count,
    attemptCount: row.attempt_count,
    bestTestScore: row.best_test_score,
    lastPracticedAt: row.last_practiced_at,
  }));
}

export interface TopicExercise {
  id: string;
  prompt: string;
  acceptedAnswers: string[];
  explanation: string | null;
}

export async function fetchTopicExercises(topicId: string, limit = 12): Promise<TopicExercise[]> {
  const { data, error } = await supabase
    .from("grammar_exercises")
    .select("id, prompt, accepted_answers, explanation")
    .eq("topic_id", topicId)
    .eq("verified", true)
    .limit(200);
  if (error) throw error;
  const exercises = (data ?? []).map((row: any) => ({
    id: row.id,
    prompt: row.prompt,
    acceptedAnswers: row.accepted_answers,
    explanation: row.explanation,
  }));
  return shuffle(exercises).slice(0, limit);
}

/** Random sample across every topic's exercises, for the combined Gramática test. */
export async function fetchCombinedTestExercises(limit = 15): Promise<TopicExercise[]> {
  const { data, error } = await supabase
    .from("grammar_exercises")
    .select("id, prompt, accepted_answers, explanation")
    .not("topic_id", "is", null)
    .eq("verified", true)
    .limit(500);
  if (error) throw error;
  const exercises = (data ?? []).map((row: any) => ({
    id: row.id,
    prompt: row.prompt,
    acceptedAnswers: row.accepted_answers,
    explanation: row.explanation,
  }));
  return shuffle(exercises).slice(0, limit);
}

interface EligibleVerb {
  id: string;
  infinitive: string;
  translation: string;
  verb_type: string;
}

async function fetchEligibleVerbs(): Promise<EligibleVerb[]> {
  const { data, error } = await supabase.from("verbs").select("id, infinitive, translation, verb_type").eq("verified", true);
  if (error) throw error;
  return (data ?? []).filter((v: EligibleVerb) => isFullySupported(v.infinitive, v.verb_type));
}

export interface TenseQuestion {
  verbId: string;
  infinitive: string;
  translation: string;
  prompt: string;
  answer: string;
}

const IMPERATIVE_PERSONS: ImperativePerson[] = ["tu", "usted", "nosotros", "ustedes"];
const IMPERATIVE_POLARITIES: ImperativePolarity[] = ["affirmative", "negative"];

export type VerbCategory = "regular" | "irregular" | "mix";

function matchesCategory(formIsIrregular: boolean, category: VerbCategory): boolean {
  if (category === "mix") return true;
  return category === "irregular" ? formIsIrregular : !formIsIrregular;
}

/**
 * Builds a fresh, randomized set of conjugation-drill questions for a tense
 * — computed live from the deterministic engine, never stored.
 *
 * Regularity is classified per (verb, person) form, not per verb: most
 * irregular verbs are only irregular in some tenses and some persons (e.g.
 * tener's imperfecto is fully regular; pensar's nosotros form doesn't stem-
 * change even in tenses where the other persons do). So "Regulars" and
 * "Irregulars" enumerate every valid form for the tense, classify each one
 * with isIrregularForm, and only then filter — a pool built by excluding
 * whole verbs would put regular forms of irregular verbs in the wrong
 * bucket.
 */
export async function buildTenseQuestions(tense: Tense, count: number, category: VerbCategory = "mix"): Promise<TenseQuestion[]> {
  const pool = await fetchEligibleVerbs();
  if (!pool.length) return [];

  if (tense === "imperativo") {
    const candidates: { verb: EligibleVerb; person: ImperativePerson; polarity: ImperativePolarity }[] = [];
    for (const verb of pool) {
      for (const person of IMPERATIVE_PERSONS) {
        for (const polarity of IMPERATIVE_POLARITIES) {
          const irregular = isIrregularForm(verb.infinitive, tense, person, polarity);
          if (matchesCategory(irregular, category)) candidates.push({ verb, person, polarity });
        }
      }
    }
    if (!candidates.length) return [];

    const questions: TenseQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const c = candidates[Math.floor(Math.random() * candidates.length)];
      const answer = conjugateImperative(c.verb.infinitive, c.person, c.polarity);
      const label = `${c.polarity === "negative" ? "no · " : ""}${PERSON_LABELS[c.person]}`;
      questions.push({
        verbId: c.verb.id,
        infinitive: c.verb.infinitive,
        translation: c.verb.translation,
        prompt: `${c.verb.infinitive} — ${label}`,
        answer,
      });
    }
    return questions;
  }

  const candidates: { verb: EligibleVerb; person: Person }[] = [];
  for (const verb of pool) {
    for (const person of PERSONS) {
      const irregular = isIrregularForm(verb.infinitive, tense, person);
      if (matchesCategory(irregular, category)) candidates.push({ verb, person });
    }
  }
  if (!candidates.length) return [];

  const questions: TenseQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const c = candidates[Math.floor(Math.random() * candidates.length)];
    const answer = conjugate(c.verb.infinitive, tense as ConjugableTense, c.person);
    questions.push({
      verbId: c.verb.id,
      infinitive: c.verb.infinitive,
      translation: c.verb.translation,
      prompt: `${c.verb.infinitive} — ${PERSON_LABELS[c.person]}`,
      answer,
    });
  }
  return questions;
}

/** Case-insensitive, accent-sensitive — accents are grammatically meaningful (hablo vs. habló). */
export function isCorrectAnswer(input: string, accepted: string[]): boolean {
  const normalized = input.trim().toLowerCase();
  return accepted.some((a) => a.trim().toLowerCase() === normalized);
}

async function upsertProgress(
  userId: string,
  scopeType: "topic" | "tense" | "combined",
  scopeKey: string,
  patch: { correctDelta: number; attemptDelta: number; bestTestScore?: number }
) {
  const { data: existing } = await supabase
    .from("grammar_progress")
    .select("correct_count, attempt_count, best_test_score")
    .eq("user_id", userId)
    .eq("scope_type", scopeType)
    .eq("scope_key", scopeKey)
    .maybeSingle();

  const { error } = await supabase.from("grammar_progress").upsert(
    {
      user_id: userId,
      scope_type: scopeType,
      scope_key: scopeKey,
      correct_count: (existing?.correct_count ?? 0) + patch.correctDelta,
      attempt_count: (existing?.attempt_count ?? 0) + patch.attemptDelta,
      best_test_score:
        patch.bestTestScore !== undefined
          ? Math.max(existing?.best_test_score ?? 0, patch.bestTestScore)
          : existing?.best_test_score ?? null,
      last_practiced_at: new Date().toISOString(),
    },
    { onConflict: "user_id,scope_type,scope_key" }
  );
  if (error) throw error;
}

export async function recordTopicAttempt(userId: string, topicSlug: string, correct: boolean) {
  await upsertProgress(userId, "topic", topicSlug, { correctDelta: correct ? 1 : 0, attemptDelta: 1 });
  await logReviewEvent(userId, "topic_attempt");
}

/** Verbos "Test" mode only — practice mode never calls this, so drilling freely doesn't move the progress ring. */
export async function recordTenseTestResult(userId: string, tense: string, correct: number, total: number) {
  await upsertProgress(userId, "tense", tense, {
    correctDelta: correct,
    attemptDelta: total,
    bestTestScore: total > 0 ? correct / total : 0,
  });
  await logReviewEvent(userId, "tense_test");
}

/** Gramática "Test" mode for a single topic — separate from Practice's per-question recordTopicAttempt, this is what moves best_test_score. */
export async function recordTopicTestResult(userId: string, topicSlug: string, correct: number, total: number) {
  await upsertProgress(userId, "topic", topicSlug, {
    correctDelta: correct,
    attemptDelta: total,
    bestTestScore: total > 0 ? correct / total : 0,
  });
  await logReviewEvent(userId, "topic_test");
}

/** The combined, all-topics Gramática test — its own scope ("combined"/"all"), separate from any single topic's progress. */
export async function recordCombinedTestResult(userId: string, correct: number, total: number) {
  await upsertProgress(userId, "combined", "all", {
    correctDelta: correct,
    attemptDelta: total,
    bestTestScore: total > 0 ? correct / total : 0,
  });
  await logReviewEvent(userId, "combined_test");
}
