// Browser-native text-to-speech (Web Speech API) — no API key, no cost.
// No-ops silently anywhere speechSynthesis isn't available (SSR, unsupported browsers).

import type { Language } from "./language";

// Preferred BCP-47 locale per language, most-specific first — matches the
// register/dialect the app's content is actually written in (Latin American
// Spanish tú/usted/ustedes, Brazilian Portuguese, Metropolitan French).
const LOCALE_PREFERENCE: Record<Language, string[]> = {
  es: ["es-MX", "es-US", "es-419", "es-ES"],
  pt: ["pt-BR", "pt-PT"],
  fr: ["fr-FR", "fr-CA"],
};

const UTTERANCE_LANG: Record<Language, string> = {
  es: "es-MX",
  pt: "pt-BR",
  fr: "fr-FR",
};

const cachedVoices: Partial<Record<Language, SpeechSynthesisVoice>> = {};

// getVoices() can return an empty list on the very first call (voices load
// asynchronously), so only cache a positive match — keep retrying otherwise,
// which is cheap once the browser has actually loaded its voice list.
function pickVoice(language: Language): SpeechSynthesisVoice | null {
  const cached = cachedVoices[language];
  if (cached) return cached;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const candidates = voices.filter((v) => v.lang.toLowerCase().startsWith(language));
  if (candidates.length === 0) return null;

  // Within a locale tier, prefer voices that sound clearer/more natural — a
  // cloud-backed voice (localService: false, common for Chrome's "Google
  // ..." voices) is generally higher quality than the compact on-device
  // voice most platforms ship by default.
  function bestOf(pool: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
    return (
      pool.find((v) => /google|natural|neural|online/i.test(v.name)) ??
      pool.find((v) => !v.localService) ??
      pool[0]
    );
  }

  for (const locale of LOCALE_PREFERENCE[language]) {
    const exact = candidates.filter((v) => v.lang.toLowerCase() === locale.toLowerCase());
    if (exact.length > 0) {
      const picked = bestOf(exact);
      if (picked) cachedVoices[language] = picked;
      return picked ?? null;
    }
  }

  const picked = bestOf(candidates);
  if (picked) cachedVoices[language] = picked;
  return picked ?? null;
}

export function speak(text: string, language: Language = "es") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel(); // stop any in-flight utterance so taps don't overlap

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = UTTERANCE_LANG[language];
  utterance.rate = 0.92; // slightly slower than default — clearer pronunciation for a learner
  const voice = pickVoice(language);
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}
