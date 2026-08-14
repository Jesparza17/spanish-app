// Dumps every vocab lemma, verb infinitive, and grammar exercise prompt
// (with each topic's rule explanation) for all three languages into one
// markdown file — a dedup/context reference for drafting new content in a
// separate conversation (e.g. the web app) that can't query the live DB
// itself. Regenerate after each insert round so it stays current.
//
// Usage: npm run dump:db-snapshot -- path/to/output.md

import { writeFileSync } from "fs";
import { supabaseAdmin } from "./lib/supabaseAdmin";

const LANG_NAMES: Record<string, string> = { es: "Spanish", pt: "Portuguese", fr: "French" };

async function main() {
  const outPath = process.argv[2];
  if (!outPath) throw new Error("Usage: dump-db-snapshot.ts path/to/output.md");

  const lines: string[] = [];
  lines.push("# Cuaderno — Database Snapshot (for dedup reference)");
  lines.push("");
  lines.push("Generated for use in a separate Claude web app conversation drafting new content.");
  lines.push("This is a reference of what already exists — do not duplicate any of it.");
  lines.push("");

  for (const lang of ["es", "pt", "fr"] as const) {
    const { count: verbCount } = await supabaseAdmin.from("verbs").select("*", { count: "exact", head: true }).eq("language", lang);
    const { count: vocabCount } = await supabaseAdmin.from("vocab_items").select("*", { count: "exact", head: true }).eq("language", lang);
    const { count: topicCount } = await supabaseAdmin.from("grammar_topics").select("*", { count: "exact", head: true }).eq("language", lang);
    lines.push(`- **${lang}**: ${verbCount} verbs, ${vocabCount} vocab, ${topicCount} grammar topics`);
  }
  lines.push("");
  lines.push(
    "Targets: 1000 verbs / 4000 vocab per language, 200+ exercises per grammar topic. Spanish is priority until it hits target, then Portuguese and French get equal priority."
  );
  lines.push("");
  lines.push(
    "Register rules: tú/usted/ustedes for Spanish (no vosotros); você/vocês for Portuguese (no tu, Brazilian register); French uses both tu and vous actively (not simplified). Avoid Spain-specific Spanish vocabulary (computadora not ordenador, celular not móvil, boleto not billete, manejar not conducir, jugo not zumo, departamento not piso)."
  );
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const lang of ["es", "pt", "fr"] as const) {
    const langName = LANG_NAMES[lang];
    lines.push(`# ${langName} (${lang})`);
    lines.push("");

    lines.push(`## ${langName} vocab lemmas (already in DB — do not duplicate)`);
    lines.push("");
    const { data: vocab } = await supabaseAdmin.from("vocab_items").select("lemma, part_of_speech").eq("language", lang).order("lemma");
    lines.push(`Total: ${vocab?.length ?? 0}`);
    lines.push("");
    lines.push("```");
    lines.push((vocab ?? []).map((v) => `${v.lemma} (${v.part_of_speech})`).join(", "));
    lines.push("```");
    lines.push("");
    lines.push("---");
    lines.push("");

    lines.push(`## ${langName} verb infinitives (already in DB — do not duplicate)`);
    lines.push("");
    const { data: verbs } = await supabaseAdmin.from("verbs").select("infinitive, verb_type").eq("language", lang).order("infinitive");
    lines.push(`Total: ${verbs?.length ?? 0}`);
    lines.push("");
    lines.push("```");
    lines.push((verbs ?? []).map((v) => v.infinitive).join(", "));
    lines.push("```");
    lines.push("");
    lines.push("### By verb_type (for reference on what's already covered):");
    const byType: Record<string, string[]> = {};
    for (const v of verbs ?? []) {
      byType[v.verb_type] = byType[v.verb_type] ?? [];
      byType[v.verb_type].push(v.infinitive);
    }
    for (const [type, infs] of Object.entries(byType)) {
      lines.push(`- **${type}** (${infs.length}): ${infs.slice(0, 30).join(", ")}${infs.length > 30 ? ", ..." : ""}`);
    }
    lines.push("");
    lines.push("---");
    lines.push("");

    lines.push(`## ${langName} grammar exercises (already in DB — do not duplicate prompts)`);
    lines.push("");
    const { data: topics } = await supabaseAdmin
      .from("grammar_topics")
      .select("id, slug, title, category, cefr_level, explanation_md")
      .eq("language", lang)
      .order("sort_order");

    for (const t of topics ?? []) {
      const { data: exs } = await supabaseAdmin.from("grammar_exercises").select("prompt").eq("topic_id", t.id);
      lines.push(`### ${t.slug} — ${t.title} (${t.cefr_level}, ${exs?.length ?? 0} exercises)`);
      lines.push("");
      lines.push("<details><summary>Rule (explanationMd)</summary>");
      lines.push("");
      lines.push(t.explanation_md);
      lines.push("");
      lines.push("</details>");
      lines.push("");
      lines.push("Existing prompts:");
      lines.push("");
      for (const e of exs ?? []) {
        lines.push(`- ${e.prompt}`);
      }
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  }

  writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log(`Written to ${outPath}`);
  console.log(`File size: ${(lines.join("\n").length / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
