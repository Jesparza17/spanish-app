-- Widens grammar_progress to support a combined (all-topics) test score,
-- and adds a lightweight review-event log so a future streak/history
-- feature has data to work with from this point forward. Nothing reads
-- review_log yet — this just starts capturing.

alter table grammar_progress drop constraint if exists grammar_progress_scope_type_check;
alter table grammar_progress add constraint grammar_progress_scope_type_check
  check (scope_type in ('tense', 'topic', 'combined'));

create table if not exists review_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('srs_grade', 'topic_attempt', 'tense_test', 'topic_test', 'combined_test')),
  created_at timestamptz not null default now()
);

create index if not exists review_log_user_date_idx on review_log (user_id, created_at);

alter table review_log enable row level security;
drop policy if exists "own review log" on review_log;
create policy "own review log" on review_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;

notify pgrst, 'reload schema';
