"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import MasteryTierBadge from "@/components/MasteryTierBadge";
import { fetchStudyPlan, type StudyPlan } from "@/lib/studyPlan";
import { useLanguage } from "@/lib/language";

const HORIZONS: { value: 0 | 7; label: string }[] = [
  { value: 0, label: "Today" },
  { value: 7, label: "This week" },
];

function PlanHome({ user }: { user: User }) {
  const { language } = useLanguage();
  const [horizonDays, setHorizonDays] = useState<0 | 7>(0);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchStudyPlan(user.id, language, horizonDays)
      .then(setPlan)
      .finally(() => setLoading(false));
  }, [user.id, language, horizonDays]);

  const nothingToDo =
    plan && plan.dueReviewCount === 0 && plan.strugglingCount === 0 && plan.newAvailableCount === 0 && plan.dueTests.length === 0;

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Cuaderno</p>
          <h1 className="font-display text-3xl text-white">Study plan</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6 space-y-5 pb-10">
        <div className="flex gap-2">
          {HORIZONS.map((h) => (
            <button
              key={h.value}
              onClick={() => setHorizonDays(h.value)}
              className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
                horizonDays === h.value ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        {loading || !plan ? (
          <p className="font-sans text-sm text-ink/50">Loading…</p>
        ) : nothingToDo ? (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">All caught up — nothing due, new, or struggling right now.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Link
                href="/vocab"
                className="flex items-center justify-between rounded-2xl bg-card shadow-card px-5 py-4 active:scale-[0.98] transition-transform"
              >
                <span className="font-display text-base text-ink">Due reviews</span>
                <span className="font-sans text-xs font-medium text-agave-dark bg-agave-light rounded-full px-2.5 py-1 shrink-0">
                  {plan.dueReviewCount}
                </span>
              </Link>

              <Link
                href="/vocab?status=struggling"
                className="flex items-center justify-between rounded-2xl bg-card shadow-card px-5 py-4 active:scale-[0.98] transition-transform"
              >
                <span className="font-display text-base text-ink">Struggling</span>
                <span className="font-sans text-xs font-medium text-marigold-dark bg-marigold-light rounded-full px-2.5 py-1 shrink-0">
                  {plan.strugglingCount}
                </span>
              </Link>

              <Link
                href="/vocab?status=new"
                className="flex items-center justify-between rounded-2xl bg-card shadow-card px-5 py-4 active:scale-[0.98] transition-transform"
              >
                <span>
                  <span className="block font-display text-base text-ink">New</span>
                  {horizonDays === 0 && plan.newRecommendedCount < plan.newAvailableCount && (
                    <span className="block font-sans text-xs text-ink/40 mt-0.5">
                      {plan.newRecommendedCount} recommended today · {plan.newAvailableCount} available
                    </span>
                  )}
                </span>
                <span className="font-sans text-xs font-medium text-agave-dark bg-agave-light rounded-full px-2.5 py-1 shrink-0">
                  {horizonDays === 0 ? plan.newRecommendedCount : plan.newAvailableCount}
                </span>
              </Link>
            </div>

            {plan.dueTests.length > 0 && (
              <div>
                <p className="font-sans text-xs text-ink/40 uppercase tracking-wide mb-2 px-1">Tests ready for retest</p>
                <div className="flex flex-col gap-2">
                  {plan.dueTests.map((t) => (
                    <Link
                      key={`${t.kind}-${t.href}`}
                      href={t.href}
                      className="flex items-center justify-between rounded-2xl bg-ink px-5 py-4 active:scale-[0.98] transition-transform"
                    >
                      <span className="font-display text-base text-white">{t.label}</span>
                      <MasteryTierBadge tier={t.tier} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function PlanPage() {
  return <AuthGate>{(user) => <PlanHome user={user} />}</AuthGate>;
}
