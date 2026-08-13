// One-off: seed the theme taxonomy and tag existing vocab into it.
// Cross-checks every lemma against the live DB per language before tagging —
// silently skips anything not found (handles cross-language contamination
// or hallucinated lemmas in the source data safely).
// Usage: npx tsx scripts/tag-themes.ts

import { readFileSync } from "fs";
import { supabaseAdmin } from "./lib/supabaseAdmin";
import { resolveThemeId } from "./lib/insert";

type Language = "es" | "pt" | "fr";

interface ThemeInput {
  name: string;
  description: string;
  lemmas: string[];
}

async function main() {
  const data: Record<Language, ThemeInput[]> = JSON.parse(readFileSync("scripts/_themes_data.json", "utf-8"));

  for (const language of ["es", "pt", "fr"] as Language[]) {
    const { data: vocab, error } = await supabaseAdmin.from("vocab_items").select("id, lemma").eq("language", language);
    if (error) throw error;
    const byLemma = new Map((vocab ?? []).map((r) => [r.lemma.toLowerCase(), r.id]));

    for (const theme of data[language]) {
      const themeId = await resolveThemeId(theme.name, language);
      const uniqueLemmas = [...new Set(theme.lemmas.map((l) => l.toLowerCase()))];
      const rows: { vocab_item_id: string; theme_id: string }[] = [];
      const missing: string[] = [];

      for (const lemma of uniqueLemmas) {
        const id = byLemma.get(lemma);
        if (id) rows.push({ vocab_item_id: id, theme_id: themeId });
        else missing.push(lemma);
      }

      if (rows.length) {
        const { error: tagError } = await supabaseAdmin
          .from("vocab_item_themes")
          .upsert(rows, { onConflict: "vocab_item_id,theme_id", ignoreDuplicates: true });
        if (tagError) throw tagError;
      }

      console.log(`${language} / ${theme.name}: tagged ${rows.length}${missing.length ? `, skipped ${missing.length} not found (${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""})` : ""}`);
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
