// Deterministic Spanish conjugation engine — regular rules + the curated
// irregularVerbs.ts override table. No LLM involved: conjugation has one
// objectively correct answer, so this is computed, not generated, which is
// what lets the grammar/verb-tense module grade drills with certainty and
// build answer keys that can't drift from what's actually correct.
//
// No vosotros — Mexican Spanish uses tú/usted and ustedes for the plural
// "you" in both familiar and formal register.

import { IRREGULAR_VERBS, type IrregularConjugation } from "./irregularVerbs";

export type Person = "yo" | "tu" | "usted" | "nosotros" | "ustedes";

export const PERSONS: Person[] = ["yo", "tu", "usted", "nosotros", "ustedes"];

export const PERSON_LABELS: Record<Person, string> = {
  yo: "yo",
  tu: "tú",
  usted: "usted / él / ella",
  nosotros: "nosotros",
  ustedes: "ustedes / ellos / ellas",
};

export type ConjugableTense =
  | "presente"
  | "preterito"
  | "imperfecto"
  | "futuro"
  | "condicional"
  | "presente_perfecto"
  | "presente_subjuntivo";

export type Tense = ConjugableTense | "imperativo";

export const CORE_TENSES: Tense[] = [
  "presente",
  "preterito",
  "imperfecto",
  "futuro",
  "condicional",
  "presente_perfecto",
  "presente_subjuntivo",
  "imperativo",
];

export const TENSE_LABELS: Record<Tense, string> = {
  presente: "Presente",
  preterito: "Pretérito",
  imperfecto: "Imperfecto",
  futuro: "Futuro",
  condicional: "Condicional",
  presente_perfecto: "Presente perfecto",
  presente_subjuntivo: "Presente de subjuntivo",
  imperativo: "Imperativo",
};

export type VerbEnding = "ar" | "er" | "ir";

export function verbEnding(infinitive: string): VerbEnding {
  const ending = infinitive.slice(-2);
  if (ending !== "ar" && ending !== "er" && ending !== "ir") {
    throw new Error(`"${infinitive}" doesn't end in -ar/-er/-ir`);
  }
  return ending;
}

function stemOf(infinitive: string): string {
  return infinitive.slice(0, -2);
}

function isVowel(ch: string): boolean {
  return "aeiouáéíóú".includes(ch);
}

/** Spelling-preserving stem adjustment for -car/-gar/-zar/-ger/-gir/-guir before front vowel endings (e/i). */
function frontVowelStem(infinitive: string, stem: string): string {
  if (infinitive.endsWith("car")) return stem.slice(0, -1) + "qu";
  if (infinitive.endsWith("gar")) return stem.slice(0, -1) + "gu";
  if (infinitive.endsWith("zar")) return stem.slice(0, -1) + "c";
  if (infinitive.endsWith("ger") || infinitive.endsWith("gir")) return stem.slice(0, -1) + "j";
  if (infinitive.endsWith("guir")) return stem.slice(0, -1);
  return stem;
}

function override(infinitive: string): IrregularConjugation | undefined {
  return IRREGULAR_VERBS[infinitive];
}

function regularPresente(infinitive: string): Record<Person, string> {
  const ending = verbEnding(infinitive);
  const stem = stemOf(infinitive);
  const endings: Record<VerbEnding, Record<Person, string>> = {
    ar: { yo: "o", tu: "as", usted: "a", nosotros: "amos", ustedes: "an" },
    er: { yo: "o", tu: "es", usted: "e", nosotros: "emos", ustedes: "en" },
    ir: { yo: "o", tu: "es", usted: "e", nosotros: "imos", ustedes: "en" },
  };
  const e = endings[ending];
  return {
    yo: stem + e.yo,
    tu: stem + e.tu,
    usted: stem + e.usted,
    nosotros: stem + e.nosotros,
    ustedes: stem + e.ustedes,
  };
}

function regularPreterito(infinitive: string): Record<Person, string> {
  const ending = verbEnding(infinitive);
  const stem = stemOf(infinitive);
  if (ending === "ar") {
    const yoStem = frontVowelStem(infinitive, stem);
    return {
      yo: yoStem + "é",
      tu: stem + "aste",
      usted: stem + "ó",
      nosotros: stem + "amos",
      ustedes: stem + "aron",
    };
  }
  return {
    yo: stem + "í",
    tu: stem + "iste",
    usted: stem + "ió",
    nosotros: stem + "imos",
    ustedes: stem + "ieron",
  };
}

function regularImperfecto(infinitive: string): Record<Person, string> {
  const ending = verbEnding(infinitive);
  const stem = stemOf(infinitive);
  if (ending === "ar") {
    return { yo: stem + "aba", tu: stem + "abas", usted: stem + "aba", nosotros: stem + "ábamos", ustedes: stem + "aban" };
  }
  return { yo: stem + "ía", tu: stem + "ías", usted: stem + "ía", nosotros: stem + "íamos", ustedes: stem + "ían" };
}

function futureConditionalStem(infinitive: string): string {
  return override(infinitive)?.futureStem ?? infinitive;
}

function regularFuturo(infinitive: string): Record<Person, string> {
  const stem = futureConditionalStem(infinitive);
  return { yo: stem + "é", tu: stem + "ás", usted: stem + "á", nosotros: stem + "emos", ustedes: stem + "án" };
}

function regularCondicional(infinitive: string): Record<Person, string> {
  const stem = futureConditionalStem(infinitive);
  return { yo: stem + "ía", tu: stem + "ías", usted: stem + "ía", nosotros: stem + "íamos", ustedes: stem + "ían" };
}

function regularPresenteSubjuntivo(infinitive: string): Record<Person, string> {
  const ending = verbEnding(infinitive);
  const stem = frontVowelStem(infinitive, stemOf(infinitive));
  if (ending === "ar") {
    return { yo: stem + "e", tu: stem + "es", usted: stem + "e", nosotros: stem + "emos", ustedes: stem + "en" };
  }
  return { yo: stem + "a", tu: stem + "as", usted: stem + "a", nosotros: stem + "amos", ustedes: stem + "an" };
}

export function pastParticiple(infinitive: string): string {
  const irregular = override(infinitive)?.pastParticiple;
  if (irregular) return irregular;
  const ending = verbEnding(infinitive);
  const stem = stemOf(infinitive);
  if (ending === "ar") return stem + "ado";
  const lastStemChar = stem.slice(-1);
  return stem + (isVowel(lastStemChar) ? "ído" : "ido");
}

const HABER_PRESENTE: Record<Person, string> = {
  yo: "he",
  tu: "has",
  usted: "ha",
  nosotros: "hemos",
  ustedes: "han",
};

function withOverride(regular: Record<Person, string>, partial: Partial<Record<Person, string>> | undefined) {
  if (!partial) return regular;
  return { ...regular, ...partial };
}

/** Full conjugation table for one tense across all five persons. */
export function conjugateAll(infinitive: string, tense: ConjugableTense): Record<Person, string> {
  const ov = override(infinitive);

  if (tense === "presente_perfecto") {
    const participle = pastParticiple(infinitive);
    return {
      yo: `${HABER_PRESENTE.yo} ${participle}`,
      tu: `${HABER_PRESENTE.tu} ${participle}`,
      usted: `${HABER_PRESENTE.usted} ${participle}`,
      nosotros: `${HABER_PRESENTE.nosotros} ${participle}`,
      ustedes: `${HABER_PRESENTE.ustedes} ${participle}`,
    };
  }

  switch (tense) {
    case "presente":
      return withOverride(regularPresente(infinitive), ov?.presente);
    case "preterito":
      return withOverride(regularPreterito(infinitive), ov?.preterito);
    case "imperfecto":
      return withOverride(regularImperfecto(infinitive), ov?.imperfecto);
    case "futuro":
      return regularFuturo(infinitive);
    case "condicional":
      return regularCondicional(infinitive);
    case "presente_subjuntivo":
      return withOverride(regularPresenteSubjuntivo(infinitive), ov?.presente_subjuntivo);
  }
}

/** Single form, for a specific person, in one of the seven regularly-inflected tenses. */
export function conjugate(infinitive: string, tense: ConjugableTense, person: Person): string {
  return conjugateAll(infinitive, tense)[person];
}

export type ImperativePerson = "tu" | "usted" | "nosotros" | "ustedes";
export type ImperativePolarity = "affirmative" | "negative";

/** Imperativo — no "yo" form, and affirmative tú/nosotros have their own small exception list. */
export function conjugateImperative(infinitive: string, person: ImperativePerson, polarity: ImperativePolarity): string {
  const subjuntivo = conjugateAll(infinitive, "presente_subjuntivo");

  if (polarity === "negative") {
    return "no " + subjuntivo[person];
  }

  const ov = override(infinitive);
  if (person === "tu") {
    if (ov?.imperativeTuAffirmative) return ov.imperativeTuAffirmative;
    return conjugateAll(infinitive, "presente").usted; // 3rd-person-singular presente, the regular rule
  }
  if (person === "nosotros" && ov?.imperativeNosotrosAffirmative) {
    return ov.imperativeNosotrosAffirmative;
  }
  return subjuntivo[person];
}

/**
 * Whether this verb can be conjugated correctly by this engine. Regular
 * verbs always can; irregular/stem-changing verbs only if they're in the
 * curated override table — otherwise the pure regular rule would silently
 * produce a wrong form, so callers (the tense-drill queue) should skip it.
 */
export function isFullySupported(infinitive: string, verbType: string): boolean {
  try {
    verbEnding(infinitive);
  } catch {
    return false;
  }
  if (verbType === "irregular" || verbType === "stem_changing") {
    return isIrregular(infinitive);
  }
  return true;
}

export function isIrregular(infinitive: string): boolean {
  return infinitive in IRREGULAR_VERBS;
}
