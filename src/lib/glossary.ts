import { supabase } from "./supabaseClient";
import type { VocabItem, Verb } from "./types";

export async function fetchAllVocab(): Promise<VocabItem[]> {
  const { data, error } = await supabase
    .from("vocab_items")
    .select("id, lemma, translation, part_of_speech, example_sentence, example_translation, cefr_level")
    .order("lemma");
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllVerbs(): Promise<Verb[]> {
  const { data, error } = await supabase
    .from("verbs")
    .select("id, infinitive, translation, verb_type, example_sentence, example_translation, cefr_level")
    .order("infinitive");
  if (error) throw error;
  return data ?? [];
}
