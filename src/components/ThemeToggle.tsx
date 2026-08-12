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
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1 font-sans text-xs transition-colors ${
          selectedThemeId === null ? "bg-ink text-white" : "bg-white/60 text-ink/60 border border-line"
        }`}
      >
        Frequency order
      </button>
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onSelect(theme.id)}
          className={`rounded-full px-3 py-1 font-sans text-xs transition-colors ${
            selectedThemeId === theme.id ? "bg-marigold text-white" : "bg-white/60 text-ink/60 border border-line"
          }`}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
}
