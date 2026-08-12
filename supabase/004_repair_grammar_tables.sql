-- Repairs the grammar module tables regardless of why they're not showing
-- up (PostgREST returns "Could not find the table ... in the schema cache"
-- for grammar_topics/grammar_exercises/grammar_progress right now — either
-- 002_grammar_pipeline.sql didn't fully apply, or PostgREST's schema cache
-- just hasn't picked it up). Every statement here is idempotent, so it's
-- safe to run whether or not 002 already succeeded.

create table if not exists grammar_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  explanation_md text not null,
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists grammar_exercises (
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

create index if not exists grammar_exercises_topic_idx on grammar_exercises (topic_id) where topic_id is not null;
create index if not exists grammar_exercises_tense_idx on grammar_exercises (tense, verb_id) where tense is not null;

create table if not exists grammar_progress (
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
drop policy if exists "read grammar topics" on grammar_topics;
create policy "read grammar topics" on grammar_topics for select using (true);

alter table grammar_exercises enable row level security;
drop policy if exists "read grammar exercises" on grammar_exercises;
create policy "read grammar exercises" on grammar_exercises for select using (true);

alter table grammar_progress enable row level security;
drop policy if exists "own grammar progress" on grammar_progress;
create policy "own grammar progress" on grammar_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;

-- Forces PostgREST to pick up the change immediately instead of waiting
-- for its next periodic reload.
notify pgrst, 'reload schema';
