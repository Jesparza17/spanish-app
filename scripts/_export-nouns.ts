import { writeFileSync } from "fs";
import { supabaseAdmin } from "./lib/supabaseAdmin";

async function main() {
  for (const language of ["es", "pt", "fr"] as const) {
    const { data, error } = await supabaseAdmin
      .from("vocab_items")
      .select("lemma, translation")
      .eq("language", language)
      .eq("part_of_speech", "noun")
      .order("lemma");
    if (error) throw error;
    const path = `scripts/_nouns_${language}.json`;
    writeFileSync(path, JSON.stringify(data, null, 0));
    console.log(`${language}: ${data?.length ?? 0} nouns -> ${path}`);
  }
}

main();
