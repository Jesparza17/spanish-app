// OPTIONAL, API-billed pipeline: generate -> verify -> insert, unattended,
// calling the Anthropic API directly with your own ANTHROPIC_API_KEY. This
// is billed separately from any Claude subscription — if you'd rather not
// spend on that, use scripts/insert-content.ts instead, which takes content
// generated in a Claude Code conversation and just inserts it, no API key.
//
// Usage:
//   npm run generate:vocab -- --count 20 [--theme "el mercado"]
//   npm run generate:verbs -- --count 10 [--theme "la rutina diaria"]
//   npm run generate:grammar -- --topic ser_estar --count 15
//
// There is no human-approval step by design — every candidate goes through
// 3 independent, fresh-context critic passes (see scripts/lib/anthropic.ts)
// and only unanimous passes get inserted, as verified: true, immediately
// available in the app. Failures are discarded, not queued for review. The
// only output is a pass/fail count — never the content itself.

import type Anthropic from "@anthropic-ai/sdk";
import { extractStructured, passesUnanimousVerification, researchAndDraft } from "./lib/anthropic";
import { insertGrammarExercises, insertVerbs, insertVocab } from "./lib/insert";
import { supabaseAdmin } from "./lib/supabaseAdmin";

type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface VocabCandidate {
  lemma: string;
  translation: string;
  part_of_speech: string;
  example_sentence: string;
  example_translation: string;
  cefr_level: CefrLevel;
  /** Only meaningful when part_of_speech is "noun" — drives the gender-practice drill. */
  gender?: "m" | "f";
}

interface VerbCandidate {
  infinitive: string;
  translation: string;
  verb_type: "regular_ar" | "regular_er" | "regular_ir" | "irregular" | "stem_changing";
  example_sentence: string;
  example_translation: string;
  cefr_level: CefrLevel;
}

interface GrammarExerciseCandidate {
  prompt: string;
  accepted_answers: string[];
  explanation: string;
  cefr_level: CefrLevel;
}

const CEFR_SCHEMA_FIELD = { type: "string" as const, enum: CEFR_LEVELS };

const MEXICAN_SPANISH_BRIEF = `Scope: Mexican Spanish, standard/proper grammar (not regional colloquialisms or slang), literature and daily-conversation register. Never use vosotros forms or vosotros conjugations anywhere — Mexican Spanish uses tú/usted and ustedes for plural "you" in both registers.`;

function parseArgs(argv: string[]) {
  const type = argv[2];
  const opts: Record<string, string> = {};
  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        opts[key] = next;
        i++;
      } else {
        opts[key] = "true";
      }
    }
  }
  return { type, opts };
}

async function runVocab(count: number, theme?: string) {
  const { data: existing } = await supabaseAdmin
    .from("vocab_items")
    .select("lemma")
    .order("created_at", { ascending: false })
    .limit(300);
  const existingLemmas = (existing ?? []).map((r) => r.lemma);

  const draft = await researchAndDraft(`
Generate ${count} Spanish vocabulary items (nouns, adjectives, adverbs — not verbs) for a Mexican-Spanish learning app.
${MEXICAN_SPANISH_BRIEF}

For each item give: lemma (dictionary form), translation, part of speech, one natural example sentence a Mexican Spanish speaker would actually say in daily conversation or literature, its English translation, an estimated CEFR level (A1-C2) for the word itself, and — only when part of speech is "noun" — its grammatical gender ("m" or "f").

Use web search where it helps ground word choice and frequency in real Mexican Spanish usage, not just your prior knowledge.

Do not repeat any of these existing lemmas: ${existingLemmas.length ? existingLemmas.join(", ") : "(none yet)"}.
${theme ? `Every item should fit the theme "${theme}".` : ""}

List all ${count} items clearly, one per numbered entry, with each field labeled.
`);

  const schema: Anthropic.Tool.InputSchema = {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            lemma: { type: "string" },
            translation: { type: "string" },
            part_of_speech: { type: "string" },
            example_sentence: { type: "string" },
            example_translation: { type: "string" },
            cefr_level: CEFR_SCHEMA_FIELD,
            gender: { type: "string", enum: ["m", "f"] },
          },
          required: ["lemma", "translation", "part_of_speech", "example_sentence", "example_translation", "cefr_level"],
          additionalProperties: false,
        },
      },
    },
    required: ["items"],
    additionalProperties: false,
  };

  const { items } = await extractStructured<{ items: VocabCandidate[] }>(
    draft,
    "emit_vocab_batch",
    "Record the drafted vocabulary items in structured form.",
    schema
  );

  const passing: VocabCandidate[] = [];
  for (const item of items) {
    const pass = await passesUnanimousVerification(
      `Lemma: ${item.lemma}\nPart of speech: ${item.part_of_speech}\nTranslation: ${item.translation}\nExample sentence: ${item.example_sentence}\nExample translation: ${item.example_translation}\nClaimed CEFR level: ${item.cefr_level}${item.gender ? `\nClaimed gender: ${item.gender}` : ""}`,
      `1. The lemma and example sentence are 100% grammatically correct standard Spanish.\n2. The example sentence is natural — a native Mexican Spanish speaker would actually say it, not an awkward or overly literal construction.\n3. No vosotros forms.\n4. The translation and example translation are accurate.\n5. The CEFR level is a reasonable estimate for this word.\n6. The register is standard/proper, not slang.${item.gender ? "\n7. If a gender is claimed, it is the correct grammatical gender for this noun." : ""}`
    );
    if (pass) passing.push(item);
  }

  const { inserted, skipped } = await insertVocab(passing, theme);
  console.log(
    `vocab: ${passing.length}/${items.length} passed verification, ${items.length - passing.length} discarded, ${inserted} inserted (${skipped} skipped as duplicates).`
  );
}

async function runVerbs(count: number, theme?: string) {
  const { data: existing } = await supabaseAdmin
    .from("verbs")
    .select("infinitive")
    .order("created_at", { ascending: false })
    .limit(300);
  const existingInfinitives = (existing ?? []).map((r) => r.infinitive);

  const draft = await researchAndDraft(`
Generate ${count} Spanish verbs for a Mexican-Spanish learning app.
${MEXICAN_SPANISH_BRIEF}

For each verb give: infinitive, translation, verb_type (one of: regular_ar, regular_er, regular_ir, irregular, stem_changing — classify accurately), one natural example sentence using the verb in a common, everyday conjugated form a Mexican Spanish speaker would actually use, its English translation, and an estimated CEFR level (A1-C2).

Use web search where it helps ground the choice of common, frequently-used verbs in real Mexican Spanish, not just your prior knowledge.

Do not repeat any of these existing infinitives: ${existingInfinitives.length ? existingInfinitives.join(", ") : "(none yet)"}.
${theme ? `Every item should fit the theme "${theme}".` : ""}

List all ${count} items clearly, one per numbered entry, with each field labeled.
`);

  const schema: Anthropic.Tool.InputSchema = {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            infinitive: { type: "string" },
            translation: { type: "string" },
            verb_type: {
              type: "string",
              enum: ["regular_ar", "regular_er", "regular_ir", "irregular", "stem_changing"],
            },
            example_sentence: { type: "string" },
            example_translation: { type: "string" },
            cefr_level: CEFR_SCHEMA_FIELD,
          },
          required: ["infinitive", "translation", "verb_type", "example_sentence", "example_translation", "cefr_level"],
          additionalProperties: false,
        },
      },
    },
    required: ["items"],
    additionalProperties: false,
  };

  const { items } = await extractStructured<{ items: VerbCandidate[] }>(
    draft,
    "emit_verb_batch",
    "Record the drafted verbs in structured form.",
    schema
  );

  const passing: VerbCandidate[] = [];
  for (const item of items) {
    const pass = await passesUnanimousVerification(
      `Infinitive: ${item.infinitive}\nClaimed verb type: ${item.verb_type}\nTranslation: ${item.translation}\nExample sentence: ${item.example_sentence}\nExample translation: ${item.example_translation}\nClaimed CEFR level: ${item.cefr_level}`,
      `1. The infinitive and example sentence are 100% grammatically correct standard Spanish, including correct conjugation in the example.\n2. The claimed verb_type accurately classifies the infinitive (regular_ar/regular_er/regular_ir/irregular/stem_changing).\n3. The example sentence is natural — a native Mexican Spanish speaker would actually say it.\n4. No vosotros forms.\n5. The translation and example translation are accurate.\n6. The CEFR level is a reasonable estimate.`
    );
    if (pass) passing.push(item);
  }

  const { inserted, skipped } = await insertVerbs(passing, theme);
  console.log(
    `verbs: ${passing.length}/${items.length} passed verification, ${items.length - passing.length} discarded, ${inserted} inserted (${skipped} skipped as duplicates).`
  );
}

async function runGrammar(count: number, topicSlug: string) {
  const { data: topic, error: topicError } = await supabaseAdmin
    .from("grammar_topics")
    .select("id, title, explanation_md, cefr_level")
    .eq("slug", topicSlug)
    .single();
  if (topicError || !topic) {
    throw new Error(`No grammar_topics row for slug "${topicSlug}" — run npm run seed:grammar-topics first.`);
  }

  const { data: existing } = await supabaseAdmin
    .from("grammar_exercises")
    .select("prompt")
    .eq("topic_id", topic.id)
    .order("created_at", { ascending: false })
    .limit(200);
  const existingPrompts = (existing ?? []).map((r) => r.prompt);

  const draft = await researchAndDraft(`
Generate ${count} practice exercises for the Mexican-Spanish grammar topic "${topic.title}".
${MEXICAN_SPANISH_BRIEF}

Topic explanation the learner has already read:
${topic.explanation_md}

Each exercise is a cloze sentence: a natural Spanish sentence with one blank (marked "___") that specifically tests this grammar point, written for someone typing the answer on a keyboard. Give:
- prompt: the full cloze sentence (include an English gloss in parentheses at the end if it meaningfully disambiguates what's being asked for)
- accepted_answers: every correct way to fill the blank (usually one, occasionally two or three genuine variants — do not include incorrect near-misses)
- explanation: one or two sentences explaining why that answer is correct, referencing the rule
- cefr_level: A1-C2 for this specific sentence

Do not repeat any of these existing prompts: ${existingPrompts.length ? existingPrompts.join(" | ") : "(none yet)"}.

List all ${count} exercises clearly, one per numbered entry, with each field labeled.
`);

  const schema: Anthropic.Tool.InputSchema = {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            prompt: { type: "string" },
            accepted_answers: { type: "array", items: { type: "string" } },
            explanation: { type: "string" },
            cefr_level: CEFR_SCHEMA_FIELD,
          },
          required: ["prompt", "accepted_answers", "explanation", "cefr_level"],
          additionalProperties: false,
        },
      },
    },
    required: ["items"],
    additionalProperties: false,
  };

  const { items } = await extractStructured<{ items: GrammarExerciseCandidate[] }>(
    draft,
    "emit_grammar_exercise_batch",
    "Record the drafted grammar exercises in structured form.",
    schema
  );

  const passing: GrammarExerciseCandidate[] = [];
  for (const item of items) {
    const pass = await passesUnanimousVerification(
      `Grammar topic: ${topic.title}\nCloze sentence: ${item.prompt}\nAccepted answers: ${item.accepted_answers.join(", ")}\nExplanation: ${item.explanation}\nClaimed CEFR level: ${item.cefr_level}`,
      `1. The completed sentence (blank filled with any accepted answer) is 100% grammatically correct standard Spanish and natural — a native Mexican Spanish speaker would actually say it.\n2. Every accepted answer is genuinely correct for the blank; no incorrect answer is listed; no genuinely correct common variant is missing.\n3. The sentence actually tests the stated grammar topic (${topic.title}), not something unrelated.\n4. No vosotros forms.\n5. The explanation is accurate and correctly describes why the answer is right.\n6. The CEFR level is a reasonable estimate.`
    );
    if (pass) passing.push(item);
  }

  const { inserted } = passing.length ? await insertGrammarExercises(topicSlug, passing) : { inserted: 0 };
  console.log(
    `grammar (${topicSlug}): ${passing.length}/${items.length} passed verification, ${items.length - passing.length} discarded, ${inserted} inserted.`
  );
}

async function main() {
  const { type, opts } = parseArgs(process.argv);
  const count = Number(opts.count ?? "10");
  if (!Number.isFinite(count) || count <= 0) throw new Error("--count must be a positive number.");

  switch (type) {
    case "vocab":
      await runVocab(count, opts.theme);
      break;
    case "verbs":
      await runVerbs(count, opts.theme);
      break;
    case "grammar":
      if (!opts.topic) throw new Error("generate:grammar requires --topic <slug> (see src/lib/grammarTopics.seed.ts).");
      await runGrammar(count, opts.topic);
      break;
    default:
      throw new Error(`Unknown content type "${type ?? ""}". Use: vocab | verbs | grammar.`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
