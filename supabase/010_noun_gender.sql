-- Grammatical gender for nouns, used by the new gender-practice drill.
-- Nullable and binary (m/f) — the rare genuinely epicene/invariant noun
-- just stays null and is naturally excluded from the drill's pool.
alter table vocab_items add column if not exists gender text check (gender in ('m', 'f'));
