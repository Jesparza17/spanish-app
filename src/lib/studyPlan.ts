// A daily/weekly study plan — deliberately not its own stored schedule.
// Every signal here (srs_state, grammar_progress's retest interval/tiers)
// already updates live as the user reviews, so a plan computed fresh on
// every load automatically "adjusts as you practice" with no new
// scheduling machinery of its own.

import { supabase } from "./supabaseClient";
import { fetchGrammarProgress, fetchGrammarTopics, masteryTierFromInterval, type MasteryTier } from "./grammarQueue";
import { scopeKeyBelongsToLanguage } from "./dashboard";
import { CORE_TENSES, TENSE_LABELS, TENSE_GROUP_LABELS, type TenseGroupKey } from "./conjugation";
import { CORE_TENSES_PT, TENSE_LABELS_PT, TENSE_GROUP_LABELS_PT } from "./conjugationPt";
import { CORE_TENSES_FR, TENSE_LABELS_FR, TENSE_GROUP_LABELS_FR } from "./conjugationFr";
import type { Language } from "./language";

// Pacing recommendation only (matches Anki's familiar "new cards/day"
// default) — never enforced as a hard cap on the review queue itself.
const DAILY_NEW_CAP = 20;

const GROUP_KEYS: TenseGroupKey[] = ["present", "past", "subjunctive", "perfect", "all"];

export interface DueTest {
  kind: "topic" | "tense" | "tense_group" | "combined";
  label: string;
  href: string;
  tier: MasteryTier;
}

export interface StudyPlan {
  dueReviewCount: number;
  strugglingCount: number;
  /** Full new-item backlog — never touched (last_reviewed_at IS NULL). */
  newAvailableCount: number;
  /** min(newAvailableCount, DAILY_NEW_CAP) for a "today" plan; = newAvailableCount for a "week" plan. */
  newRecommendedCount: number;
  dueTests: DueTest[];
}

async function fetchVocabVerbPlanCounts(userId: string, language: Language, horizonDays: number) {
  const horizonIso = new Date(Date.now() + horizonDays * 24 * 60 * 60 * 1000).toISOString();

  async function counts(table: "vocab_items" | "verbs") {
    const base = () =>
      supabase
        .from("srs_state")
        .select(`${table}!inner(language)`, { count: "exact", head: true })
        .eq("user_id", userId)
        .eq(`${table}.language`, language);

    const [{ count: due }, { count: struggling }, { count: newCount }] = await Promise.all([
      base().not("last_reviewed_at", "is", null).lte("due_at", horizonIso),
      base().not("last_reviewed_at", "is", null).eq("repetitions", 0),
      base().is("last_reviewed_at", null),
    ]);

    return { due: due ?? 0, struggling: struggling ?? 0, newCount: newCount ?? 0 };
  }

  const [vocab, verbs] = await Promise.all([counts("vocab_items"), counts("verbs")]);
  return {
    dueReviewCount: vocab.due + verbs.due,
    strugglingCount: vocab.struggling + verbs.struggling,
    newAvailableCount: vocab.newCount + verbs.newCount,
  };
}

export async function fetchStudyPlan(userId: string, language: Language, horizonDays: 0 | 7 = 0): Promise<StudyPlan> {
  const horizonMs = Date.now() + horizonDays * 24 * 60 * 60 * 1000;

  const [vocabVerb, topics, progress] = await Promise.all([
    fetchVocabVerbPlanCounts(userId, language, horizonDays),
    fetchGrammarTopics(language),
    fetchGrammarProgress(userId),
  ]);

  const topicBySlug = new Map(topics.map((t) => [t.slug, t]));
  const tenses: string[] = language === "pt" ? CORE_TENSES_PT : language === "fr" ? CORE_TENSES_FR : CORE_TENSES;
  const tenseLabels: Record<string, string> = language === "pt" ? TENSE_LABELS_PT : language === "fr" ? TENSE_LABELS_FR : TENSE_LABELS;
  const groupLabels: Record<string, string> =
    language === "pt" ? TENSE_GROUP_LABELS_PT : language === "fr" ? TENSE_GROUP_LABELS_FR : TENSE_GROUP_LABELS;
  const tenseSet = new Set(tenses);
  const groupKeySet = new Set<string>(GROUP_KEYS);

  const dueTests: DueTest[] = [];
  for (const p of progress) {
    if (!p.nextDueAt || new Date(p.nextDueAt).getTime() > horizonMs) continue;
    const tier = masteryTierFromInterval(p.intervalDays);

    if (p.scopeType === "topic") {
      const topic = topicBySlug.get(p.scopeKey);
      if (!topic) continue; // a different language's topic sharing this scope_type
      dueTests.push({ kind: "topic", label: topic.title, href: `/grammar/${topic.slug}`, tier });
    } else if (p.scopeType === "combined") {
      dueTests.push({ kind: "combined", label: "Test general", href: "/grammar/test", tier });
    } else if (p.scopeType === "tense" && scopeKeyBelongsToLanguage(p.scopeKey, language)) {
      const tense = language === "es" ? p.scopeKey : p.scopeKey.slice(language.length + 1);
      if (!tenseSet.has(tense)) continue;
      dueTests.push({ kind: "tense", label: tenseLabels[tense] ?? tense, href: `/grammar/verbs/${tense}`, tier });
    } else if (p.scopeType === "tense_group" && scopeKeyBelongsToLanguage(p.scopeKey, language)) {
      const key = language === "es" ? p.scopeKey : p.scopeKey.slice(language.length + 1);
      if (!groupKeySet.has(key)) continue;
      dueTests.push({ kind: "tense_group", label: groupLabels[key] ?? key, href: `/grammar/verbs/group/${key}`, tier });
    }
  }

  return {
    dueReviewCount: vocabVerb.dueReviewCount,
    strugglingCount: vocabVerb.strugglingCount,
    newAvailableCount: vocabVerb.newAvailableCount,
    newRecommendedCount: horizonDays === 0 ? Math.min(vocabVerb.newAvailableCount, DAILY_NEW_CAP) : vocabVerb.newAvailableCount,
    dueTests,
  };
}
