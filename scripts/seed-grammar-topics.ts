// One-time (re-runnable) seed for the Gramática topic list — explanations are
// hand-authored in src/lib/grammarTopics.seed.ts, not pipeline-generated.
// Run with: npm run seed:grammar-topics

import { GRAMMAR_TOPICS } from "../src/lib/grammarTopics.seed";
import { supabaseAdmin } from "./lib/supabaseAdmin";

async function main() {
  const { error } = await supabaseAdmin.from("grammar_topics").upsert(
    GRAMMAR_TOPICS.map((t) => ({
      slug: t.slug,
      title: t.title,
      category: t.category,
      explanation_md: t.explanationMd,
      cefr_level: t.cefrLevel,
      sort_order: t.sortOrder,
    })),
    { onConflict: "slug" }
  );
  if (error) throw error;
  console.log(`Seeded ${GRAMMAR_TOPICS.length} grammar topics.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
