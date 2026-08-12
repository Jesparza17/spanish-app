# Cuaderno — vocab, verbs, grammar, and a content pipeline

Spaced-repetition review for vocab and verbs, a Gramática/Verbos practice
module, and an unattended content-generation pipeline, all synced through
Supabase so progress follows you between iPad and iPhone. The diary and the
CEFR progress dashboard are intentionally not built yet.

## What's in here

- `supabase/schema.sql` — themes, vocab items, verbs, per-user SRS state.
- `supabase/002_grammar_pipeline.sql` — grammar topics, grammar exercises,
  per-user grammar/tense progress. Run after `schema.sql`.
- `src/lib/srs.ts` — the vocab/verb spaced-repetition algorithm (SM-2
  variant), dependency-free so it's unit-testable on its own.
- `src/lib/conjugation.ts` + `src/lib/irregularVerbs.ts` — a **deterministic**
  Spanish conjugation engine (regular rules + a curated irregular/stem-change
  table). No LLM involved — conjugation has one correct answer, so it's
  computed, not generated. This is what grades the Verbos drills and builds
  their answer keys.
- `src/lib/reviewQueue.ts` / `src/lib/grammarQueue.ts` — fetch what's due
  (vocab/verbs) and what's next (grammar topic exercises, live-generated
  tense drills), and record results back to Supabase.
- `src/app/vocab/page.tsx` — the vocab/verb review screen.
- `src/app/grammar/` — Gramática (topic explanation + cloze practice) and
  Verbos (per-tense Practice/Test with a progress indicator), toggled from
  one landing page.
- `scripts/generate-content.ts` — the content pipeline (see below).
- `src/lib/grammarTopics.seed.ts` + `scripts/seed-grammar-topics.ts` — the
  ~14 hand-written Gramática topic explanations and the one-time script that
  loads them.

## One-time setup

1. **Create a Supabase project** at supabase.com.
2. In the Supabase dashboard SQL editor, run `supabase/schema.sql`, then
   `supabase/002_grammar_pipeline.sql`.
3. In **Project settings → API**, copy the project URL, the anon public key,
   and the **service role** key.
4. In **console.anthropic.com → API keys**, create a key.
5. Copy `.env.local.example` to `.env.local` and fill in all four values.
   The service role key and the Anthropic key are only ever read by
   `scripts/` (the pipeline) — never imported from `src/`, so they can't
   reach the browser bundle.
6. In **Authentication → Providers**, email magic-link sign-in is on by
   default — nothing else to configure.
7. Install dependencies and run locally:
   ```
   npm install
   npm run dev
   ```
   Sign in once so `auth.users` has a row — the pipeline enrolls new
   vocab/verbs into every existing user's review queue automatically.

## Adding content

There's no manual-insert step anymore — content comes from the pipeline:

```
npm run seed:grammar-topics          # one-time: loads the Gramática topic list
npm run generate:vocab -- --count 20
npm run generate:verbs -- --count 10
npm run generate:grammar -- --topic ser_estar --count 15   # any slug from grammarTopics.seed.ts
```

Each run drafts candidates (grounded with web search where useful), runs
them through 3 independent, fresh-context critics, and only inserts items
**all three** agree are grammatically correct, natural Mexican Spanish, and
accurately translated. There's no human-approval queue by design — failures
are discarded, not shown to you. The only output is a pass/fail count, e.g.
`vocab: 18/20 passed verification, 2 discarded.`

Tense-drill questions for Verbos aren't stored — they're generated live from
`conjugation.ts` against whatever verbs exist, so there's nothing to run for
those beyond `generate:verbs`.

## Deploying so it's on your phone too

Push this to a GitHub repo and import it into Vercel — it detects Next.js
automatically. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
in the Vercel project settings (the service role and Anthropic keys are only
needed locally, to run the pipeline — don't add them to Vercel). Once
deployed, open the URL on iPhone and iPad and use "Add to Home Screen" from
the share sheet on each.

## Where to go next

1. The diary (Apple Pencil canvas + Claude-graded correction).
2. The CEFR progress dashboard, once there's enough review history to
   summarize.
