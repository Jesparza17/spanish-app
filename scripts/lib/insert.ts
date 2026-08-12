// Shared insert/enroll/theme-tag logic — no Anthropic API involved. Used by
// both insert-content.ts (the no-cost path: content already produced
// elsewhere, e.g. by Claude Code in conversation) and generate-content.ts
// (the optional, API-billed automated path).

import { supabaseAdmin } from "./supabaseAdmin";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface VocabInsert {
  lemma: string;
  translation: string;
  part_of_speech: string;
  example_sentence: string;
  example_translation: string;
  cefr_level: CefrLevel;
}

export interface VerbInsert {
  infinitive: string;
  translation: string;
  verb_type: "regular_ar" | "regular_er" | "regular_ir" | "irregular" | "stem_changing";
  example_sentence: string;
  example_translation: string;
  cefr_level: CefrLevel;
}

export interface GrammarExerciseInsert {
  prompt: string;
  accepted_answers: string[];
  explanation: string;
  cefr_level: CefrLevel;
}

export async function resolveThemeId(name: string): Promise<string> {
  const { data: existing } = await supabaseAdmin.from("themes").select("id").eq("name", name).maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await supabaseAdmin.from("themes").insert({ name }).select("id").single();
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

export async function insertVocab(items: VocabInsert[], theme?: string): Promise<{ inserted: number; skipped: number }> {
  const { data: existing } = await supabaseAdmin.from("vocab_items").select("lemma");
  const existingLemmas = new Set((existing ?? []).map((r) => r.lemma.toLowerCase()));
  const fresh = items.filter((it) => !existingLemmas.has(it.lemma.toLowerCase()));
  const skipped = items.length - fresh.length;
  if (!fresh.length) return { inserted: 0, skipped };

  const { data: inserted, error } = await supabaseAdmin
    .from("vocab_items")
    .insert(fresh.map((it) => ({ ...it, verified: true })))
    .select("id");
  if (error) throw error;

  if (theme && inserted?.length) {
    const themeId = await resolveThemeId(theme);
    await supabaseAdmin
      .from("vocab_item_themes")
      .insert(inserted.map((row) => ({ vocab_item_id: row.id, theme_id: themeId })));
  }

  await enrollAllUsers("vocab_item_id", (inserted ?? []).map((r) => r.id));
  return { inserted: inserted?.length ?? 0, skipped };
}

export async function insertVerbs(items: VerbInsert[], theme?: string): Promise<{ inserted: number; skipped: number }> {
  const { data: existing } = await supabaseAdmin.from("verbs").select("infinitive");
  const existingInfinitives = new Set((existing ?? []).map((r) => r.infinitive.toLowerCase()));
  const fresh = items.filter((it) => !existingInfinitives.has(it.infinitive.toLowerCase()));
  const skipped = items.length - fresh.length;
  if (!fresh.length) return { inserted: 0, skipped };

  const { data: inserted, error } = await supabaseAdmin
    .from("verbs")
    .insert(fresh.map((it) => ({ ...it, verified: true })))
    .select("id");
  if (error) throw error;

  if (theme && inserted?.length) {
    const themeId = await resolveThemeId(theme);
    await supabaseAdmin.from("verb_themes").insert(inserted.map((row) => ({ verb_id: row.id, theme_id: themeId })));
  }

  await enrollAllUsers("verb_id", (inserted ?? []).map((r) => r.id));
  return { inserted: inserted?.length ?? 0, skipped };
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
