-- Widen grammar_progress.scope_type to allow a "tense_group" row —
-- aggregate progress for a broader Verbos grouping ("all past tenses",
-- etc.), separate from any single member tense's own "tense" row, mirroring
-- how "combined" is already a distinct aggregate scope from per-topic rows.
alter table grammar_progress drop constraint if exists grammar_progress_scope_type_check;
alter table grammar_progress add constraint grammar_progress_scope_type_check
  check (scope_type in ('tense', 'topic', 'combined', 'tense_group'));

-- review_log.event_type needs the matching new value too (recordTenseGroupTestResult logs "tense_group_test").
alter table review_log drop constraint if exists review_log_event_type_check;
alter table review_log add constraint review_log_event_type_check
  check (event_type in ('srs_grade', 'topic_attempt', 'tense_test', 'tense_group_test', 'topic_test', 'combined_test'));
