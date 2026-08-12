"use client";

import type { Theme } from "@/lib/types";

export default function ThemeToggle({
  themes,
  selectedThemeId,
  onSelect,
}: {
  themes: Theme[];
  selectedThemeId: string | null; // null = frequency mode
  onSelect: (themeId: string | null) => void;
}) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto -mx-6 px-6 pb-1 no-scrollbar">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors ${
          selectedThemeId === null ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
        }`}
      >
        Frequency order
      </button>
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onSelect(theme.id)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors ${
            selectedThemeId === theme.id ? "bg-marigold text-white" : "bg-card text-ink/55 shadow-card"
          }`}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
}
