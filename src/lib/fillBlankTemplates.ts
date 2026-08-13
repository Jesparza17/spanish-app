// Wraps a (language, tense, person, infinitive) conjugation question in a
// short natural carrier sentence for the "fill in the blank" practice mode
// — same underlying data as the flashcard-style "infinitivo — persona"
// prompt (grammarQueue.ts's buildTenseQuestions), just displayed as a
// sentence instead of an abstract pair. No per-verb content is authored;
// the time-adverb/trigger phrases below are fixed per tense and reused for
// every verb, which is what makes this tractable across thousands of
// (verb, tense, person) combinations without a content-authoring backlog.
//
// The blank always covers the full conjugated form (including any
// auxiliary, e.g. "he hablado" / "tenho falado" / "ai parlé"), matching
// what buildTenseQuestions already treats as the answer.

import type { Language } from "./language";

interface TenseTemplate {
  prefix: string; // goes before the subject pronoun (or before the blank, for imperativo)
  suffix: string; // goes after the (infinitivo) hint
  // English gloss of prefix/suffix, for a "what does this mean" tap in Fill
  // Blank mode — only the fixed carrier text, never the blank itself.
  prefixGloss?: string;
  suffixGloss?: string;
}

// Lowercase canonical form — capitalized only when a template's prefix is
// empty and the pronoun actually starts the sentence (e.g. "Ayer, tú..."
// keeps "tú" lowercase, but "Tú hablas..." capitalizes it).
const ES_PRONOUNS: Record<string, string> = {
  yo: "yo",
  tu: "tú",
  usted: "usted",
  nosotros: "nosotros",
  ustedes: "ustedes",
};

const ES_TEMPLATES: Record<string, TenseTemplate> = {
  presente: { prefix: "", suffix: "" },
  preterito: { prefix: "Ayer, ", suffix: "", prefixGloss: "Yesterday," },
  imperfecto: { prefix: "Antes, ", suffix: " mucho", prefixGloss: "Before,", suffixGloss: "a lot" },
  futuro: { prefix: "Mañana, ", suffix: "", prefixGloss: "Tomorrow," },
  condicional: { prefix: "En ese caso, ", suffix: "", prefixGloss: "In that case," },
  presente_perfecto: { prefix: "Hoy ", suffix: "", prefixGloss: "Today" },
  presente_subjuntivo: { prefix: "Ojalá que ", suffix: "", prefixGloss: "I hope that / Hopefully" },
  imperfecto_subjuntivo: { prefix: "Si ", suffix: "", prefixGloss: "If" },
  pluscuamperfecto_subjuntivo: { prefix: "Si ", suffix: " antes", prefixGloss: "If", suffixGloss: "beforehand" },
};

const PT_PRONOUNS: Record<string, string> = {
  eu: "eu",
  voce: "você",
  nos: "nós",
  voces: "vocês",
};

const PT_TEMPLATES: Record<string, TenseTemplate> = {
  presente: { prefix: "", suffix: "" },
  preterito_perfeito: { prefix: "Ontem, ", suffix: "", prefixGloss: "Yesterday," },
  imperfeito: { prefix: "Antes, ", suffix: " muito", prefixGloss: "Before,", suffixGloss: "a lot" },
  futuro_do_presente: { prefix: "Amanhã, ", suffix: "", prefixGloss: "Tomorrow," },
  futuro_do_preterito: { prefix: "Nesse caso, ", suffix: "", prefixGloss: "In that case," },
  presente_do_subjuntivo: { prefix: "Espero que ", suffix: "", prefixGloss: "I hope that" },
  preterito_perfeito_composto: { prefix: "Hoje ", suffix: "", prefixGloss: "Today" },
};

const FR_PRONOUNS: Record<string, string> = {
  je: "je",
  tu: "tu",
  il: "il",
  nous: "nous",
  vous: "vous",
  ils: "ils",
};

const FR_TEMPLATES: Record<string, TenseTemplate> = {
  present: { prefix: "", suffix: "" },
  passe_compose: { prefix: "", suffix: " hier", suffixGloss: "yesterday" },
  imparfait: { prefix: "Avant, ", suffix: " beaucoup", prefixGloss: "Before,", suffixGloss: "a lot" },
  futur_simple: { prefix: "Demain, ", suffix: "", prefixGloss: "Tomorrow," },
  conditionnel_present: { prefix: "Dans ce cas, ", suffix: "", prefixGloss: "In that case," },
  subjonctif_present: { prefix: "Il faut que ", suffix: "", prefixGloss: "It's necessary that / One must" },
};

const IMPERATIVE_TENSE: Record<Language, string> = { es: "imperativo", pt: "imperativo", fr: "imperatif" };

function pronounsFor(language: Language): Record<string, string> {
  return language === "pt" ? PT_PRONOUNS : language === "fr" ? FR_PRONOUNS : ES_PRONOUNS;
}

function templatesFor(language: Language): Record<string, TenseTemplate> {
  return language === "pt" ? PT_TEMPLATES : language === "fr" ? FR_TEMPLATES : ES_TEMPLATES;
}

const NEGATIVE_HINT_PREFIX: Record<Language, string> = { es: "no ", pt: "não ", fr: "ne...pas " };

/**
 * Builds a fill-in-the-blank prompt like "Ayer, yo ___ (hablar)." from the
 * same (tense, person, infinitive) a flashcard-style question already has.
 *
 * Imperativo/imperatif has no subject pronoun — the blank stands alone. The
 * engine's `answer` for a negative-polarity imperative already includes the
 * negation wrapper (e.g. "no hables", not just "hables"), so the blank must
 * absorb the whole thing — the hint shows that up front ("no hablar") so
 * the user isn't guessing whether negation goes inside or outside the
 * blank, matching what the flashcard label already signals separately.
 */
export function buildFillBlankPrompt(
  language: Language,
  tense: string,
  person: string,
  infinitive: string,
  polarity?: "affirmative" | "negative"
): string {
  if (tense === IMPERATIVE_TENSE[language]) {
    const hint = polarity === "negative" ? `${NEGATIVE_HINT_PREFIX[language]}${infinitive}` : infinitive;
    return `___ (${hint})${language === "fr" ? " !" : "!"}`;
  }

  const rawPronoun = pronounsFor(language)[person] ?? person;
  const template = templatesFor(language)[tense];
  const prefix = template?.prefix ?? "";
  const suffix = template?.suffix ?? "";
  // Capitalize the pronoun only when it actually opens the sentence — a
  // prefix like "Ayer, " already supplies the capital letter, so the
  // pronoun that follows it stays lowercase.
  const pronoun = prefix === "" ? rawPronoun.charAt(0).toUpperCase() + rawPronoun.slice(1) : rawPronoun;
  return `${prefix}${pronoun} ___ (${infinitive})${suffix}.`;
}

/**
 * English gloss of a Fill Blank template's fixed carrier text (the words
 * surrounding the blank, e.g. "Ayer, " or " mucho") — not the blank itself.
 * Returns null when the template has no prefix/suffix to gloss (e.g.
 * presente, which has none).
 */
export function getTemplateGloss(language: Language, tense: string): { prefixGloss?: string; suffixGloss?: string } | null {
  if (tense === IMPERATIVE_TENSE[language]) return null;
  const template = templatesFor(language)[tense];
  if (!template || (!template.prefixGloss && !template.suffixGloss)) return null;
  return { prefixGloss: template.prefixGloss, suffixGloss: template.suffixGloss };
}
