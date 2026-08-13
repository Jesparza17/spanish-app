import { writeFileSync } from "fs";
import { supabaseAdmin } from "./lib/supabaseAdmin";

async function main() {
  for (const language of ["es", "pt", "fr"] as const) {
    const { data: vocab, error: vErr } = await supabaseAdmin.from("vocab_items").select("lemma").eq("language", language);
    if (vErr) throw vErr;
    writeFileSync(`scripts/_existing_vocab_${language}.json`, JSON.stringify((vocab ?? []).map((r) => r.lemma)));

    const { data: verbs, error: bErr } = await supabaseAdmin.from("verbs").select("infinitive").eq("language", language);
    if (bErr) throw bErr;
    writeFileSync(`scripts/_existing_verbs_${language}.json`, JSON.stringify((verbs ?? []).map((r) => r.infinitive)));

    console.log(`${language}: ${vocab?.length ?? 0} vocab, ${verbs?.length ?? 0} verbs`);
  }
}

main();
