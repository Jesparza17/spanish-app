// Backfills vocab_items.gender from a verified {items: [{lemma, gender}]} JSON
// file, matching by lemma + language. Idempotent, safe to re-run.
//
// Usage: npx tsx scripts/backfill-noun-gender.ts <file.json> --language es|pt|fr

import { readFileSync } from "fs";
import { supabaseAdmin } from "./lib/supabaseAdmin";

interface GenderItem {
  lemma: string;
  gender: "m" | "f";
}

async function main() {
  const file = process.argv[2];
  const langIdx = process.argv.indexOf("--language");
  const language = langIdx !== -1 ? process.argv[langIdx + 1] : undefined;
  if (!file || !language) {
    throw new Error("Usage: backfill-noun-gender.ts <file.json> --language es|pt|fr");
  }

  const data: { items: GenderItem[] } = JSON.parse(readFileSync(file, "utf-8"));
  let updated = 0;
  let notFound: string[] = [];

  for (const { lemma, gender } of data.items) {
    const { data: rows, error } = await supabaseAdmin
      .from("vocab_items")
      .update({ gender })
      .eq("lemma", lemma)
      .eq("language", language)
      .select("id");
    if (error) throw error;
    if (!rows || rows.length === 0) {
      notFound.push(lemma);
    } else {
      updated += rows.length;
    }
  }

  console.log(`${language}: ${updated} rows updated out of ${data.items.length} items.`);
  if (notFound.length > 0) {
    console.log(`Not found (${notFound.length}):`, notFound.join(", "));
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
