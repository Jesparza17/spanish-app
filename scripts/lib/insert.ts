// Shared insert/enroll/theme-tag logic — no Anthropic API involved. Used by
// both insert-content.ts (the no-cost path: content already produced
// elsewhere, e.g. by Claude Code in conversation) and generate-content.ts
// (the optional, API-billed automated path).

import { supabaseAdmin } from "./supabaseAdmin";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Language = "es" | "pt" | "fr";

export interface VocabInsert {
  lemma: string;
  translation: string;
  part_of_speech: string;
  example_sentence: string;
  example_translation: string;
  cefr_level: CefrLevel;
  frequency_rank?: number;
  /** Only meaningful when part_of_speech is "noun" — drives the gender-practice drill. */
  gender?: "m" | "f";
}

export interface VerbInsert {
  infinitive: string;
  translation: string;
  verb_type: "regular_ar" | "regular_er" | "regular_ir" | "irregular" | "stem_changing";
  example_sentence: string;
  example_translation: string;
  cefr_level: CefrLevel;
  frequency_rank?: number;
}

export interface GrammarExerciseInsert {
  prompt: string;
  accepted_answers: string[];
  explanation: string;
  cefr_level: CefrLevel;
}

export async function resolveThemeId(name: string, language: Language = "es"): Promise<string> {
  const { data: existing } = await supabaseAdmin.from("themes").select("id").eq("name", name).eq("language", language).maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await supabaseAdmin.from("themes").insert({ name, language }).select("id").single();
  if (error) throw error;
  return created.id;
}

export async function enrollAllUsers(column: "vocab_item_id" | "verb_id", ids: string[]) {
  if (!ids.length) return;
  const { data: userPage, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw error;
  const rows = userPage.users.flatMap((u) => ids.map((id) => ({ user_id: u.id, [column]: id })));
  if (!rows.length) return;
  const { error: upsertError } = await supabaseAdmin
    .from("srs_state")
    .upsert(rows, { onConflict: `user_id,${column}`, ignoreDuplicates: true });
  if (upsertError) throw upsertError;
}

export type InsertMode = "skip" | "extend";

// Appends a new sense to an existing translation, e.g. "bank" + "bench" ->
// "bank; bench". Idempotent — if the new sense is already present, returns
// the original unchanged, so re-running the same extend batch twice is safe.
function mergeTranslation(existing: string, addition: string): string {
  const already = existing
    .split(";")
    .map((s) => s.trim().toLowerCase())
    .includes(addition.trim().toLowerCase());
  return already ? existing : `${existing}; ${addition.trim()}`;
}

export async function insertVocab(
  items: VocabInsert[],
  theme?: string,
  mode: InsertMode = "skip",
  language: Language = "es"
): Promise<{ inserted: number; extended: number; skipped: number }> {
  const { data: existing } = await supabaseAdmin.from("vocab_items").select("id, lemma, translation").eq("language", language);
  const existingByLemma = new Map((existing ?? []).map((r) => [r.lemma.toLowerCase(), r]));

  const fresh: VocabInsert[] = [];
  let extended = 0;
  for (const item of items) {
    const match = existingByLemma.get(item.lemma.toLowerCase());
    if (!match) {
      fresh.push(item);
      continue;
    }
    if (mode === "extend") {
      const merged = mergeTranslation(match.translation, item.translation);
      if (merged !== match.translation) {
        const { error } = await supabaseAdmin.from("vocab_items").update({ translation: merged }).eq("id", match.id);
        if (error) throw error;
        extended++;
      }
    }
  }
  const skipped = items.length - fresh.length - extended;
  if (!fresh.length) return { inserted: 0, extended, skipped };

  const { data: inserted, error } = await supabaseAdmin
    .from("vocab_items")
    .insert(fresh.map((it) => ({ ...it, verified: true, language })))
    .select("id");
  if (error) throw error;

  if (theme && inserted?.length) {
    const themeId = await resolveThemeId(theme, language);
    await supabaseAdmin
      .from("vocab_item_themes")
      .insert(inserted.map((row) => ({ vocab_item_id: row.id, theme_id: themeId })));
  }

  await enrollAllUsers("vocab_item_id", (inserted ?? []).map((r) => r.id));
  return { inserted: inserted?.length ?? 0, extended, skipped };
}

export async function insertVerbs(
  items: VerbInsert[],
  theme?: string,
  mode: InsertMode = "skip",
  language: Language = "es"
): Promise<{ inserted: number; extended: number; skipped: number }> {
  const { data: existing } = await supabaseAdmin.from("verbs").select("id, infinitive, translation").eq("language", language);
  const existingByInfinitive = new Map((existing ?? []).map((r) => [r.infinitive.toLowerCase(), r]));

  const fresh: VerbInsert[] = [];
  let extended = 0;
  for (const item of items) {
    const match = existingByInfinitive.get(item.infinitive.toLowerCase());
    if (!match) {
      fresh.push(item);
      continue;
    }
    if (mode === "extend") {
      const merged = mergeTranslation(match.translation, item.translation);
      if (merged !== match.translation) {
        const { error } = await supabaseAdmin.from("verbs").update({ translation: merged }).eq("id", match.id);
        if (error) throw error;
        extended++;
      }
    }
  }
  const skipped = items.length - fresh.length - extended;
  if (!fresh.length) return { inserted: 0, extended, skipped };

  const { data: inserted, error } = await supabaseAdmin
    .from("verbs")
    .insert(fresh.map((it) => ({ ...it, verified: true, language })))
    .select("id");
  if (error) throw error;

  if (theme && inserted?.length) {
    const themeId = await resolveThemeId(theme, language);
    await supabaseAdmin.from("verb_themes").insert(inserted.map((row) => ({ verb_id: row.id, theme_id: themeId })));
  }

  await enrollAllUsers("verb_id", (inserted ?? []).map((r) => r.id));
  return { inserted: inserted?.length ?? 0, extended, skipped };
}

export async function insertGrammarExercises(topicSlug: string, items: GrammarExerciseInsert[]): Promise<{ inserted: number }> {
  const { data: topic, error: topicError } = await supabaseAdmin
    .from("grammar_topics")
    .select("id")
    .eq("slug", topicSlug)
    .single();
  if (topicError || !topic) {
    throw new Error(`No grammar_topics row for slug "${topicSlug}" — run npm run seed:grammar-topics first.`);
  }

  const { error } = await supabaseAdmin.from("grammar_exercises").insert(
    items.map((it) => ({
      topic_id: topic.id,
      prompt: it.prompt,
      accepted_answers: it.accepted_answers,
      explanation: it.explanation,
      cefr_level: it.cefr_level,
      verified: true,
    }))
  );
  if (error) throw error;
  return { inserted: items.length };
}
