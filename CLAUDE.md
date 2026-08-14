# Cuaderno — project guide for Claude

A personal PWA for learning **Mexican Spanish** (primary focus), Brazilian
Portuguese, and Metropolitan French — SRS vocab/verb review, grammar
topics with exercises, verb-tense conjugation practice, a handwriting
journal ("Diario"), and a glossary. Single user, built and content-curated
almost entirely in Claude Code conversations across many rounds.

## The one rule that matters most

**Correctness and naturalness of the target-language content is the top
priority, above velocity.** Every word, verb form, example sentence, and
grammar explanation the app shows a learner must be linguistically
correct and read the way a native speaker would actually write it — not
textbook-stilted, not machine-translated-sounding. Concretely:

- **Never invent irregular conjugations from memory alone.** Cross-check
  every irregular verb table entry against a live conjugator (see
  "Verification discipline" below) before it ships.
- **Example sentences must sound natural**, not like a grammar-book
  gap-fill. Read each one back and ask "would a native speaker actually
  say this?"
- **Mexican Spanish specifically** — not Spain Spanish. This means:
  - `tú` / `usted` / `ustedes` for "you" — **never `vosotros`**, anywhere,
    in any table or exercise.
  - Vocabulary/register choices lean Mexican where it matters (e.g.
    `computadora` not `ordenador`, `manejar` not `conducir` when both are
    offered, `boleto` not `billete`).
  - Grammar explanations are written in **English** (the learner's native
    language), with Spanish/Portuguese/French terms and example sentences
    inside them — see "Language of explanations" below for the one
    inconsistency to know about.
- When in doubt about a form, **verify before shipping**, don't guess and
  move on. This project has a track record of catching its own bugs by
  building small throwaway spot-check scripts before wiring new engine
  code into the UI — keep doing that.

**Hard rule: nothing gets inserted into the live database without 100%
confidence in its correctness. No exceptions, no "probably right," no
"reviewed by eye but not cross-checked."** This applies to every table a
learner can see or be graded against — `vocab_items`, `verbs`,
`grammar_topics`, `grammar_exercises`, gender/theme data, all of it.
Concretely:
- If a batch's verification isn't complete (live-conjugator check for any
  conjugated form, dictionary cross-check for gender/translations, or
  equivalent), **do not insert it yet** — hold it as a draft (scratchpad
  or a local file) until verification is actually done, however long that
  takes.
- "Reviewed for naturalness by reading it back" is necessary but **not
  sufficient** on its own for anything with a graded answer or a claimed
  grammatical fact (conjugation, gender, accepted answers) — pair it with
  the live-conjugator/dictionary check every time, not just when something
  feels uncertain.
- A smaller, fully-verified batch always beats a larger batch with any
  unverified content in it. Shipping less is always an acceptable outcome;
  shipping something wrong is not.

## Tech stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**, deployed
  as a PWA.
- **Supabase**: Postgres + Auth + Row-Level Security + PostgREST. No
  separate backend — pages call Supabase directly via
  `src/lib/supabaseClient.ts` (browser) / `src/lib/supabaseServer.ts`
  (server components).
- No test suite. Verification is `npm run build` (type-check + compile)
  plus manual spot-check scripts for anything language-logic-related.

## Design system

Grounded in the subject, not a generic dashboard look: cempasúchil
marigold (the flower strung through Mexican literature and daily life) as
the one warm accent, a deep agave teal as the secondary, on an
unbleached-paper background — meant to feel like a notebook. See
`tailwind.config.ts` for the palette (`paper`, `ink`, `card`, `marigold`,
`agave`, `line`) and fonts (`--font-fraunces` display serif,
`--font-inter` sans). Reuse these tokens; don't introduce new colors
without a reason.

## Data model

Core tables (see `supabase/schema.sql` plus incremental migrations
`002`–`007`):

- `vocab_items` (lemma, translation, part_of_speech, example sentence +
  translation, `cefr_level`, `frequency_rank`, `language`) and `verbs`
  (infinitive instead of lemma, `verb_type`) — the two SRS-reviewable
  content types. `verified: boolean` marks whether an item passed the
  generate→verify pipeline (see below); everything inserted through the
  manual `insert-content.ts` path is written as `verified: true` on the
  assumption a human/Claude-Code session already checked it. `VocabInsert`
  (and `insertVocab`) also carries an optional `gender?: "m" | "f"` field
  for noun items — include it when confident of a word's gender, omit it
  otherwise and it stays `null`.
- `themes`, `vocab_item_themes`, `verb_themes` — optional thematic
  grouping, not heavily used.
- `srs_state` — one row per user per item (vocab XOR verb), SM-2-variant
  fields (`ease_factor`, `interval_days`, `repetitions`, `due_at`). RLS:
  users only see their own rows; `vocab_items`/`verbs`/`themes` are
  public-read, service-role-write only.
- `gender_srs_state` (`supabase/011_gender_srs.sql`) — same SM-2 shape as
  `srs_state`, one row per user per noun, but kept in its own table because
  gender mastery and vocab-meaning mastery are independent skills for the
  same word. Lazily enrolled by `src/lib/genderQueue.ts` (a noun gets a row
  only after its first answer; until then the `/grammar/gender` due-queue
  treats it as new/always-due) rather than eagerly backfilled at insert
  time, since there's no XOR-item-type constraint here to coordinate with.
- `grammar_topics` (slug, title, category, `explanation_md`, `cefr_level`,
  `sort_order`, `language`) and `grammar_exercises` (topic-linked
  fill-in-blank cloze items) — see `supabase/002_grammar_pipeline.sql`
  and later repair migrations `004`/`005`.
- `grammar_progress` — per-user progress scoped by `scope_type`
  (`tense`|`topic`|`combined`) + `scope_key`. **Cross-language gotcha**:
  Spanish tense scope keys are unprefixed for backward compatibility;
  Portuguese/French use `"pt:"`/`"fr:"` prefixes via `tenseScopeKey()` in
  `src/lib/grammarQueue.ts`, to avoid collisions when the same tense name
  (e.g. `presente`) exists in more than one language.
- `diary_entries` (`supabase/006_diario.sql`) — vector ink strokes
  (`{x, y, pressure}[]` per stroke) for the handwriting journal, not
  raster images.
- **`language` column** (`'es' | 'pt' | 'fr'`, default `'es'`) on
  `vocab_items`, `verbs`, `grammar_topics`, `themes`
  (`supabase/007_multilanguage.sql`) — every content query in the app
  filters by the active language from `useLanguage()`
  (`src/lib/language.tsx`, a React context persisted to localStorage).

## Conjugation engines — three independent, hand-verified

Each language has its **own** conjugation engine — they don't share logic,
because the irregularities differ enough that a shared abstraction would
mean threading per-language branches through every function:

| Language | Engine | Irregulars | Person paradigm |
|---|---|---|---|
| Spanish | `src/lib/conjugation.ts` | `src/lib/irregularVerbs.ts` | 5: yo/tú/usted/nosotros/ustedes (**no vosotros** — deliberate, matches Mexican register) |
| Portuguese | `src/lib/conjugationPt.ts` | `src/lib/irregularVerbsPt.ts` | 4: eu/você/nós/vocês (**no tu** — Brazilian register; você/vocês take 3rd-person conjugation) |
| French | `src/lib/conjugationFr.ts` | `src/lib/irregularVerbsFr.ts` | 6: je/tu/il/nous/vous/ils (**not simplified** — French genuinely uses both tu and vous actively, unlike the other two) |

Each engine handles its language's regular verb classes (Spanish
-ar/-er/-ir; Portuguese -ar/-er/-ir; French -er/-ir-with-iss-/-re), plus
spelling-preservation rules where relevant (Spanish/Portuguese -car/-gar/
-zar~-çar; French -ger/-cer before back-vowel endings). French additionally
needs avoir-vs-être auxiliary selection for `passé composé`, with a
curated être-verb list in `irregularVerbsFr.ts` (some fully irregular like
`aller`/`venir`, others regular-but-être-auxiliary like `arriver`/
`tomber`, modeled as `{ auxiliary: "être" }`-only override entries).

Grammar topic tense lists (`CORE_TENSES` / `TENSE_LABELS` /
`TENSE_CEFR_LEVELS`, per language) are exported from each engine file and
drive both the Verbos practice picker and the fill-in-blank sentence
templates (`src/lib/fillBlankTemplates.ts`).

### Verification discipline (do this for any new irregular verb)

1. **WebFetch a live conjugator** — `conjugacao.com.br` for Portuguese,
   `conjugaison.com` for French, an equivalent Spanish conjugator — never
   trust recalled/trained-in forms for irregulars.
2. Write a throwaway `tsx` spot-check script (100+ assertions is typical
   for a new engine; a handful for a small addition) exercising the new
   forms end-to-end through the actual engine function, not by hand.
3. Delete the script once it's green — these aren't meant to become a
   permanent test suite, just a pre-ship gate.
4. Only then wire the new verb/tense into the UI or insert content that
   depends on it.

This same pattern applies to anything with a "correct answer" a learner
will be graded against — fill-in-blank templates, grammar exercise
`accepted_answers`, etc. Note that a fill-in-blank tense drill's accepted
answer is always computed live from the engine (`conjugate()`) at request
time via `grammarQueue.ts`'s `buildTenseQuestions` — it is never
re-derived or re-verified per exercise, since the verb's conjugation was
already verified once when it entered the `verbs` table. Only genuinely
new irregular forms need a fresh live-conjugator check.

## Content pipeline

Two ways content gets into `vocab_items`/`verbs`/`grammar_exercises`:

1. **Manual, in-conversation (the normal path)**: draft a batch as JSON in
   the scratchpad, dedup-check it against both itself and the live DB,
   then insert:
   ```
   npm run insert:content -- vocab <file.json> --language es|pt|fr
   npm run insert:content -- verbs <file.json> --language es|pt|fr
   npm run insert:grammar-batch -- <file.json>   # bulk, many topics at once
   ```
   `scripts/lib/insert.ts` dedups server-side by exact lemma/infinitive
   match per language and silently skips existing rows — always safe to
   re-run, but still worth pre-checking the draft against a fresh DB pull
   (`SELECT lemma FROM vocab_items WHERE language = ...`) so you're not
   wasting drafting effort re-deriving words already present.

   **Draft on Haiku, verify on the main conversation model**: to avoid
   burning plan usage on high-volume rote drafting, spawn a Haiku-model
   subagent (`Agent` tool, `model: "haiku"`) to produce the candidate
   batch JSON (dedup-checked against the live DB per above). Then review
   that draft yourself in the main conversation — the register/
   naturalness/irregular-verb correctness pass ("the one rule that
   matters most," above) always happens on the good model, only the bulk
   generation step moves to Haiku. Don't skip the review pass just
   because a subagent drafted it.

   **Ground word/verb selection against a real external source before
   drafting, don't ask a model to freely generate "N more not already in
   this list."** That prompt pattern — recall words from memory while
   avoiding an ever-growing exclusion list — is exactly what produced a
   batch of hallucinated non-existent French "verbs" (invented words,
   English words, adjectives/nouns mislabeled as verbs) in one round.
   Instead: pull a real published list (a frequency dictionary, Wiktionary
   frequency lists, RAE, or any reputable "most common N Spanish/
   Portuguese/French verbs" page) via `WebSearch`/`WebFetch`, diff it
   against the live DB to find genuine gaps, and only draft enrichment
   content (translation, example sentence, `verb_type`/part of speech,
   CEFR level) for entries the source actually confirms exist. This makes
   *existence* a looked-up fact instead of a generated one — it doesn't
   replace verifying what gets drafted around a confirmed-real word (that
   still needs the same live-conjugator/naturalness check as always).

   **Grammar exercises specifically** go through an extra mechanical gate
   before the manual review step, since `grammar_exercises` content is a
   recurring high-volume loop rather than one-time seed data (see
   "Grammar exercise generation at scale" below for the full pipeline and
   standing policy around it).
2. **Optional, API-billed pipeline** (`scripts/generate-content.ts`,
   `npm run generate:vocab|verbs|grammar`): calls the Anthropic API
   directly with your own key, 3 independent fresh-context critic passes,
   only unanimous-pass candidates get inserted as `verified: true`. Billed
   separately from any Claude subscription — the manual path above is the
   default; this exists for when you want unattended volume without a
   live conversation. `MEXICAN_SPANISH_BRIEF` in that file is the
   canonical one-line register statement — keep it in sync with the rule
   above if the register policy ever changes.

**Vocab content-word rule**: prioritize nouns, adjectives, adverbs — avoid
articles/pronouns/conjunctions (function words) as standalone vocab items,
they don't test well as flashcards.

**Frequency grounding**: `frequency_rank` (nullable int, lower = more
common) is populated from real corpus data (e.g. the
`hermitdave/FrequencyWords` OpenSubtitles-derived lists) where available,
not from guessed "common-sense" frequency. `reviewQueue.ts`'s
`{type: "frequency"}` review mode sorts `due_at` first, then
`frequency_rank` as tiebreaker.

### Current content volume (rough — check DB for live counts)

Target: **1000 verbs / 4000 vocab per language**, **300 exercises per
grammar topic** (raised from the original 200+/topic target once the
grammar-exercise pipeline below made higher volume tractable) — an
explicit, large, long-term goal being approached incrementally, batch by
batch, across many conversations. Don't expect to finish it in one
sitting; each round is ~50–90 new verbs or vocab words per language (see
"Grammar exercise generation at scale" below for the exercise-specific
round size). As of the last count:

| Language | Verbs | Vocab | Grammar topics | Grammar exercises |
|---|---|---|---|---|
| es | 569 | 1004 | 26 | 432+ (growing — see below) |
| pt | 210 | 484 | 14 | 154 |
| fr | 226 | 482 | 14 | 168 |

Grammar exercises per topic are still well short of the 1000/topic target
for every topic in every language — that's the ongoing content push.

**Sequencing policy**: when asked for more verb/vocab/exercise content
with no language specified, **prioritize Spanish** until it hits the
1000/4000/300-per-topic targets — Spanish is the primary-focus language
per this project's stated purpose, and finishing it first is more useful
than spreading effort thin across all three. Once Spanish hits target,
Portuguese and French get **equal** priority with each other. (Porting the
grammar-exercise pipeline itself to pt/fr is tracked as a discrete task in
PLAN.md, to be done before volume work shifts to those languages.)

**This sequencing is always subordinate to the top rule of this file**
(*correctness above velocity* — see the very first section). Never rush
Spanish content to hit these numbers faster at the cost of verification
rigor. A wrong answer shown to the learner is worse than a slower content
round — if a batch can't clear the verification discipline below, ship
less, not wrong.

## Grammar exercise generation at scale (1000/topic target)

`grammar_exercises` content is the one part of the content pipeline that's
both genuinely author-required (each item needs a real correctness/
naturalness judgment, unlike tense-drill fill-blanks which are computed
live from the already-verified conjugation engine — see "Verification
discipline" above) and a recurring high-volume loop rather than one-time
seed data. The pipeline:

1. **Draft** a batch (web app or Haiku subagent — draft/verify split
   applies here same as vocab/verbs above).
2. **`npm run lint:grammar-batch -- <file.json>`** — runs before anything
   reaches manual review, catches mechanical issues for free: multi-blank
   prompts, Spain-register words (`vosotros`, etc. — see the register
   blocklist note below), duplicate prompts (both within the batch and
   against the live DB), empty/malformed `accepted_answers`, invalid CEFR
   levels, and unknown topic slugs.
3. **Full manual review** of every item that passes lint — 100% coverage
   is the default (see the review-scaling note below for when that
   changes).
4. **`npm run insert:grammar-batch -- <file.json>`** to insert the
   reviewed batch.
5. **`npm run dump:db-snapshot -- <output.md>`** to refresh the
   dedup-reference file for the next round.

Standing policy for this pipeline as topics scale toward 1000/topic —
apply each item as the need actually appears, don't front-load all of it
before it's needed:

- **When to stop full-reading every item.** 100% manual review stays the
  default until a topic's review time is actually the bottleneck in a
  session — not before. When it is, switch that topic to: full read on a
  random ~15% sample of the batch (catches systemic drift, e.g. a whole
  batch sliding off-register) + full read on anything
  `lint:grammar-batch` flagged + full read on anything the drafting pass
  itself flagged as low-confidence. Don't switch a topic to sampled review
  until full review has run clean on a few of its batches first — trust is
  earned per topic, not assumed project-wide.
- **Lint catches structure, not logic — track the gap.**
  `lint:grammar-batch` is mechanical (format, dupes, register blocklist).
  It cannot catch a well-formed item where the *grammar logic* is wrong —
  e.g. a `por_para` sentence where either answer would actually work, or a
  `hay_vs_estar` item where new-vs-known is genuinely ambiguous. That
  class only surfaces in manual review. When review catches a logic
  error, note it — if logic errors are rare for a topic, that topic's
  review cadence can loosen; if they're common, that topic needs tighter
  drafting instructions before its review cadence loosens.
- **The register blocklist is a living list, not a one-time setup.** Every
  time manual review catches a new Spain-register word, filler, or
  off-register phrasing lint didn't catch, add it to the blocklist in the
  same session — don't let it slide as a one-off manual fix.
- **Batch/round sizing**: target ~100 exercises per topic per round —
  large enough to be efficient, small enough that a bad round doesn't cost
  hundreds of items. Revisit this number once a few rounds have actually
  run at 100 — if review or lint-fix time balloons at that size, shrink
  it; if it stays comfortable, leave it as-is.

See `PLAN.md` for the two discrete build tasks that extend this pipeline —
porting `lint:grammar-batch`'s register blocklist and dedup logic to
Portuguese and French, and shape-template-assisted drafting for
structurally-repeatable topics (`possessives`, `demonstratives`,
`hay_vs_estar`, etc.) — each with its own done-when criteria; they
graduate into a one-line mention here (like the conjugation-engines table
above) once built, rather than staying as open plan items.

## Language of explanations

Grammar topic `explanationMd` content (`src/lib/grammarTopics*.seed.ts`)
is written in **English** with target-language examples inline — this is
the intended pattern for a learner who doesn't yet read the target
language. **Known inconsistency**: the Portuguese topics *other than*
`intro_pt` (`pronomes_pessoais_pt`, `ser_estar_pt`, `genero_numero_pt`,
`por_para_pt`, `preterito_imperfeito_pt`, `pronomes_objeto_pt`) are
currently written in Portuguese prose, not English, unlike every Spanish
and French topic. This hasn't been fixed yet — flag it if you're asked to
touch those files, but don't silently rewrite them without being asked,
it's a real scope decision (six topics' worth of rewriting).

Grammar topic seed files are the source of truth; after editing one, re-run:
```
npm run seed:grammar-topics
```
(idempotent upsert on `slug`, safe to re-run any time.)

## Grammar module architecture

- `src/lib/grammarQueue.ts` — fetches eligible verbs per language/tense,
  builds `TenseQuestion[]` (conjugation drill questions) and topic cloze
  questions, dispatches to the right engine by `language`.
- Verbos tense practice (`src/app/grammar/verbs/[tense]/page.tsx`) has
  three modes: **Practice** (flashcard-style prompt→type the conjugated
  form), **Fill blank** (the same underlying question wrapped in a short
  natural carrier sentence via `fillBlankTemplates.ts` — no per-verb
  sentence authoring, a fixed prefix/suffix template per tense reused for
  every verb, which is what makes this tractable at scale), and **Test**.
- Grammar topic pages and the full grammar test both use the shared
  `ExerciseCard` component (`src/components/ExerciseCard.tsx`) — a single
  `<input type="text">` graded against `accepted_answers` via
  `isCorrectAnswer()`. This is a plain, unblocked text input on purpose:
  iPadOS Safari's Scribble already converts Apple Pencil handwriting to
  text in any standard text field (including installed PWAs) with zero
  app code — don't build a custom ink-canvas-to-text pipeline for graded
  answers unless Scribble is verified insufficient on-device first.

## SRS algorithm

`src/lib/srs.ts` — SM-2 variant, 0–5 grading (0–2 = forgot/reset, 3 =
effortful recall, 4–5 = easy), same shape as Anki. There is no "I already
know this" shortcut — every item's interval is earned purely through the
normal grade progression, by design (removed the old `masterItem()`
bypass so mastery-bucket stats on the dashboard reflect real review
history, not shortcut jumps). The género drill (`/grammar/gender`,
`src/lib/genderQueue.ts`) reuses this same engine against
`gender_srs_state` instead of self-reported 0-5 grades — its choice
buttons are auto-graded (correct → 4, incorrect → 1) since there's no
reveal-then-self-assess step in a binary el/la quiz.

## TTS

`src/lib/tts.ts` — browser-native Web Speech API, no external service/key.
Language-aware: picks a BCP-47 locale per language (`es-MX`, `pt-BR`,
`fr-FR`, matching the register the content is written in) and prefers
higher-quality voices (`Google`/`Natural`/`Neural`/`Online` in the name,
or non-`localService`) when the platform offers more than one voice for
that locale. Rate is set slightly below 1 (`0.92`) for clarity. All speech
in the app funnels through `<SpeakButton text={...} />`
(`src/components/SpeakButton.tsx`), which reads the active language from
`useLanguage()` itself — call sites never need to pass a language prop.

## Diario (handwriting journal)

`src/components/HandwritingCanvas.tsx` — a controlled `<canvas>` with
React Pointer Events, storing **vector strokes**
(`{x, y, pressure}[][]`), not raster. Pressure-sensitive line width for
real Apple Pencil input, falls back to constant width for mouse/trackpad
(`pressure` reads 0). `undo()`/`clear()` via ref handle. No OCR/handwriting
recognition anywhere in this codebase — Diario is free-form ink, not
graded, so it doesn't need any.

## Key routes

`/` dashboard (CEFR badge, streaks, language switcher) · `/vocab` SRS
review · `/grammar` topic list + `/grammar/[topicSlug]` + `/grammar/test`
+ `/grammar/verbs/[tense]` · `/glossary` searchable reference · `/diary`
handwriting journal. All wrapped in `AuthGate` (`src/components/AuthGate.tsx`).

## Commands

```
npm run dev                              # local dev server
npm run build                            # type-check + production build — run after any lib/schema change
npm run seed:grammar-topics              # re-seed topic list after editing a *.seed.ts file
npm run insert:content -- vocab|verbs <file.json> --language es|pt|fr
npm run insert:grammar-batch -- <file.json>
npm run lint:grammar-batch -- <file.json>   # run before insert:grammar-batch — see "Grammar exercise generation at scale"
npm run dump:db-snapshot -- <output.md>     # refresh dedup-reference file after inserting a grammar batch
```

## Working style for this project

- The user has given standing permission to act autonomously on routine
  execution (content batches, terminal commands, dedup checks, builds) —
  only surface genuine strategy forks (architecture choices, new paid
  dependencies, ambiguous scope) as questions, don't ask permission for
  routine steps.
- Content-volume work is a long-running grind, not a one-shot task —
  pick up wherever the last round left off (check current DB counts
  first), keep batches internally deduped and cross-checked against the
  live DB, and always leave `npm run build` green before ending a round.
- Prefer small, verifiable rounds over large unverified ones, especially
  for anything touching a conjugation engine or irregular-verb table.