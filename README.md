# Cuaderno — vocab & verb review (vertical slice)

This is the first slice of the app: spaced-repetition review for vocab and
verbs, with a frequency-order mode and a thematic-list mode, synced through
Supabase so progress follows you between iPad and iPhone. Grammar practice
and the diary are intentionally not built yet — this slice exists to prove
the data model and sync approach before those get layered on.

## What's in here

- `supabase/schema.sql` — the database schema: themes, vocab items, verbs,
  and per-user SRS state. Vocab and verbs are separate tables sharing one
  scheduling engine.
- `src/lib/srs.ts` — the spaced-repetition algorithm (SM-2 variant), with no
  dependency on the database or UI, so it can be unit tested on its own.
- `src/lib/reviewQueue.ts` — fetches what's due, in either frequency or
  thematic mode.
- `src/app/vocab/page.tsx` — the review screen.
- `src/components/` — the flashcard, the theme toggle, and a minimal
  email-magic-link sign-in gate.

## One-time setup

1. **Create a Supabase project** at supabase.com (free tier is enough to
   start — see the cost breakdown from earlier in this conversation).
2. In the Supabase dashboard, open the **SQL editor** and run the contents
   of `supabase/schema.sql`.
3. In **Project settings → API**, copy the project URL and anon public key.
4. Copy `.env.local.example` to `.env.local` and paste those two values in.
5. In **Authentication → Providers**, email magic-link sign-in is on by
   default — nothing else to configure for now.
6. Install dependencies and run locally:
   ```
   npm install
   npm run dev
   ```
   Open the URL it prints — you should see the home screen.

## Adding content to try it

The schema ships empty — there's no seed data yet, since real content
should come from the generate → verify pipeline we discussed, not hand
typed. To try the review flow right now, insert a few rows directly in the
Supabase SQL editor, e.g.:

```sql
insert into vocab_items (lemma, translation, part_of_speech, example_sentence, example_translation, cefr_level, verified)
values ('mercado', 'market', 'noun', 'Voy al mercado los sábados por la mañana.', 'I go to the market on Saturday mornings.', 'A1', true);

-- then, once you have a user (sign in once in the app first so auth.users has a row):
insert into srs_state (user_id, vocab_item_id)
select id, (select id from vocab_items where lemma = 'mercado')
from auth.users limit 1;
```

## Deploying so it's on your phone too

Push this to a GitHub repo and import it into Vercel (free tier) — it
detects Next.js automatically. Add the same two env vars in the Vercel
project settings. Once deployed, open the URL on iPhone and iPad and use
"Add to Home Screen" from the share sheet on each — that's what makes it
behave like an installed app rather than a browser tab.

## Where to go next

In order, matching what we planned:
1. Build the content pipeline (generate → verify → approve) so
   `vocab_items` and `verbs` fill up with real, sourced content instead of
   manual inserts.
2. Add the grammar exercise module.
3. Add the diary (Apple Pencil canvas + Claude-graded correction).
4. Add the CEFR progress dashboard, once there's enough review history to
   summarize.
