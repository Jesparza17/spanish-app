// The no-cost content path: takes JSON that's already been written and
// reviewed (typically: you ask Claude Code to generate a batch in
// conversation, it writes the JSON to a scratch file) and inserts it —
// dedup against existing rows, theme-tagging, and SRS enrollment, same as
// the automated pipeline, but with no Anthropic API call anywhere in this
// script. Only needs SUPABASE_SERVICE_ROLE_KEY.
//
// Usage:
//   npm run insert:content -- vocab path/to/items.json [--theme "el mercado"] [--extend] [--language pt]
//   npm run insert:content -- verbs path/to/items.json [--theme "la rutina diaria"] [--extend] [--language pt]
//   npm run insert:content -- grammar path/to/items.json --topic ser_estar
//
// --extend: for an item whose lemma/infinitive already exists, merge the new
// translation into the existing one instead of skipping it (see lib/insert.ts).
// Use only for a small curated "additional sense" file — the default (no
// --extend) stays skip-on-duplicate, which is what the ordinary bulk-content
// grind wants (a duplicate there really is an accidental re-add).
//
// --language: defaults to "es" (unchanged behavior for every prior
// invocation). Grammar exercises don't take --language — they inherit it
// from the topic (--topic) they're attached to.

import { readFileSync } from "fs";
import { insertGrammarExercises, insertVerbs, insertVocab, type Language } from "./lib/insert";

const BOOLEAN_FLAGS = new Set(["extend"]);

function parseArgs(argv: string[]) {
  const type = argv[2];
  const positional: string[] = [];
  const opts: Record<string, string> = {};
  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (BOOLEAN_FLAGS.has(key)) {
        opts[key] = "true";
      } else {
        opts[key] = argv[i + 1] ?? "";
        i++;
      }
    } else {
      positional.push(arg);
    }
  }
  return { type, file: positional[0], opts };
}

async function main() {
  const { type, file, opts } = parseArgs(process.argv);
  if (!file) {
    throw new Error("Usage: insert-content.ts <vocab|verbs|grammar> <file.json> [--theme name] [--topic slug] [--extend]");
  }
  const items = JSON.parse(readFileSync(file, "utf-8"));
  const mode = opts.extend === "true" ? "extend" : "skip";
  const language = (opts.language as Language) || "es";

  switch (type) {
    case "vocab": {
      const result = await insertVocab(items, opts.theme, mode, language);
      console.log(
        mode === "extend"
          ? `vocab: ${result.inserted} inserted, ${result.extended} extended, ${result.skipped} unchanged.`
          : `vocab: ${result.inserted} inserted, ${result.skipped} skipped (already existed).`
      );
      break;
    }
    case "verbs": {
      const result = await insertVerbs(items, opts.theme, mode, language);
      console.log(
        mode === "extend"
          ? `verbs: ${result.inserted} inserted, ${result.extended} extended, ${result.skipped} unchanged.`
          : `verbs: ${result.inserted} inserted, ${result.skipped} skipped (already existed).`
      );
      break;
    }
    case "grammar": {
      if (!opts.topic) throw new Error("grammar requires --topic <slug>");
      const result = await insertGrammarExercises(opts.topic, items);
      console.log(`grammar (${opts.topic}): ${result.inserted} inserted.`);
      break;
    }
    default:
      throw new Error(`Unknown content type "${type ?? ""}". Use: vocab | verbs | grammar.`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
