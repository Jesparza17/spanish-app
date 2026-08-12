-- One-time fix: schema.sql's tables (themes, vocab_items, verbs, and their
-- join/state tables) never received Supabase's standard role grants, which
-- is why the service role gets "permission denied" (42501) on them even
-- though RLS policies look correct — RLS is checked *after* the table-level
-- GRANT, and that grant was missing. The 002 migration's tables didn't have
-- this problem, which is how this got noticed.
--
-- Run this once in the Supabase SQL editor. Also re-applies the standard
-- default-privilege grants so any future table created the same way as
-- schema.sql's won't hit this again.

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;
grant all privileges on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
