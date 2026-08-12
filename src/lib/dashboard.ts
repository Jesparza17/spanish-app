import { supabase } from "./supabaseClient";
import { fetchGrammarProgress, fetchGrammarTopics } from "./grammarQueue";
import { CORE_TENSES } from "./conjugation";
import type { CefrLevel, GrammarProgress, GrammarTopic } from "./types";

export interface VocabVerbStats {
  dueCount: number;
  totalCount: number;
  /** Items with repetitions >= 2 — "you've seen and retained this at least once" — bucketed by level. */
  knownByLevel: Record<CefrLevel, number>;
}

export interface GrammarStats {
  topicsTotal: number;
  topicsPracticed: number;
  averageAccuracyPct: number | null;
}

export interface VerbosStats {
  tensesTotal: number;
  tensesTested: number;
  averageBestScorePct: number | null;
}

export interface DashboardStats {
  vocabVerbs: VocabVerbStats;
  grammar: GrammarStats;
  verbos: VerbosStats;
}

const EMPTY_LEVEL_COUNTS: Record<CefrLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };

async function fetchVocabVerbStats(userId: string): Promise<VocabVerbStats> {
  const nowIso = new Date().toISOString();

  const [{ count: totalCount }, { count: dueCount }, { data: knownRows }] = await Promise.all([
    supabase.from("srs_state").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("srs_state").select("*", { count: "exact", head: true }).eq("user_id", userId).lte("due_at", nowIso),
    supabase
      .from("srs_state")
      .select("repetitions, vocab_items(cefr_level), verbs(cefr_level)")
      .eq("user_id", userId)
      .gte("repetitions", 2),
  ]);

  const knownByLevel: Record<CefrLevel, number> = { ...EMPTY_LEVEL_COUNTS };
  for (const row of knownRows ?? []) {
    const level: CefrLevel | undefined = (row as any).vocab_items?.cefr_level ?? (row as any).verbs?.cefr_level;
    if (level) knownByLevel[level]++;
  }

  return { dueCount: dueCount ?? 0, totalCount: totalCount ?? 0, knownByLevel };
}

function computeGrammarStats(topics: GrammarTopic[], progress: GrammarProgress[]): GrammarStats {
  const topicProgress = progress.filter((p) => p.scopeType === "topic" && p.attemptCount > 0);
  const avg = topicProgress.length
    ? topicProgress.reduce((sum, p) => sum + p.correctCount / p.attemptCount, 0) / topicProgress.length
    : null;
  return {
    topicsTotal: topics.length,
    topicsPracticed: topicProgress.length,
    averageAccuracyPct: avg !== null ? Math.round(avg * 100) : null,
  };
}

function computeVerbosStats(progress: GrammarProgress[]): VerbosStats {
  const tenseProgress = progress.filter((p) => p.scopeType === "tense" && p.bestTestScore !== null);
  const avg = tenseProgress.length
    ? tenseProgress.reduce((sum, p) => sum + (p.bestTestScore ?? 0), 0) / tenseProgress.length
    : null;
  return {
    tensesTotal: CORE_TENSES.length,
    tensesTested: tenseProgress.length,
    averageBestScorePct: avg !== null ? Math.round(avg * 100) : null,
  };
}

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  const [vocabVerbs, topics, progress] = await Promise.all([
    fetchVocabVerbStats(userId),
    fetchGrammarTopics(),
    fetchGrammarProgress(userId),
  ]);
  return {
    vocabVerbs,
    grammar: computeGrammarStats(topics, progress),
    verbos: computeVerbosStats(progress),
  };
}
