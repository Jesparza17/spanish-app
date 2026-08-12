"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import ReviewCard from "@/components/ReviewCard";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabaseClient";
import { fetchDueQueue, submitGrade } from "@/lib/reviewQueue";
import { nextReview } from "@/lib/srs";
import type { ReviewCard as ReviewCardData, Theme, SrsRow } from "@/lib/types";

function ReviewSession({ user }: { user: User }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [queue, setQueue] = useState<ReviewCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("themes")
      .select("id, name, description")
      .then(({ data }) => setThemes(data ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const mode = selectedThemeId ? ({ type: "theme", themeId: selectedThemeId } as const) : ({ type: "frequency" } as const);
    fetchDueQueue(user.id, "both", mode)
      .then(setQueue)
      .finally(() => setLoading(false));
  }, [user.id, selectedThemeId]);

  async function handleGrade(grade: number) {
    const card = queue[0];
    if (!card) return;

    // Look up the item's current SRS row to compute the next interval.
    const { data: row } = await supabase
      .from("srs_state")
      .select("ease_factor, interval_days, repetitions")
      .eq("id", card.srsId)
      .single<Pick<SrsRow, "ease_factor" | "interval_days" | "repetitions">>();

    if (row) {
      const result = nextReview(
        { easeFactor: row.ease_factor, intervalDays: row.interval_days, repetitions: row.repetitions },
        grade
      );
      await submitGrade(card.srsId, result.easeFactor, result.intervalDays, result.repetitions, result.dueAt);
    }

    setQueue((q) => q.slice(1));
  }

  return (
    <main className="max-w-md mx-auto px-6 py-12">
      <p className="font-sans text-sm tracking-wide text-agave uppercase mb-2">Review</p>
      <h1 className="font-display text-3xl text-ink mb-6">
        {queue.length > 0 ? `${queue.length} due` : "All caught up"}
      </h1>

      <ThemeToggle themes={themes} selectedThemeId={selectedThemeId} onSelect={setSelectedThemeId} />

      {loading ? (
        <p className="font-sans text-sm text-ink/50">Loading…</p>
      ) : queue.length > 0 ? (
        <ReviewCard card={queue[0]} onGrade={handleGrade} />
      ) : (
        <p className="font-sans text-sm text-ink/60">
          Nothing due right now in this mode — check back later or switch modes above.
        </p>
      )}
    </main>
  );
}

export default function VocabPage() {
  return <AuthGate>{(user) => <ReviewSession user={user} />}</AuthGate>;
}
