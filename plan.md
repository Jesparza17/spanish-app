# Plan: grammar-exercise pipeline build tasks

Discrete work items, not standing policy — check off and delete each
section once built; the resulting capability gets a one-line mention in
CLAUDE.md instead (same pattern as the existing "three independent
conjugation engines" section there).

## 1. Port lint/dedup pipeline to Portuguese and French

**Why:** `lint:grammar-batch`'s register blocklist and dedup logic are
Spanish-only. Needs to exist before grammar-exercise volume work shifts to
`pt`/`fr`, per the existing Spanish-first sequencing policy in CLAUDE.md.

**Scope:**
- [ ] Add a Brazilian-Portuguese register blocklist to
      `lint:grammar-batch` — start empty/minimal, do not copy the Spanish
      list (register traps are language-specific: e.g. `tu` usage,
      European-Portuguese vocabulary/spelling that doesn't match Brazilian
      register).
- [ ] Add a Metropolitan-French register blocklist the same way — start
      empty/minimal, populate as review catches things.
- [ ] Point dedup logic (in-batch and against-DB) at the correct
      `language` filter (`pt`/`fr`) instead of assuming `es`.
- [ ] Verify `dump:db-snapshot` also filters/labels by language correctly
      once pt/fr exercises exist, so the dedup-reference file doesn't mix
      languages.
- [ ] Run one real batch through the ported pipeline per language as a
      smoke test before treating it as production-ready.

**Done when:** a `pt` or `fr` batch can go through
draft → lint → review → insert → snapshot with the same guarantees the
Spanish pipeline has today.

## 2. Shape templates for structurally-repeatable topics

**Why:** Topics like `possessives`, `demonstratives`, `hay_vs_estar` have
a small number of repeatable sentence shapes. Giving the drafting pass
templates to vary vocabulary/scenario within — instead of freewheeling
fully original sentences every time — should reduce how often drafted
items fail lint or need a review fix, the same way
`fillBlankTemplates.ts` already works for conjugation prompts.

**Scope:**
- [ ] Pick the first topic to pilot on (suggest `hay_vs_estar` — clear
      binary logic, easy to sanity-check template output against).
- [ ] Write 8-10 sentence-shape templates for it, covering its full rule
      space (per CLAUDE.md's explanation of the topic) — not just the
      easy cases.
- [ ] Draft one batch using the templates, run it through the existing
      pipeline, and compare its lint-failure/review-fix rate against a
      recent freewheeled batch for the same topic.
- [ ] If it measurably reduces fix rate, write templates for the other
      structurally-repeatable topics (`possessives`, `demonstratives`,
      and any others that fit the same pattern) and fold "give the
      drafting pass shape templates when a topic has one" into the
      standing content-pipeline instructions in CLAUDE.md.
- [ ] If it doesn't measurably help, drop the approach and remove this
      section without further build-out.

**Done when:** either templates are in place for all structurally-
repeatable topics and noted in CLAUDE.md, or the approach is explicitly
ruled out based on the pilot's results.