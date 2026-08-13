-- Retest scheduling for grammar/verb tests — an Anki-like graduating interval
-- per (user, scope_type, scope_key) row, so a passed test gets nudged for
-- retest on a growing schedule and a failed one resets to "tomorrow".
-- Mastery tier (bronze/silver/gold) is derived from interval_days at read
-- time, not stored — see masteryTierFromInterval in src/lib/grammarQueue.ts.
alter table grammar_progress
  add column if not exists interval_days integer not null default 0,
  add column if not exists next_due_at timestamptz,
  add column if not exists last_test_score real;
