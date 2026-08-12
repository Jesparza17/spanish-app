-- Grammar module + content pipeline support.
-- Run this in the Supabase SQL editor after schema.sql, same as before.

-- Grammar topics: the "Gramática" side of the module (ser vs estar, por vs
-- para, etc). Explanations are seeded once by hand, not by the recurring
-- content pipeline — see src/lib/grammarTopics.seed.ts.
create table grammar_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  explanation_md text not null,
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Practice items for both halves of the module. topic_id is set for a
-- Gramática cloze exercise; tense/verb_id/person are set for a Verbos
-- conjugation drill. Conjugation drills store accepted_answers as a cache
-- of what src/lib/conjugation.ts computes at generation time, so grading
-- never has to trust an LLM for something with one correct answer.
create table grammar_exercises (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references grammar_topics(id) on delete cascade,
  tense text,
  verb_id uuid references verbs(id) on delete cascade,
  person text,
  prompt text not null,
  accepted_answers text[] not null,
  explanation text,
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  constraint exercise_kind check (
    (topic_id is not null and tense is null and verb_id is null and person is null) or
    (topic_id is null and tense is not null and verb_id is not null and person is not null)
  )
);

create index grammar_exercises_topic_idx on grammar_exercises (topic_id) where topic_id is not null;
create index grammar_exercises_tense_idx on grammar_exercises (tense, verb_id) where tense is not null;

-- Per-user progress, scoped to either a tense (Verbos) or a topic
-- (Gramática) — mirrors how srs_state unifies vocab/verbs with mutually
-- exclusive columns, but here both scopes share the same shape so one
-- table with a discriminator is simpler than two near-identical tables.
create table grammar_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope_type text not null check (scope_type in ('tense', 'topic')),
  scope_key text not null,
  correct_count integer not null default 0,
  attempt_count integer not null default 0,
  best_test_score real,
  last_practiced_at timestamptz,
  unique (user_id, scope_type, scope_key)
);

alter table grammar_topics enable row level security;
create policy "read grammar topics" on grammar_topics for select using (true);

alter table grammar_exercises enable row level security;
create policy "read grammar exercises" on grammar_exercises for select using (true);

alter table grammar_progress enable row level security;
create policy "own grammar progress" on grammar_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
