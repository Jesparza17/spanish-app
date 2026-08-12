// Deterministic Spanish conjugation engine — regular rules + the curated
// irregularVerbs.ts override table. No LLM involved: conjugation has one
// objectively correct answer, so this is computed, not generated, which is
// what lets the grammar/verb-tense module grade drills with certainty and
// build answer keys that can't drift from what's actually correct.
//
// No vosotros — Mexican Spanish uses tú/usted and ustedes for the plural
// "you" in both familiar and formal register.

import { IRREGULAR_VERBS, type IrregularConjugation } from "./irregularVerbs";
import type { CefrLevel } from "./types";

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
  | "presente_subjuntivo"
  | "imperfecto_subjuntivo"
  | "pluscuamperfecto_subjuntivo";

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
  "imperfecto_subjuntivo",
  "pluscuamperfecto_subjuntivo",
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
  imperfecto_subjuntivo: "Imperfecto de subjuntivo",
  pluscuamperfecto_subjuntivo: "Pluscuamperfecto de subjuntivo",
};

/** Rough CEFR level at which each tense is typically introduced. */
export const TENSE_CEFR_LEVELS: Record<Tense, CefrLevel> = {
  presente: "A1",
  preterito: "A2",
  imperfecto: "A2",
  futuro: "B1",
  condicional: "B1",
  presente_perfecto: "B1",
  presente_subjuntivo: "B1",
  imperativo: "B1",
  imperfecto_subjuntivo: "B2",
  pluscuamperfecto_subjuntivo: "C1",
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
  // When the stem ends in a vowel, unstressed "i" between two vowels
  // becomes "y" (leyó, not leió — cayó, construyó, huyó...). Also, when
  // that vowel is a "strong" one (a/e/o), the surviving "i" forms need a
  // written accent to mark the hiatus (leíste, leímos) — but not when it's
  // a "weak" one (i/u), where the vowels form a diphthong instead and no
  // accent is needed (construiste, construimos, not construíste).
  const lastChar = stem.slice(-1);
  if ("aeo".includes(lastChar)) {
    return { yo: stem + "í", tu: stem + "íste", usted: stem + "yó", nosotros: stem + "ímos", ustedes: stem + "yeron" };
  }
  if ("iu".includes(lastChar)) {
    return { yo: stem + "í", tu: stem + "iste", usted: stem + "yó", nosotros: stem + "imos", ustedes: stem + "yeron" };
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

/**
 * Imperfecto de subjuntivo (hablara, tuviera...) has no irregularity of its
 * own — it's always "pretérito ustedes form minus -ron" plus -ra endings,
 * with a written accent on the stem's last vowel for nosotros. That holds
 * for every verb, so this same derivation feeds both the real (override-
 * aware) computation and the "what would the regular form be" comparison
 * used for classification — only the pretérito form fed in differs.
 */
function deriveImperfectoSubjuntivo(preteritoUstedes: string): Record<Person, string> {
  const stem = preteritoUstedes.replace(/ron$/, "");
  const lastChar = stem.slice(-1);
  const accented = lastChar === "a" ? "á" : lastChar === "e" ? "é" : lastChar;
  const accentedStem = stem.slice(0, -1) + accented;
  return {
    yo: stem + "ra",
    tu: stem + "ras",
    usted: stem + "ra",
    nosotros: accentedStem + "ramos",
    ustedes: stem + "ran",
  };
}

function regularImperfectoSubjuntivo(infinitive: string): Record<Person, string> {
  return deriveImperfectoSubjuntivo(regularPreterito(infinitive).ustedes);
}

function regularParticiple(infinitive: string): string {
  const ending = verbEnding(infinitive);
  const stem = stemOf(infinitive);
  if (ending === "ar") return stem + "ado";
  const lastStemChar = stem.slice(-1);
  return stem + (isVowel(lastStemChar) ? "ído" : "ido");
}

export function pastParticiple(infinitive: string): string {
  return override(infinitive)?.pastParticiple ?? regularParticiple(infinitive);
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

  if (tense === "imperfecto_subjuntivo") {
    return deriveImperfectoSubjuntivo(conjugateAll(infinitive, "preterito").ustedes);
  }

  if (tense === "pluscuamperfecto_subjuntivo") {
    const haberForms = deriveImperfectoSubjuntivo(conjugateAll("haber", "preterito").ustedes);
    const participle = pastParticiple(infinitive);
    return {
      yo: `${haberForms.yo} ${participle}`,
      tu: `${haberForms.tu} ${participle}`,
      usted: `${haberForms.usted} ${participle}`,
      nosotros: `${haberForms.nosotros} ${participle}`,
      ustedes: `${haberForms.ustedes} ${participle}`,
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

/**
 * Whether this specific (verb, tense, person) form deviates from the
 * regular rule — not "is this verb irregular somewhere," but "is this exact
 * form irregular." Most irregular verbs are only irregular in some tenses
 * (e.g. tener's imperfecto — tenía, tenías... — is fully regular) and stem
 * changes affect some persons and not others (pensar's nosotros form never
 * changes), so classification has to compare the actual computed form
 * against the regular rule's output — checking whether an override *entry*
 * exists isn't enough, since some curated entries are written out even
 * where they happen to equal the regular form.
 */
export function isIrregularForm(
  infinitive: string,
  tense: Tense,
  person: Person | ImperativePerson,
  polarity: ImperativePolarity = "affirmative"
): boolean {
  if (tense === "futuro" || tense === "condicional") {
    // The stem change (when present) applies identically to every person.
    return !!override(infinitive)?.futureStem;
  }
  if (tense === "presente_perfecto" || tense === "pluscuamperfecto_subjuntivo") {
    // The auxiliary (haber) is always regular in both tenses; only the
    // participle can be irregular, and it's the same for every person.
    return pastParticiple(infinitive) !== regularParticiple(infinitive);
  }
  if (tense === "imperfecto_subjuntivo") {
    const p = person as Person;
    return conjugate(infinitive, tense, p) !== regularImperfectoSubjuntivo(infinitive)[p];
  }
  if (tense === "imperativo") {
    const actual = conjugateImperative(infinitive, person as ImperativePerson, polarity);
    let regular: string;
    if (polarity === "negative") {
      regular = "no " + regularPresenteSubjuntivo(infinitive)[person as Person];
    } else if (person === "tu") {
      regular = regularPresente(infinitive).usted;
    } else if (person === "nosotros") {
      regular = regularPresenteSubjuntivo(infinitive).nosotros;
    } else {
      regular = regularPresenteSubjuntivo(infinitive)[person as Person];
    }
    return actual !== regular;
  }

  const p = person as Person;
  const actual = conjugate(infinitive, tense as ConjugableTense, p);
  switch (tense as ConjugableTense) {
    case "presente":
      return actual !== regularPresente(infinitive)[p];
    case "preterito":
      return actual !== regularPreterito(infinitive)[p];
    case "imperfecto":
      return actual !== regularImperfecto(infinitive)[p];
    case "presente_subjuntivo":
      return actual !== regularPresenteSubjuntivo(infinitive)[p];
    default:
      return false;
  }
}
