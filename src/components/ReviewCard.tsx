"use client";

import { useState } from "react";
import SpeakButton from "@/components/SpeakButton";
import type { ReviewCard as ReviewCardData } from "@/lib/types";

const GRADES = [
  { label: "Again", value: 1, className: "bg-ink/8 text-ink/70 active:bg-ink/15" },
  { label: "Hard", value: 3, className: "bg-marigold-light text-marigold-dark active:bg-marigold/40" },
  { label: "Good", value: 4, className: "bg-agave-light text-agave-dark active:bg-agave/30" },
  { label: "Easy", value: 5, className: "bg-agave text-white active:bg-agave-dark" },
];

export default function ReviewCard({
  card,
  onGrade,
  onMastered,
}: {
  card: ReviewCardData;
  onGrade: (grade: number) => void;
  onMastered: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-2xl bg-card shadow-floating px-6 py-10 text-center">
      <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-medium tracking-wide uppercase text-agave-dark bg-agave-light rounded-full px-2.5 py-1 mb-7">
        {card.cefrLevel}
        <span className="w-1 h-1 rounded-full bg-agave-dark/50" />
        {card.kind === "vocab" ? "vocab" : "verb"}
      </span>

      <div className="flex items-center justify-center gap-2 mb-1">
        <p className="font-display text-4xl text-ink">{card.front}</p>
        <SpeakButton text={card.front} />
      </div>

      {revealed ? (
        <div className="mt-7 space-y-5 animate-[fadeIn_0.15s_ease-out]">
          <p className="font-sans text-lg text-ink/75">{card.translation}</p>
          <div className="border-t border-line pt-5">
            <div className="flex items-start justify-center gap-2">
              <p className="font-display italic text-[17px] text-ink/80 leading-snug">{card.example}</p>
              <SpeakButton text={card.example} className="mt-1 shrink-0" />
            </div>
            <p className="font-sans text-sm text-ink/45 mt-1.5">{card.exampleTranslation}</p>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3">
            {GRADES.map((g) => (
              <button
                key={g.value}
                onClick={() => {
                  onGrade(g.value);
                  setRevealed(false);
                }}
                className={`rounded-xl py-3 font-sans text-sm font-medium transition-colors ${g.className}`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              onMastered();
              setRevealed(false);
            }}
            className="w-full pt-1 font-sans text-xs text-ink/40 underline decoration-dotted underline-offset-4 active:text-ink/60 transition-colors"
          >
            I know this 100% — show it rarely
          </button>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="mt-8 rounded-full bg-ink text-white px-6 py-3 font-sans text-sm font-medium active:scale-[0.97] transition-transform"
        >
          Show answer
        </button>
      )}
    </div>
  );
}
