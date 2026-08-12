// The no-cost content path: takes JSON that's already been written and
// reviewed (typically: you ask Claude Code to generate a batch in
// conversation, it writes the JSON to a scratch file) and inserts it —
// dedup against existing rows, theme-tagging, and SRS enrollment, same as
// the automated pipeline, but with no Anthropic API call anywhere in this
// script. Only needs SUPABASE_SERVICE_ROLE_KEY.
//
// Usage:
//   npm run insert:content -- vocab path/to/items.json [--theme "el mercado"]
//   npm run insert:content -- verbs path/to/items.json [--theme "la rutina diaria"]
//   npm run insert:content -- grammar path/to/items.json --topic ser_estar

import { readFileSync } from "fs";
import { insertGrammarExercises, insertVerbs, insertVocab } from "./lib/insert";

function parseArgs(argv: string[]) {
  const type = argv[2];
  const positional: string[] = [];
  const opts: Record<string, string> = {};
  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      opts[arg.slice(2)] = argv[i + 1] ?? "";
      i++;
    } else {
      positional.push(arg);
    }
  }
  return { type, file: positional[0], opts };
}

async function main() {
  const { type, file, opts } = parseArgs(process.argv);
  if (!file) {
    throw new Error("Usage: insert-content.ts <vocab|verbs|grammar> <file.json> [--theme name] [--topic slug]");
  }
  const items = JSON.parse(readFileSync(file, "utf-8"));

  switch (type) {
    case "vocab": {
      const result = await insertVocab(items, opts.theme);
      console.log(`vocab: ${result.inserted} inserted, ${result.skipped} skipped (already existed).`);
      break;
    }
    case "verbs": {
      const result = await insertVerbs(items, opts.theme);
      console.log(`verbs: ${result.inserted} inserted, ${result.skipped} skipped (already existed).`);
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
