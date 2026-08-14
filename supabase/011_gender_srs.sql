-- Per-user, per-noun spaced-repetition state for the género (gender) drill.
-- Kept separate from srs_state since gender mastery and vocab-meaning
-- mastery are independent skills for the same word (a learner can know
-- "mesa" means "table" but still blank on el/la, or vice versa) — reusing
-- srs_state's one-row-per-(user, vocab_item) constraint would conflate them.
--
-- Lazily enrolled: a noun only gets a row here once the user has answered it
-- for the first time. Until then the gender queue treats it as "new" (always
-- due), same effective behavior as srs_state's due_at-defaults-to-now for a
-- freshly enrolled row, without needing an eager backfill/enrollment step.
create table gender_srs_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vocab_item_id uuid not null references vocab_items(id) on delete cascade,
  ease_factor real not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, vocab_item_id)
);

create index gender_srs_state_due_idx on gender_srs_state (user_id, due_at);

alter table gender_srs_state enable row level security;
create policy "own gender srs state" on gender_srs_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
