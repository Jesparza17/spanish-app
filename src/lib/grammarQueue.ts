import { supabase } from "./supabaseClient";
import {
  PERSONS,
  PERSON_LABELS,
  TENSE_LABELS,
  TENSE_GROUPS,
  conjugate,
  conjugateImperative,
  isFullySupported,
  isIrregularForm,
  type ImperativePerson,
  type ImperativePolarity,
  type Person,
  type Tense,
  type ConjugableTense,
  type TenseGroupKey,
} from "./conjugation";
import {
  PERSONS_PT,
  PERSON_LABELS_PT,
  TENSE_LABELS_PT,
  TENSE_GROUPS_PT,
  conjugatePt,
  conjugateImperativePt,
  isFullySupportedPt,
  isIrregularFormPt,
  type PersonPt,
  type TensePt,
  type ConjugableTensePt,
} from "./conjugationPt";
import {
  PERSONS_FR,
  PERSON_LABELS_FR,
  TENSE_LABELS_FR,
  TENSE_GROUPS_FR,
  conjugateFr,
  conjugateImperativeFr,
  isFullySupportedFr,
  isIrregularFormFr,
  type PersonFr,
  type TenseFr,
  type ConjugableTenseFr,
  type ImperativePersonFr,
  type ImperativePolarityFr,
} from "./conjugationFr";
import { logReviewEvent } from "./reviewLog";
import type { Language } from "./language";
import type { GrammarProgress, GrammarTopic } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function fetchGrammarTopics(language: Language = "es"): Promise<GrammarTopic[]> {
  const { data, error } = await supabase
    .from("grammar_topics")
    .select("id, slug, title, category, explanation_md, cefr_level, sort_order")
    .eq("language", language)
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

/** Random sample across every topic's exercises for the given language, for the combined Gramática test. */
export async function fetchCombinedTestExercises(language: Language = "es", limit = 15): Promise<TopicExercise[]> {
  const { data, error } = await supabase
    .from("grammar_exercises")
    .select("id, prompt, accepted_answers, explanation, grammar_topics!inner(language)")
    .not("topic_id", "is", null)
    .eq("verified", true)
    .eq("grammar_topics.language", language)
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

async function fetchEligibleVerbs(language: Language): Promise<EligibleVerb[]> {
  const { data, error } = await supabase
    .from("verbs")
    .select("id, infinitive, translation, verb_type")
    .eq("verified", true)
    .eq("language", language);
  if (error) throw error;
  const supported = language === "pt" ? isFullySupportedPt : language === "fr" ? isFullySupportedFr : isFullySupported;
  return (data ?? []).filter((v: EligibleVerb) => supported(v.infinitive, v.verb_type));
}

export interface TenseQuestion {
  verbId: string;
  infinitive: string;
  translation: string;
  prompt: string;
  answer: string;
  /** Raw person/polarity behind this question, for callers that want to build their own prompt (e.g. fill-in-the-blank). */
  person: string;
  polarity?: "affirmative" | "negative";
  /** Which tense this particular question is testing — only set for grouped (multi-tense) sessions, where it varies per question. */
  tense?: string;
}

/** Resolves a tense-group key to its member tense strings for the given language. */
export function tensesForGroup(groupKey: TenseGroupKey, language: Language): string[] {
  if (language === "pt") return TENSE_GROUPS_PT[groupKey];
  if (language === "fr") return TENSE_GROUPS_FR[groupKey];
  return TENSE_GROUPS[groupKey];
}

function tenseLabelFor(tense: string, language: Language): string {
  const labels = language === "pt" ? TENSE_LABELS_PT : language === "fr" ? TENSE_LABELS_FR : TENSE_LABELS;
  return (labels as Record<string, string>)[tense] ?? tense;
}

const IMPERATIVE_PERSONS: ImperativePerson[] = ["tu", "usted", "nosotros", "ustedes"];
const IMPERATIVE_POLARITIES: ImperativePolarity[] = ["affirmative", "negative"];
const IMPERATIVE_PERSONS_PT: Exclude<PersonPt, "eu">[] = ["voce", "nos", "voces"];

export type VerbCategory = "regular" | "irregular" | "mix";

function matchesCategory(formIsIrregular: boolean, category: VerbCategory): boolean {
  if (category === "mix") return true;
  return category === "irregular" ? formIsIrregular : !formIsIrregular;
}

/**
 * Builds a fresh, randomized set of conjugation-drill questions for a tense
 * — computed live from the deterministic engine, never stored. Dispatches
 * to the Spanish or Portuguese engine based on `language`; the two engines
 * have different Person/Tense shapes (5 persons vs. 4, different tense
 * names), so this function's `tense` param is intentionally just `string`
 * at this boundary — each branch narrows it back to its own engine's type.
 *
 * Regularity is classified per (verb, person) form, not per verb — see
 * conjugation.ts's isIrregularForm for why.
 */
export async function buildTenseQuestions(
  tense: string | string[],
  count: number,
  category: VerbCategory = "mix",
  language: Language = "es"
): Promise<TenseQuestion[]> {
  const pool = await fetchEligibleVerbs(language);
  if (!pool.length) return [];

  if (Array.isArray(tense)) {
    return buildGroupedTenseQuestions(pool, tense, count, category, language);
  }

  if (language === "pt") {
    if (tense === "imperativo") {
      const candidates: { verb: EligibleVerb; person: Exclude<PersonPt, "eu">; polarity: ImperativePolarity }[] = [];
      for (const verb of pool) {
        for (const person of IMPERATIVE_PERSONS_PT) {
          for (const polarity of IMPERATIVE_POLARITIES) {
            const irregular = isIrregularFormPt(verb.infinitive, tense as TensePt, person, polarity);
            if (matchesCategory(irregular, category)) candidates.push({ verb, person, polarity });
          }
        }
      }
      if (!candidates.length) return [];
      const questions: TenseQuestion[] = [];
      for (let i = 0; i < count; i++) {
        const c = candidates[Math.floor(Math.random() * candidates.length)];
        const answer = conjugateImperativePt(c.verb.infinitive, c.person, c.polarity);
        const label = `${c.polarity === "negative" ? "não · " : ""}${PERSON_LABELS_PT[c.person]}`;
        questions.push({
          verbId: c.verb.id,
          infinitive: c.verb.infinitive,
          translation: c.verb.translation,
          prompt: `${c.verb.infinitive} — ${label}`,
          answer,
          person: c.person,
          polarity: c.polarity,
        });
      }
      return questions;
    }

    const candidates: { verb: EligibleVerb; person: PersonPt }[] = [];
    for (const verb of pool) {
      for (const person of PERSONS_PT) {
        const irregular = isIrregularFormPt(verb.infinitive, tense as TensePt, person);
        if (matchesCategory(irregular, category)) candidates.push({ verb, person });
      }
    }
    if (!candidates.length) return [];
    const questions: TenseQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const c = candidates[Math.floor(Math.random() * candidates.length)];
      const answer = conjugatePt(c.verb.infinitive, tense as ConjugableTensePt, c.person);
      questions.push({
        verbId: c.verb.id,
        infinitive: c.verb.infinitive,
        translation: c.verb.translation,
        prompt: `${c.verb.infinitive} — ${PERSON_LABELS_PT[c.person]}`,
        answer,
        person: c.person,
      });
    }
    return questions;
  }

  if (language === "fr") {
    if (tense === "imperatif") {
      const IMPERATIVE_PERSONS_FR: ImperativePersonFr[] = ["tu", "nous", "vous"];
      const candidates: { verb: EligibleVerb; person: ImperativePersonFr; polarity: ImperativePolarityFr }[] = [];
      for (const verb of pool) {
        for (const person of IMPERATIVE_PERSONS_FR) {
          for (const polarity of IMPERATIVE_POLARITIES) {
            const irregular = isIrregularFormFr(verb.infinitive, tense as TenseFr, person, polarity as ImperativePolarityFr);
            if (matchesCategory(irregular, category)) candidates.push({ verb, person, polarity: polarity as ImperativePolarityFr });
          }
        }
      }
      if (!candidates.length) return [];
      const questions: TenseQuestion[] = [];
      for (let i = 0; i < count; i++) {
        const c = candidates[Math.floor(Math.random() * candidates.length)];
        const answer = conjugateImperativeFr(c.verb.infinitive, c.person, c.polarity);
        const label = `${c.polarity === "negative" ? "ne...pas · " : ""}${PERSON_LABELS_FR[c.person]}`;
        questions.push({
          verbId: c.verb.id,
          infinitive: c.verb.infinitive,
          translation: c.verb.translation,
          prompt: `${c.verb.infinitive} — ${label}`,
          answer,
          person: c.person,
          polarity: c.polarity,
        });
      }
      return questions;
    }

    const candidates: { verb: EligibleVerb; person: PersonFr }[] = [];
    for (const verb of pool) {
      for (const person of PERSONS_FR) {
        const irregular = isIrregularFormFr(verb.infinitive, tense as TenseFr, person);
        if (matchesCategory(irregular, category)) candidates.push({ verb, person });
      }
    }
    if (!candidates.length) return [];
    const questions: TenseQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const c = candidates[Math.floor(Math.random() * candidates.length)];
      const answer = conjugateFr(c.verb.infinitive, tense as ConjugableTenseFr, c.person);
      questions.push({
        verbId: c.verb.id,
        infinitive: c.verb.infinitive,
        translation: c.verb.translation,
        prompt: `${c.verb.infinitive} — ${PERSON_LABELS_FR[c.person]}`,
        answer,
        person: c.person,
      });
    }
    return questions;
  }

  if (tense === "imperativo") {
    const candidates: { verb: EligibleVerb; person: ImperativePerson; polarity: ImperativePolarity }[] = [];
    for (const verb of pool) {
      for (const person of IMPERATIVE_PERSONS) {
        for (const polarity of IMPERATIVE_POLARITIES) {
          const irregular = isIrregularForm(verb.infinitive, tense as Tense, person, polarity);
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
        person: c.person,
        polarity: c.polarity,
      });
    }
    return questions;
  }

  const candidates: { verb: EligibleVerb; person: Person }[] = [];
  for (const verb of pool) {
    for (const person of PERSONS) {
      const irregular = isIrregularForm(verb.infinitive, tense as Tense, person);
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
      person: c.person,
    });
  }
  return questions;
}

/**
 * Multi-tense variant for grouped practice ("all past tenses", etc.) —
 * imperative is never a group member (see TENSE_GROUPS), so this only needs
 * each language's regular (non-imperative) candidate-building path, just
 * pooled across every member tense before a true shuffle-then-slice draw
 * instead of buildTenseQuestions's per-draw random-with-replacement
 * sampling, so the tense mix stays even across the group.
 */
async function buildGroupedTenseQuestions(
  pool: EligibleVerb[],
  tenses: string[],
  count: number,
  category: VerbCategory,
  language: Language
): Promise<TenseQuestion[]> {
  if (language === "pt") {
    const candidates: { verb: EligibleVerb; person: PersonPt; tense: string }[] = [];
    for (const t of tenses) {
      for (const verb of pool) {
        for (const person of PERSONS_PT) {
          const irregular = isIrregularFormPt(verb.infinitive, t as TensePt, person);
          if (matchesCategory(irregular, category)) candidates.push({ verb, person, tense: t });
        }
      }
    }
    if (!candidates.length) return [];
    const shuffled = shuffle(candidates);
    return Array.from({ length: count }, (_, i) => {
      const c = shuffled[i % shuffled.length];
      const answer = conjugatePt(c.verb.infinitive, c.tense as ConjugableTensePt, c.person);
      return {
        verbId: c.verb.id,
        infinitive: c.verb.infinitive,
        translation: c.verb.translation,
        prompt: `${c.verb.infinitive} — ${PERSON_LABELS_PT[c.person]} (${tenseLabelFor(c.tense, language)})`,
        answer,
        person: c.person,
        tense: c.tense,
      };
    });
  }

  if (language === "fr") {
    const candidates: { verb: EligibleVerb; person: PersonFr; tense: string }[] = [];
    for (const t of tenses) {
      for (const verb of pool) {
        for (const person of PERSONS_FR) {
          const irregular = isIrregularFormFr(verb.infinitive, t as TenseFr, person);
          if (matchesCategory(irregular, category)) candidates.push({ verb, person, tense: t });
        }
      }
    }
    if (!candidates.length) return [];
    const shuffled = shuffle(candidates);
    return Array.from({ length: count }, (_, i) => {
      const c = shuffled[i % shuffled.length];
      const answer = conjugateFr(c.verb.infinitive, c.tense as ConjugableTenseFr, c.person);
      return {
        verbId: c.verb.id,
        infinitive: c.verb.infinitive,
        translation: c.verb.translation,
        prompt: `${c.verb.infinitive} — ${PERSON_LABELS_FR[c.person]} (${tenseLabelFor(c.tense, language)})`,
        answer,
        person: c.person,
        tense: c.tense,
      };
    });
  }

  const candidates: { verb: EligibleVerb; person: Person; tense: string }[] = [];
  for (const t of tenses) {
    for (const verb of pool) {
      for (const person of PERSONS) {
        const irregular = isIrregularForm(verb.infinitive, t as Tense, person);
        if (matchesCategory(irregular, category)) candidates.push({ verb, person, tense: t });
      }
    }
  }
  if (!candidates.length) return [];
  const shuffled = shuffle(candidates);
  return Array.from({ length: count }, (_, i) => {
    const c = shuffled[i % shuffled.length];
    const answer = conjugate(c.verb.infinitive, c.tense as ConjugableTense, c.person);
    return {
      verbId: c.verb.id,
      infinitive: c.verb.infinitive,
      translation: c.verb.translation,
      prompt: `${c.verb.infinitive} — ${PERSON_LABELS[c.person]} (${tenseLabelFor(c.tense, language)})`,
      answer,
      person: c.person,
      tense: c.tense,
    };
  });
}

/** Case-insensitive, accent-sensitive — accents are grammatically meaningful (hablo vs. habló). */
export function isCorrectAnswer(input: string, accepted: string[]): boolean {
  const normalized = input.trim().toLowerCase();
  return accepted.some((a) => a.trim().toLowerCase() === normalized);
}

async function upsertProgress(
  userId: string,
  scopeType: "topic" | "tense" | "combined" | "tense_group",
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

// Tense identifiers collide across languages (Spanish/Portuguese both have
// "presente"; French's own names are distinct but prefixed anyway for
// consistency), and grammar_progress.scope_key has no language column to
// disambiguate. Spanish keeps its existing unprefixed keys (so prior
// progress isn't orphaned); Portuguese and French get a prefix, since both
// start from zero rows.
export function tenseScopeKey(tense: string, language: Language): string {
  return language === "es" ? tense : `${language}:${tense}`;
}

/** Same collision rationale as tenseScopeKey, applied to group keys ("present"/"past"/etc.) instead of individual tense names. */
export function tenseGroupScopeKey(groupKey: TenseGroupKey, language: Language): string {
  return language === "es" ? groupKey : `${language}:${groupKey}`;
}

/** Verbos "Test" mode only — practice mode never calls this, so drilling freely doesn't move the progress ring. */
export async function recordTenseTestResult(userId: string, tense: string, correct: number, total: number, language: Language = "es") {
  await upsertProgress(userId, "tense", tenseScopeKey(tense, language), {
    correctDelta: correct,
    attemptDelta: total,
    bestTestScore: total > 0 ? correct / total : 0,
  });
  await logReviewEvent(userId, "tense_test");
}

/** Verbos "Test" mode for a tense group ("all past tenses", etc.) — its own scope, separate from any single member tense's progress. */
export async function recordTenseGroupTestResult(
  userId: string,
  groupKey: TenseGroupKey,
  correct: number,
  total: number,
  language: Language = "es"
) {
  await upsertProgress(userId, "tense_group", tenseGroupScopeKey(groupKey, language), {
    correctDelta: correct,
    attemptDelta: total,
    bestTestScore: total > 0 ? correct / total : 0,
  });
  await logReviewEvent(userId, "tense_group_test");
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
