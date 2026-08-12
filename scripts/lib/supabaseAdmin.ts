// Service-role Supabase client for the content pipeline. Only ever imported
// from scripts/ — never from src/ — so the service role key can't leak into
// the browser bundle. Bypasses RLS, which is required to write to
// vocab_items/verbs/grammar_topics/grammar_exercises (public-read,
// service-role-write) and to enroll srs_state rows on the user's behalf.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local — the pipeline needs the service role key (Project settings → API) to write reference content, distinct from the anon key the app uses."
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
