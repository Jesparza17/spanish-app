// One-time (re-runnable) seed for the Gramática topic list — explanations are
// hand-authored per language (grammarTopics*.seed.ts), not pipeline-generated.
// Run with: npm run seed:grammar-topics

import { GRAMMAR_TOPICS, type GrammarTopicSeed } from "../src/lib/grammarTopics.seed";
import { GRAMMAR_TOPICS_PT } from "../src/lib/grammarTopicsPt.seed";
import { GRAMMAR_TOPICS_FR } from "../src/lib/grammarTopicsFr.seed";
import { supabaseAdmin } from "./lib/supabaseAdmin";

const ALL: GrammarTopicSeed[] = [...GRAMMAR_TOPICS, ...GRAMMAR_TOPICS_PT, ...GRAMMAR_TOPICS_FR];

async function main() {
  const { error } = await supabaseAdmin.from("grammar_topics").upsert(
    ALL.map((t) => ({
      slug: t.slug,
      title: t.title,
      category: t.category,
      explanation_md: t.explanationMd,
      cefr_level: t.cefrLevel,
      sort_order: t.sortOrder,
      language: t.language ?? "es",
    })),
    { onConflict: "slug" }
  );
  if (error) throw error;
  console.log(
    `Seeded ${ALL.length} grammar topics (${GRAMMAR_TOPICS.length} es, ${GRAMMAR_TOPICS_PT.length} pt, ${GRAMMAR_TOPICS_FR.length} fr).`
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
