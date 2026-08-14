import { supabaseAdmin } from "./lib/supabaseAdmin";

async function main() {
  const slugs = [
    "demonstratives",
    "possessives",
    "adverb_formation",
    "negation",
    "hay_vs_estar",
    "relative_pronouns",
  ];
  const { data: topics } = await supabaseAdmin
    .from("grammar_topics")
    .select("id, slug, title, explanation_md, cefr_level")
    .in("slug", slugs);
  if (!topics) return;

  for (const t of topics) {
    console.log(`\n===== ${t.slug} (${t.title}, ${t.cefr_level}) =====`);
    console.log(t.explanation_md);
    const { data: exs } = await supabaseAdmin
      .from("grammar_exercises")
      .select("prompt, accepted_answers, explanation, cefr_level")
      .eq("topic_id", t.id)
      .limit(5);
    console.log("--- sample exercises ---");
    console.log(JSON.stringify(exs, null, 2));
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
