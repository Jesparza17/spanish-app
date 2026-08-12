"use client";

import { useState } from "react";
import type { ReviewCard as ReviewCardData } from "@/lib/types";

const GRADES = [
  { label: "Again", value: 1, className: "bg-ink/10 text-ink hover:bg-ink/20" },
  { label: "Hard", value: 3, className: "bg-marigold/20 text-marigold-dark hover:bg-marigold/30" },
  { label: "Good", value: 4, className: "bg-agave/15 text-agave-dark hover:bg-agave/25" },
  { label: "Easy", value: 5, className: "bg-agave text-white hover:bg-agave-dark" },
];

export default function ReviewCard({
  card,
  onGrade,
}: {
  card: ReviewCardData;
  onGrade: (grade: number) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl border border-line bg-white/70 shadow-sm px-6 py-10 text-center">
      <span className="inline-block font-sans text-xs tracking-wide uppercase text-agave-dark bg-agave/10 rounded-full px-2 py-0.5 mb-6">
        {card.cefrLevel} · {card.kind}
      </span>

      <p className="font-display text-3xl text-ink mb-1">{card.front}</p>

      {revealed ? (
        <div className="mt-6 space-y-4">
          <p className="font-sans text-lg text-ink/80">{card.translation}</p>
          <div className="border-t border-dashed border-line pt-4">
            <p className="font-sans italic text-ink/70">{card.example}</p>
            <p className="font-sans text-sm text-ink/50 mt-1">{card.exampleTranslation}</p>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-4">
            {GRADES.map((g) => (
              <button
                key={g.value}
                onClick={() => {
                  onGrade(g.value);
                  setRevealed(false);
                }}
                className={`rounded-md py-2 font-sans text-sm transition-colors ${g.className}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="mt-6 rounded-md border border-line px-5 py-2 font-sans text-sm text-ink/70 hover:border-marigold hover:text-marigold-dark transition-colors"
        >
          Show answer
        </button>
      )}
    </div>
  );
}
