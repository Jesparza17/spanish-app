"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import ReviewCard from "@/components/ReviewCard";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabaseClient";
import { fetchDueQueue, submitGrade } from "@/lib/reviewQueue";
import { masterItem, nextReview } from "@/lib/srs";
import { useLanguage } from "@/lib/language";
import type { ReviewCard as ReviewCardData, Theme, SrsRow } from "@/lib/types";

const ITEM_KINDS: { value: "both" | "vocab" | "verb"; label: string }[] = [
  { value: "both", label: "Mixto" },
  { value: "vocab", label: "Vocab" },
  { value: "verb", label: "Verbos" },
];

function ReviewSession({ user }: { user: User }) {
  const { language } = useLanguage();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [itemKind, setItemKind] = useState<"both" | "vocab" | "verb">("both");
  const [queue, setQueue] = useState<ReviewCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedThemeId(null); // theme IDs don't carry across languages
    supabase
      .from("themes")
      .select("id, name, description")
      .eq("language", language)
      .then(({ data }) => setThemes(data ?? []));
  }, [language]);

  useEffect(() => {
    setLoading(true);
    const mode = selectedThemeId ? ({ type: "theme", themeId: selectedThemeId } as const) : ({ type: "frequency" } as const);
    fetchDueQueue(user.id, itemKind, mode, language)
      .then(setQueue)
      .finally(() => setLoading(false));
  }, [user.id, selectedThemeId, itemKind, language]);

  async function fetchSrsState(srsId: string) {
    const { data: row } = await supabase
      .from("srs_state")
      .select("ease_factor, interval_days, repetitions")
      .eq("id", srsId)
      .single<Pick<SrsRow, "ease_factor" | "interval_days" | "repetitions">>();
    if (!row) return null;
    return { easeFactor: row.ease_factor, intervalDays: row.interval_days, repetitions: row.repetitions };
  }

  async function handleGrade(grade: number) {
    const card = queue[0];
    if (!card) return;

    const state = await fetchSrsState(card.srsId);
    if (state) {
      const result = nextReview(state, grade);
      await submitGrade(card.srsId, result.easeFactor, result.intervalDays, result.repetitions, result.dueAt, user.id);
    }

    setQueue((q) => q.slice(1));
  }

  async function handleMastered() {
    const card = queue[0];
    if (!card) return;

    const state = await fetchSrsState(card.srsId);
    if (state) {
      const result = masterItem(state);
      await submitGrade(card.srsId, result.easeFactor, result.intervalDays, result.repetitions, result.dueAt, user.id);
    }

    setQueue((q) => q.slice(1));
  }

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Review</p>
          <h1 className="font-display text-3xl text-white">
            {queue.length > 0 ? `${queue.length} due` : "All caught up"}
          </h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6">
        <div className="flex gap-2 mb-4">
          {ITEM_KINDS.map((k) => (
            <button
              key={k.value}
              onClick={() => setItemKind(k.value)}
              className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
                itemKind === k.value ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <ThemeToggle themes={themes} selectedThemeId={selectedThemeId} onSelect={setSelectedThemeId} />

        {loading ? (
          <p className="font-sans text-sm text-ink/50">Loading…</p>
        ) : queue.length > 0 ? (
          <ReviewCard card={queue[0]} onGrade={handleGrade} onMastered={handleMastered} />
        ) : (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">
              Nothing due right now in this mode — check back later or switch modes above.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VocabPage() {
  return <AuthGate>{(user) => <ReviewSession user={user} />}</AuthGate>;
}
