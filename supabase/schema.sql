-- Spanish learning app — initial schema (vocab + verbs vertical slice)
-- Run this in the Supabase SQL editor for a new project.

create extension if not exists "pgcrypto";

-- Themes: e.g. "el mercado", "la familia", "las emociones"
create table themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- Vocabulary items (nouns, adjectives, adverbs, etc — not verbs, see verbs table)
create table vocab_items (
  id uuid primary key default gen_random_uuid(),
  lemma text not null,                 -- dictionary form, e.g. "mercado"
  translation text not null,           -- e.g. "market"
  part_of_speech text not null,        -- noun, adjective, adverb, etc
  example_sentence text not null,      -- natural, grammatically verified example
  example_translation text not null,
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  frequency_rank integer,              -- from source corpus, lower = more common
  source_note text,                    -- which corpus/resource grounded this item
  verified boolean not null default false, -- passed the generate->verify pipeline
  created_at timestamptz not null default now()
);

create table vocab_item_themes (
  vocab_item_id uuid references vocab_items(id) on delete cascade,
  theme_id uuid references themes(id) on delete cascade,
  primary key (vocab_item_id, theme_id)
);

-- Verbs are modeled separately since they carry conjugation state, not just a translation
create table verbs (
  id uuid primary key default gen_random_uuid(),
  infinitive text not null,            -- e.g. "hablar"
  translation text not null,
  verb_type text not null,             -- regular_ar, regular_er, regular_ir, irregular, stem_changing
  example_sentence text not null,
  example_translation text not null,
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  frequency_rank integer,
  source_note text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table verb_themes (
  verb_id uuid references verbs(id) on delete cascade,
  theme_id uuid references themes(id) on delete cascade,
  primary key (verb_id, theme_id)
);

-- One SRS state row per user per item. vocab_item_id and verb_id are mutually
-- exclusive (exactly one is set) so vocab and verbs share the same scheduling
-- engine without sharing a table.
create table srs_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vocab_item_id uuid references vocab_items(id) on delete cascade,
  verb_id uuid references verbs(id) on delete cascade,
  ease_factor real not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint one_item_type check (
    (vocab_item_id is not null and verb_id is null) or
    (vocab_item_id is null and verb_id is not null)
  ),
  unique (user_id, vocab_item_id),
  unique (user_id, verb_id)
);

create index srs_state_due_idx on srs_state (user_id, due_at);

-- Row-level security: every user only ever sees their own SRS state.
-- vocab_items / verbs / themes are shared reference data — readable by anyone
-- signed in, writable only via the service role (the content pipeline).
alter table srs_state enable row level security;
create policy "own srs state" on srs_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table vocab_items enable row level security;
create policy "read vocab" on vocab_items for select using (true);

alter table verbs enable row level security;
create policy "read verbs" on verbs for select using (true);

alter table themes enable row level security;
create policy "read themes" on themes for select using (true);
