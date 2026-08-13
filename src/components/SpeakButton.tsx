"use client";

import { Volume2 } from "lucide-react";
import { speak } from "@/lib/tts";
import { useLanguage } from "@/lib/language";

export default function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const { language } = useLanguage();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, language);
      }}
      aria-label="Escuchar"
      className={`inline-flex items-center justify-center text-ink/40 active:text-marigold-dark transition-colors ${className}`}
    >
      <Volume2 size={18} strokeWidth={1.8} />
    </button>
  );
}
