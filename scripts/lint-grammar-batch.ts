// Pre-review gate for grammar-exercise batches (same JSON shape
// insert-grammar-batch.ts consumes). Pure code checks, zero model reasoning
// — catches the mechanical bug categories that showed up repeatedly across
// this project's content rounds (missing/duplicate blanks, Spain-register
// words, duplicate prompts, bad topic slugs) so the model review pass that
// follows can spend its reasoning on what's actually irreducible: grammar
// logic, conjugation correctness, and naturalness. Every item still needs
// that review — this doesn't reduce coverage, it removes redundant checking.
//
// Usage: npm run lint:grammar-batch -- path/to/batch.json [--language es|pt|fr]

import { readFileSync } from "fs";
import { supabaseAdmin } from "./lib/supabaseAdmin";
import type { CefrLevel, GrammarExerciseInsert, Language } from "./lib/insert";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Flag-only (not hard-fail) since some senses are legitimate — "piso" as
// "floor" and "móvil" as the invariable adjective are both fine.
const REGISTER_HARD_FAIL = [
  { pattern: /\bvosotros\b/i, note: "vosotros — Mexican Spanish uses tú/usted/ustedes" },
  { pattern: /\bvuestr[oa]s?\b/i, note: "vuestro/a — Mexican Spanish uses tú/usted/ustedes" },
  { pattern: /\bzumo\b/i, note: "zumo — Spain word, Mexican Spanish uses jugo" },
  { pattern: /\bordenador(es)?\b/i, note: "ordenador — Spain word, Mexican Spanish uses computadora" },
  { pattern: /\bbillete(s)?\b/i, note: "billete — Spain word, Mexican Spanish uses boleto (for tickets)" },
];

const REGISTER_FLAG_ONLY = [
  { pattern: /\bpiso\b/i, note: "piso — confirm this means 'floor', not 'apartment' (departamento in Mexico)" },
  { pattern: /\bmóvil(es)?\b/i, note: "móvil — confirm this isn't being used as a noun meaning 'cell phone' (celular in Mexico)" },
];

interface Finding {
  topic: string;
  index: number;
  prompt: string;
  severity: "fail" | "flag";
  reason: string;
}

function checkStructural(topic: string, index: number, item: unknown): Finding[] {
  const findings: Finding[] = [];
  const push = (severity: Finding["severity"], reason: string, prompt = "") =>
    findings.push({ topic, index, prompt, severity, reason });

  if (typeof item !== "object" || item === null) {
    push("fail", "item is not an object");
    return findings;
  }
  const it = item as Partial<GrammarExerciseInsert>;

  if (typeof it.prompt !== "string" || !it.prompt.trim()) {
    push("fail", "missing or empty 'prompt'");
    return findings;
  }
  const prompt = it.prompt;

  const blankCount = (prompt.match(/___/g) ?? []).length;
  if (blankCount === 0) push("fail", "no ___ blank in prompt", prompt);
  if (blankCount > 1) push("fail", `${blankCount} separate ___ blanks — UI only supports one`, prompt);

  if (!Array.isArray(it.accepted_answers) || it.accepted_answers.length === 0) {
    push("fail", "accepted_answers must be a non-empty array", prompt);
  } else if (!it.accepted_answers.every((a) => typeof a === "string" && a.trim())) {
    push("fail", "accepted_answers contains a non-string or empty entry", prompt);
  }

  if (typeof it.explanation !== "string" || !it.explanation.trim()) {
    push("fail", "missing or empty 'explanation'", prompt);
  }

  if (!CEFR_LEVELS.includes(it.cefr_level as CefrLevel)) {
    push("fail", `invalid cefr_level "${it.cefr_level}" — must be one of ${CEFR_LEVELS.join("/")}`, prompt);
  }

  if (!/[.?!]$/.test(prompt.trim())) {
    push("flag", "prompt doesn't end in . ? or ! — check it's a complete sentence", prompt);
  }

  for (const { pattern, note } of REGISTER_HARD_FAIL) {
    if (pattern.test(prompt) || pattern.test(it.explanation ?? "")) push("fail", note, prompt);
  }
  for (const { pattern, note } of REGISTER_FLAG_ONLY) {
    if (pattern.test(prompt) || pattern.test(it.explanation ?? "")) push("flag", note, prompt);
  }

  return findings;
}

async function main() {
  const file = process.argv[2];
  const langIdx = process.argv.indexOf("--language");
  const language: Language = (langIdx !== -1 ? (process.argv[langIdx + 1] as Language) : "es") ?? "es";
  if (!file) throw new Error("Usage: lint-grammar-batch.ts path/to/batch.json [--language es|pt|fr]");

  const batch: Record<string, unknown[]> = JSON.parse(readFileSync(file, "utf-8"));

  const allFindings: Finding[] = [];
  let totalItems = 0;

  const { data: topicRows } = await supabaseAdmin
    .from("grammar_topics")
    .select("id, slug")
    .eq("language", language);
  const topicIdBySlug = new Map((topicRows ?? []).map((t) => [t.slug, t.id]));

  for (const [slug, items] of Object.entries(batch)) {
    if (!topicIdBySlug.has(slug)) {
      allFindings.push({ topic: slug, index: -1, prompt: "", severity: "fail", reason: `no grammar_topics row for slug "${slug}" in language "${language}"` });
      continue;
    }
    if (!Array.isArray(items)) {
      allFindings.push({ topic: slug, index: -1, prompt: "", severity: "fail", reason: "value is not an array" });
      continue;
    }

    totalItems += items.length;

    // Structural + register checks, per item.
    const seenPrompts = new Set<string>();
    items.forEach((item, index) => {
      allFindings.push(...checkStructural(slug, index, item));
      const prompt = (item as Partial<GrammarExerciseInsert>)?.prompt;
      if (typeof prompt === "string") {
        const key = prompt.trim().toLowerCase();
        if (seenPrompts.has(key)) {
          allFindings.push({ topic: slug, index, prompt, severity: "fail", reason: "duplicate prompt within this batch" });
        }
        seenPrompts.add(key);
      }
    });

    // Duplicate-against-live-DB check.
    const { data: existing } = await supabaseAdmin
      .from("grammar_exercises")
      .select("prompt")
      .eq("topic_id", topicIdBySlug.get(slug));
    const existingPrompts = new Set((existing ?? []).map((e) => e.prompt.trim().toLowerCase()));
    items.forEach((item, index) => {
      const prompt = (item as Partial<GrammarExerciseInsert>)?.prompt;
      if (typeof prompt === "string" && existingPrompts.has(prompt.trim().toLowerCase())) {
        allFindings.push({ topic: slug, index, prompt, severity: "fail", reason: "duplicate of a prompt already live in the DB" });
      }
    });
  }

  const fails = allFindings.filter((f) => f.severity === "fail");
  const flags = allFindings.filter((f) => f.severity === "flag");

  console.log(`Checked ${totalItems} items across ${Object.keys(batch).length} topics.\n`);

  if (fails.length) {
    console.log(`${fails.length} FAIL:`);
    for (const f of fails) {
      console.log(`  [${f.topic}#${f.index}] ${f.reason}${f.prompt ? `\n      "${f.prompt}"` : ""}`);
    }
    console.log("");
  }
  if (flags.length) {
    console.log(`${flags.length} FLAG (needs human confirmation, not auto-blocked):`);
    for (const f of flags) {
      console.log(`  [${f.topic}#${f.index}] ${f.reason}\n      "${f.prompt}"`);
    }
    console.log("");
  }
  if (!fails.length && !flags.length) {
    console.log("Clean — no structural or register issues found. Still needs a full model review for grammar/semantic correctness before inserting.");
  }

  if (fails.length) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
