// Browser-native text-to-speech (Web Speech API) — no API key, no cost.
// No-ops silently anywhere speechSynthesis isn't available (SSR, unsupported browsers).

let cachedVoice: SpeechSynthesisVoice | null = null;

// getVoices() can return an empty list on the very first call (voices load
// asynchronously), so only cache a positive match — keep retrying otherwise,
// which is cheap once the browser has actually loaded its voice list.
function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice = voices.find((v) => v.lang === "es-MX") ?? voices.find((v) => v.lang.startsWith("es")) ?? null;
  return cachedVoice;
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel(); // stop any in-flight utterance so taps don't overlap

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-MX";
  const voice = pickVoice();
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}
