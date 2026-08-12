-- Multi-language support. Adds a language dimension to reference content
-- tables so the app can serve Spanish and Portuguese (and later French)
-- content side by side. Existing rows default to 'es', so nothing currently
-- in the app changes behavior. grammar_exercises/vocab_item_themes/
-- verb_themes need no column — they inherit language via their FK.

alter table vocab_items add column if not exists language text not null default 'es'
  check (language in ('es','pt','fr'));
alter table verbs add column if not exists language text not null default 'es'
  check (language in ('es','pt','fr'));
alter table grammar_topics add column if not exists language text not null default 'es'
  check (language in ('es','pt','fr'));
alter table themes add column if not exists language text not null default 'es'
  check (language in ('es','pt','fr'));

create index if not exists vocab_items_language_idx on vocab_items (language);
create index if not exists verbs_language_idx on verbs (language);
create index if not exists grammar_topics_language_idx on grammar_topics (language);

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;

notify pgrst, 'reload schema';
