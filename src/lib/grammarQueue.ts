import { supabase } from "./supabaseClient";
import {
  PERSONS,
  PERSON_LABELS,
  conjugate,
  conjugateImperative,
  isFullySupported,
  type ConjugableTense,
  type ImperativePerson,
  type ImperativePolarity,
  type Person,
  type Tense,
} from "./conjugation";
import type { GrammarProgress, GrammarTopic } from "./types";

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
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    prompt: row.prompt,
    acceptedAnswers: row.accepted_answers,
    explanation: row.explanation,
  }));
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

/** Builds a fresh, randomized set of conjugation-drill questions for a tense — computed live from the deterministic engine, never stored. */
export async function buildTenseQuestions(tense: Tense, count: number): Promise<TenseQuestion[]> {
  const pool = await fetchEligibleVerbs();
  if (!pool.length) return [];

  const questions: TenseQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const verb = pool[Math.floor(Math.random() * pool.length)];

    if (tense === "imperativo") {
      const person = IMPERATIVE_PERSONS[Math.floor(Math.random() * IMPERATIVE_PERSONS.length)];
      const polarity: ImperativePolarity = Math.random() < 0.5 ? "affirmative" : "negative";
      const answer = conjugateImperative(verb.infinitive, person, polarity);
      const label = `${polarity === "negative" ? "no · " : ""}${PERSON_LABELS[person]}`;
      questions.push({
        verbId: verb.id,
        infinitive: verb.infinitive,
        translation: verb.translation,
        prompt: `${verb.infinitive} — ${label}`,
        answer,
      });
    } else {
      const person: Person = PERSONS[Math.floor(Math.random() * PERSONS.length)];
      const answer = conjugate(verb.infinitive, tense as ConjugableTense, person);
      questions.push({
        verbId: verb.id,
        infinitive: verb.infinitive,
        translation: verb.translation,
        prompt: `${verb.infinitive} — ${PERSON_LABELS[person]}`,
        answer,
      });
    }
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
  scopeType: "topic" | "tense",
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
}

/** Verbos "Test" mode only — practice mode never calls this, so drilling freely doesn't move the progress ring. */
export async function recordTenseTestResult(userId: string, tense: string, correct: number, total: number) {
  await upsertProgress(userId, "tense", tense, {
    correctDelta: correct,
    attemptDelta: total,
    bestTestScore: total > 0 ? correct / total : 0,
  });
}
