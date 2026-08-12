# Cuaderno — vocab, verbs, grammar, and a content pipeline

Spaced-repetition review for vocab and verbs, a Gramática/Verbos practice
module, and a content-insertion pipeline, all synced through Supabase so
progress follows you between iPad and iPhone. The diary and the CEFR
progress dashboard are intentionally not built yet.

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
- `scripts/insert-content.ts` — the default, no-cost way to add content (see
  below). `scripts/generate-content.ts` is an optional, API-billed
  alternative that automates the whole generate/verify/insert loop.
- `src/lib/grammarTopics.seed.ts` + `scripts/seed-grammar-topics.ts` — the
  ~14 hand-written Gramática topic explanations and the one-time script that
  loads them.

## One-time setup

1. **Create a Supabase project** at supabase.com.
2. In the Supabase dashboard SQL editor, run `supabase/schema.sql`, then
   `supabase/002_grammar_pipeline.sql`.
3. In **Project settings → API**, copy the project URL, the anon public key,
   and the **service role** key — all free, from your own project.
4. Copy `.env.local.example` to `.env.local` and fill in the three Supabase
   values. Leave `ANTHROPIC_API_KEY` blank unless you're using the optional
   automated pipeline (see below). The service role key is only ever read by
   `scripts/` — never imported from `src/`, so it can't reach the browser
   bundle.
5. In **Authentication → Providers**, email magic-link sign-in is on by
   default — nothing else to configure.
6. Install dependencies and run locally:
   ```
   npm install
   npm run dev
   ```
   Sign in once so `auth.users` has a row — new content gets enrolled into
   every existing user's review queue automatically when it's inserted.

## Adding content (no API costs)

The default workflow doesn't touch the Anthropic API at all — you ask
Claude Code (in a session like this one) to draft and review a batch, and it
writes the result to Supabase via `scripts/insert-content.ts`, which only
needs `SUPABASE_SERVICE_ROLE_KEY`:

```
npm run seed:grammar-topics                     # one-time: loads the Gramática topic list
npm run insert:content -- vocab path/to/items.json [--theme "el mercado"]
npm run insert:content -- verbs path/to/items.json [--theme "..."]
npm run insert:content -- grammar path/to/items.json --topic ser_estar
```

`insert-content.ts` dedupes against what's already in the database (skips
anything with a matching lemma/infinitive), tags the theme if you gave one,
and enrolls new vocab/verbs into every user's SRS queue. It doesn't generate
or judge anything itself — that's the conversation's job. JSON shapes:

- **vocab**: `{lemma, translation, part_of_speech, example_sentence, example_translation, cefr_level}[]`
- **verbs**: `{infinitive, translation, verb_type, example_sentence, example_translation, cefr_level}[]`
  (`verb_type` ∈ `regular_ar | regular_er | regular_ir | irregular | stem_changing`)
- **grammar**: `{prompt, accepted_answers, explanation, cefr_level}[]` (topic slugs are in `src/lib/grammarTopics.seed.ts`)

Tense-drill questions for Verbos aren't stored at all — they're generated
live from `conjugation.ts` against whatever verbs exist, so there's nothing
to insert for those beyond adding verbs.

### Optional: fully automated pipeline (costs API credits)

`scripts/generate-content.ts` does the whole generate → verify → insert loop
unattended, calling the Anthropic API directly with your own
`ANTHROPIC_API_KEY` — billed separately from any Claude subscription. Only
reach for this if you want a one-command, repeatable, hands-off way to keep
growing the content bank and are fine paying for it:

```
npm run generate:vocab -- --count 20
npm run generate:verbs -- --count 10
npm run generate:grammar -- --topic ser_estar --count 15
```

Each run drafts candidates (grounded with web search), runs them through 3
independent, fresh-context critics, and only inserts items **all three**
agree are grammatically correct, natural Mexican Spanish, and accurately
translated — no human-approval queue, failures are discarded rather than
shown to you. Output is just a pass/fail count, e.g.
`vocab: 18/20 passed verification, 2 discarded, 18 inserted (0 skipped as duplicates).`

## Deploying so it's on your phone too

Push this to a GitHub repo and import it into Vercel — it detects Next.js
automatically. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
in the Vercel project settings (the service role and Anthropic keys are only
needed locally, to add content — don't add them to Vercel). Once deployed,
open the URL on iPhone and iPad and use "Add to Home Screen" from the share
sheet on each.

## Where to go next

1. The diary (Apple Pencil canvas + Claude-graded correction).
2. The CEFR progress dashboard, once there's enough review history to
   summarize.
