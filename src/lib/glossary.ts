import { supabase } from "./supabaseClient";
import type { Language } from "./language";
import type { VocabItem, Verb } from "./types";

export async function fetchAllVocab(language: Language = "es"): Promise<VocabItem[]> {
  const { data, error } = await supabase
    .from("vocab_items")
    .select("id, lemma, translation, part_of_speech, example_sentence, example_translation, cefr_level, gender")
    .eq("language", language)
    .order("lemma");
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllVerbs(language: Language = "es"): Promise<Verb[]> {
  const { data, error } = await supabase
    .from("verbs")
    .select("id, infinitive, translation, verb_type, example_sentence, example_translation, cefr_level")
    .eq("language", language)
    .order("infinitive");
  if (error) throw error;
  return data ?? [];
}

export interface GenderNoun {
  id: string;
  lemma: string;
  translation: string;
  gender: "m" | "f";
}

/** Pool for the gender-practice drill — only nouns with a classified gender. */
export async function fetchGenderPool(language: Language = "es"): Promise<GenderNoun[]> {
  const { data, error } = await supabase
    .from("vocab_items")
    .select("id, lemma, translation, gender")
    .eq("language", language)
    .eq("part_of_speech", "noun")
    .not("gender", "is", null);
  if (error) throw error;
  return (data ?? []) as GenderNoun[];
}
