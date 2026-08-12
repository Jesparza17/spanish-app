import { supabase } from "./supabaseClient";

// Nothing reads this yet — it exists purely so a future streak/history
// feature has real data from this point forward instead of starting from
// zero whenever it gets built. Best-effort: never blocks the action it's
// logging.
export type ReviewEventType = "srs_grade" | "topic_attempt" | "tense_test" | "topic_test" | "combined_test";

export async function logReviewEvent(userId: string, eventType: ReviewEventType) {
  const { error } = await supabase.from("review_log").insert({ user_id: userId, event_type: eventType });
  if (error) console.error("review_log insert failed:", error.message);
}
