// Bulk-insert grammar exercises across many topics in one pass. Input is a
// single JSON file shaped { [topicSlug]: GrammarExerciseInsert[] }, unlike
// insert-content.ts's grammar mode which only takes one topic per file.
//
// Usage: npm run insert:grammar-batch -- path/to/batch.json

import { readFileSync } from "fs";
import { insertGrammarExercises } from "./lib/insert";

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: insert-grammar-batch.ts path/to/batch.json");
  const batch: Record<string, unknown[]> = JSON.parse(readFileSync(file, "utf-8"));

  let total = 0;
  for (const [slug, items] of Object.entries(batch)) {
    const result = await insertGrammarExercises(slug, items as any);
    console.log(`${slug}: ${result.inserted} inserted`);
    total += result.inserted;
  }
  console.log(`Total: ${total} inserted across ${Object.keys(batch).length} topics.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
