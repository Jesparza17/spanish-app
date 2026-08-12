-- Diario: Apple Pencil handwriting journal. Strokes are stored as vector
-- data (array of {x,y,pressure} points per stroke), not a raster image —
-- resizable, and stays usable if a future round adds handwriting analysis.
-- Not hooked up to any AI grading yet; this just captures and displays.

create table diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  strokes jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diary_entries_user_date_idx on diary_entries (user_id, created_at desc);

alter table diary_entries enable row level security;
drop policy if exists "own diary entries" on diary_entries;
create policy "own diary entries" on diary_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;

notify pgrst, 'reload schema';
