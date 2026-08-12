import { supabase } from "./supabaseClient";
import { fetchGrammarProgress, fetchGrammarTopics } from "./grammarQueue";
import { CORE_TENSES } from "./conjugation";
import { CORE_TENSES_PT } from "./conjugationPt";
import { CORE_TENSES_FR } from "./conjugationFr";
import type { Language } from "./language";
import type { CefrLevel, GrammarProgress, GrammarTopic } from "./types";

export interface VocabVerbStats {
  dueCount: number;
  totalCount: number;
  /** Any item reviewed at least once (repetitions >= 1) — "you've looked at this," regardless of retention. */
  seenCount: number;
  /** Items you've retained at least once (repetitions >= 2) or explicitly mastered — bucketed by level. */
  knownByLevel: Record<CefrLevel, number>;
  /** Same "known" items, split by kind so the dashboard can show vocab vs. verb progress separately. */
  knownVocabByLevel: Record<CefrLevel, number>;
  knownVerbByLevel: Record<CefrLevel, number>;
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

export interface CefrStats {
  /** Highest level where coverage clears the threshold and every level below it does too. Null if even A1 doesn't clear it. */
  overallLevel: CefrLevel | null;
  /** The level you're currently working toward (one above overallLevel), null if you've cleared C2. */
  nextLevel: CefrLevel | null;
  /** 0-1 coverage of nextLevel's vocab+verbs, for a "progress toward next level" readout. Null if nextLevel is null. */
  nextLevelCoveragePct: number | null;
  /** 0-1 coverage per level, for debugging/detail views. */
  coverageByLevel: Record<CefrLevel, number>;
}

export interface ActivityStats {
  currentStreakDays: number;
  longestStreakDays: number;
  /** date (YYYY-MM-DD, UTC) -> event count, for the last ACTIVITY_WINDOW_DAYS days. */
  activityByDate: Record<string, number>;
  /** All-time review_log row count — unbounded, not limited to the heatmap window. */
  totalReviews: number;
  /** Review_log rows in the last 7 days (rolling, including today). */
  reviewsThisWeek: number;
}

export interface DashboardStats {
  vocabVerbs: VocabVerbStats;
  grammar: GrammarStats;
  verbos: VerbosStats;
  cefr: CefrStats;
  activity: ActivityStats;
}

const EMPTY_LEVEL_COUNTS: Record<CefrLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
const LEVEL_ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// You need to have actually retained a word (not just seen it once) for it to
// count toward your level — repetitions >= 2, or a long/mastered interval so
// the "I know this 100%" button counts immediately instead of needing a
// second successful review first.
const KNOWN_MIN_REPETITIONS = 2;
const KNOWN_MIN_INTERVAL_DAYS = 365;

// How much of a level's vocab+verbs you need to have retained to count as
// having "reached" that level. Coverage is noisy while the content library
// is still small per level, so treat this as a rough placement, not a score.
const COVERAGE_THRESHOLD = 0.65;

const ACTIVITY_WINDOW_DAYS = 84; // 12 weeks, GitHub-heatmap-style

async function fetchVocabVerbStats(userId: string, language: Language): Promise<VocabVerbStats> {
  const nowIso = new Date().toISOString();
  const knownFilter = `repetitions.gte.${KNOWN_MIN_REPETITIONS},interval_days.gte.${KNOWN_MIN_INTERVAL_DAYS}`;

  const [
    { count: totalVocab },
    { count: dueVocab },
    { count: seenVocab },
    { data: knownVocabRows },
    { count: totalVerb },
    { count: dueVerb },
    { count: seenVerb },
    { data: knownVerbRows },
  ] = await Promise.all([
    supabase.from("srs_state").select("vocab_items!inner(language)", { count: "exact", head: true }).eq("user_id", userId).eq("vocab_items.language", language),
    supabase.from("srs_state").select("vocab_items!inner(language)", { count: "exact", head: true }).eq("user_id", userId).eq("vocab_items.language", language).lte("due_at", nowIso),
    supabase.from("srs_state").select("vocab_items!inner(language)", { count: "exact", head: true }).eq("user_id", userId).eq("vocab_items.language", language).gte("repetitions", 1),
    supabase.from("srs_state").select("repetitions, interval_days, vocab_items!inner(cefr_level, language)").eq("user_id", userId).eq("vocab_items.language", language).or(knownFilter),
    supabase.from("srs_state").select("verbs!inner(language)", { count: "exact", head: true }).eq("user_id", userId).eq("verbs.language", language),
    supabase.from("srs_state").select("verbs!inner(language)", { count: "exact", head: true }).eq("user_id", userId).eq("verbs.language", language).lte("due_at", nowIso),
    supabase.from("srs_state").select("verbs!inner(language)", { count: "exact", head: true }).eq("user_id", userId).eq("verbs.language", language).gte("repetitions", 1),
    supabase.from("srs_state").select("repetitions, interval_days, verbs!inner(cefr_level, language)").eq("user_id", userId).eq("verbs.language", language).or(knownFilter),
  ]);

  const knownByLevel: Record<CefrLevel, number> = { ...EMPTY_LEVEL_COUNTS };
  const knownVocabByLevel: Record<CefrLevel, number> = { ...EMPTY_LEVEL_COUNTS };
  const knownVerbByLevel: Record<CefrLevel, number> = { ...EMPTY_LEVEL_COUNTS };
  for (const row of knownVocabRows ?? []) {
    const level: CefrLevel | undefined = (row as any).vocab_items?.cefr_level;
    if (!level) continue;
    knownByLevel[level]++;
    knownVocabByLevel[level]++;
  }
  for (const row of knownVerbRows ?? []) {
    const level: CefrLevel | undefined = (row as any).verbs?.cefr_level;
    if (!level) continue;
    knownByLevel[level]++;
    knownVerbByLevel[level]++;
  }

  return {
    dueCount: (dueVocab ?? 0) + (dueVerb ?? 0),
    totalCount: (totalVocab ?? 0) + (totalVerb ?? 0),
    seenCount: (seenVocab ?? 0) + (seenVerb ?? 0),
    knownByLevel,
    knownVocabByLevel,
    knownVerbByLevel,
  };
}

async function fetchLevelTotals(language: Language): Promise<Record<CefrLevel, number>> {
  const [{ data: vocabLevels }, { data: verbLevels }] = await Promise.all([
    supabase.from("vocab_items").select("cefr_level").eq("language", language),
    supabase.from("verbs").select("cefr_level").eq("language", language),
  ]);

  const totals: Record<CefrLevel, number> = { ...EMPTY_LEVEL_COUNTS };
  for (const row of [...(vocabLevels ?? []), ...(verbLevels ?? [])]) {
    const level = row.cefr_level as CefrLevel;
    totals[level]++;
  }
  return totals;
}

function computeCefrStats(totalByLevel: Record<CefrLevel, number>, knownByLevel: Record<CefrLevel, number>): CefrStats {
  const coverageByLevel: Record<CefrLevel, number> = { ...EMPTY_LEVEL_COUNTS };
  for (const level of LEVEL_ORDER) {
    coverageByLevel[level] = totalByLevel[level] > 0 ? knownByLevel[level] / totalByLevel[level] : 0;
  }

  let overallLevel: CefrLevel | null = null;
  for (const level of LEVEL_ORDER) {
    if (coverageByLevel[level] >= COVERAGE_THRESHOLD) overallLevel = level;
    else break; // monotonic — stop at the first level you haven't cleared
  }

  const nextLevelIndex = overallLevel === null ? 0 : LEVEL_ORDER.indexOf(overallLevel) + 1;
  const nextLevel = nextLevelIndex < LEVEL_ORDER.length ? LEVEL_ORDER[nextLevelIndex] : null;

  return {
    overallLevel,
    nextLevel,
    nextLevelCoveragePct: nextLevel ? Math.round(coverageByLevel[nextLevel] * 100) : null,
    coverageByLevel,
  };
}

function computeGrammarStats(topics: GrammarTopic[], progress: GrammarProgress[]): GrammarStats {
  // grammar_progress has no language column — scope_key for topics is the
  // topic slug, so cross-reference against this language's own topic list
  // rather than counting every topic-scope row (which would double-count
  // progress from other languages' topics that happen to share scope_type).
  const topicSlugs = new Set(topics.map((t) => t.slug));
  const topicProgress = progress.filter((p) => p.scopeType === "topic" && p.attemptCount > 0 && topicSlugs.has(p.scopeKey));
  const avg = topicProgress.length
    ? topicProgress.reduce((sum, p) => sum + p.correctCount / p.attemptCount, 0) / topicProgress.length
    : null;
  return {
    topicsTotal: topics.length,
    topicsPracticed: topicProgress.length,
    averageAccuracyPct: avg !== null ? Math.round(avg * 100) : null,
  };
}

// Mirrors grammarQueue.ts's tenseScopeKey — Spanish keys are unprefixed,
// Portuguese/French are "pt:"/"fr:"-prefixed. Needed here too so a tense
// row from one language's practice doesn't get counted on another
// language's dashboard.
function scopeKeyBelongsToLanguage(scopeKey: string, language: Language): boolean {
  if (language === "es") return !scopeKey.includes(":");
  return scopeKey.startsWith(`${language}:`);
}

function computeVerbosStats(progress: GrammarProgress[], language: Language): VerbosStats {
  const tenseProgress = progress.filter(
    (p) => p.scopeType === "tense" && p.bestTestScore !== null && scopeKeyBelongsToLanguage(p.scopeKey, language)
  );
  const avg = tenseProgress.length
    ? tenseProgress.reduce((sum, p) => sum + (p.bestTestScore ?? 0), 0) / tenseProgress.length
    : null;
  return {
    tensesTotal: language === "pt" ? CORE_TENSES_PT.length : language === "fr" ? CORE_TENSES_FR.length : CORE_TENSES.length,
    tensesTested: tenseProgress.length,
    averageBestScorePct: avg !== null ? Math.round(avg * 100) : null,
  };
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fetchActivityStats(userId: string): Promise<ActivityStats> {
  const windowStart = new Date();
  windowStart.setUTCDate(windowStart.getUTCDate() - (ACTIVITY_WINDOW_DAYS - 1));
  windowStart.setUTCHours(0, 0, 0, 0);

  const [{ data }, { count: totalReviews }] = await Promise.all([
    supabase.from("review_log").select("created_at").eq("user_id", userId).gte("created_at", windowStart.toISOString()),
    // Unbounded — not limited to the heatmap window, so this stays accurate once usage outgrows 12 weeks.
    supabase.from("review_log").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  const activityByDate: Record<string, number> = {};
  for (const row of data ?? []) {
    const key = dateKey(new Date(row.created_at));
    activityByDate[key] = (activityByDate[key] ?? 0) + 1;
  }

  let reviewsThisWeek = 0;
  const weekCursor = new Date();
  weekCursor.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    reviewsThisWeek += activityByDate[dateKey(weekCursor)] ?? 0;
    weekCursor.setUTCDate(weekCursor.getUTCDate() - 1);
  }

  // Current streak: walk back from today, stop at the first empty day. If
  // today has no activity yet that doesn't break a streak still in progress
  // from yesterday, so start there instead.
  let currentStreakDays = 0;
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  if (!activityByDate[dateKey(cursor)]) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (activityByDate[dateKey(cursor)]) {
    currentStreakDays++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  // Longest streak within the fetched window (a streak that started before
  // the window would be undercounted — acceptable for a 12-week view).
  let longestStreakDays = 0;
  let running = 0;
  const day = new Date(windowStart);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  while (day.getTime() <= today.getTime()) {
    if (activityByDate[dateKey(day)]) {
      running++;
      longestStreakDays = Math.max(longestStreakDays, running);
    } else {
      running = 0;
    }
    day.setUTCDate(day.getUTCDate() + 1);
  }

  return { currentStreakDays, longestStreakDays, activityByDate, totalReviews: totalReviews ?? 0, reviewsThisWeek };
}

export async function fetchDashboardStats(userId: string, language: Language = "es"): Promise<DashboardStats> {
  const [vocabVerbs, levelTotals, topics, progress, activity] = await Promise.all([
    fetchVocabVerbStats(userId, language),
    fetchLevelTotals(language),
    fetchGrammarTopics(language),
    fetchGrammarProgress(userId),
    fetchActivityStats(userId),
  ]);
  return {
    vocabVerbs,
    grammar: computeGrammarStats(topics, progress),
    verbos: computeVerbosStats(progress, language),
    cefr: computeCefrStats(levelTotals, vocabVerbs.knownByLevel),
    activity,
  };
}
