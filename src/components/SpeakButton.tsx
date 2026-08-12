"use client";

import { Volume2 } from "lucide-react";
import { speak } from "@/lib/tts";

export default function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      aria-label="Escuchar"
      className={`inline-flex items-center justify-center text-ink/40 active:text-marigold-dark transition-colors ${className}`}
    >
      <Volume2 size={18} strokeWidth={1.8} />
    </button>
  );
}
