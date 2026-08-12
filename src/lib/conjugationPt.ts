// Deterministic Brazilian Portuguese conjugation engine — mirrors
// conjugation.ts's architecture (regular rules + a curated override table),
// kept as a separate file rather than sharing logic with the Spanish engine
// because the two languages' irregularities are different enough that
// threading language branches through every function would obscure both.
//
// Register: standard colloquial Brazilian Portuguese drops "tu" almost
// everywhere in Brazil — "você" takes 3rd-person conjugation instead, the
// same simplification-for-authenticity call already made for Spanish
// (tú/usted/ustedes, no vosotros). So there are genuinely only 4 distinct
// verb forms per tense here, not 5: eu, você (=ele/ela), nós, vocês
// (=eles/elas).

import { IRREGULAR_VERBS_PT, type IrregularConjugationPt } from "./irregularVerbsPt";
import type { CefrLevel } from "./types";

export type PersonPt = "eu" | "voce" | "nos" | "voces";

export const PERSONS_PT: PersonPt[] = ["eu", "voce", "nos", "voces"];

export const PERSON_LABELS_PT: Record<PersonPt, string> = {
  eu: "eu",
  voce: "você / ele / ela",
  nos: "nós",
  voces: "vocês / eles / elas",
};

export type ConjugableTensePt =
  | "presente"
  | "preterito_perfeito"
  | "imperfeito"
  | "futuro_do_presente"
  | "futuro_do_preterito"
  | "presente_do_subjuntivo"
  | "preterito_perfeito_composto";

export type TensePt = ConjugableTensePt | "imperativo";

export const CORE_TENSES_PT: TensePt[] = [
  "presente",
  "preterito_perfeito",
  "imperfeito",
  "futuro_do_presente",
  "futuro_do_preterito",
  "presente_do_subjuntivo",
  "imperativo",
  "preterito_perfeito_composto",
];

export const TENSE_LABELS_PT: Record<TensePt, string> = {
  presente: "Presente",
  preterito_perfeito: "Pretérito perfeito",
  imperfeito: "Imperfeito",
  futuro_do_presente: "Futuro do presente",
  futuro_do_preterito: "Futuro do pretérito",
  presente_do_subjuntivo: "Presente do subjuntivo",
  imperativo: "Imperativo",
  preterito_perfeito_composto: "Pretérito perfeito composto",
};

/** Rough CEFR level at which each tense is typically introduced. */
export const TENSE_CEFR_LEVELS_PT: Record<TensePt, CefrLevel> = {
  presente: "A1",
  preterito_perfeito: "A2",
  imperfeito: "A2",
  futuro_do_presente: "B1",
  futuro_do_preterito: "B1",
  presente_do_subjuntivo: "B1",
  imperativo: "B1",
  preterito_perfeito_composto: "B1",
};

export type VerbEndingPt = "ar" | "er" | "ir";

export function verbEndingPt(infinitive: string): VerbEndingPt {
  const ending = infinitive.slice(-2);
  // "ôr" (pôr and compounds like compor/repor) is historically an -er verb
  // spelled with a circumflex — behaves as -er for stem/rule purposes.
  if (ending === "ôr") return "er";
  if (ending !== "ar" && ending !== "er" && ending !== "ir") {
    throw new Error(`"${infinitive}" doesn't end in -ar/-er/-ir`);
  }
  return ending;
}

function stemOf(infinitive: string): string {
  return infinitive.slice(0, -2);
}

/** Spelling-preserving stem adjustment for -car/-gar/-çar before front vowel endings (e). */
function frontVowelStem(infinitive: string, stem: string): string {
  if (infinitive.endsWith("car")) return stem.slice(0, -1) + "qu";
  if (infinitive.endsWith("gar")) return stem.slice(0, -1) + "gu";
  if (infinitive.endsWith("çar")) return stem.slice(0, -1) + "c";
  return stem;
}

function override(infinitive: string): IrregularConjugationPt | undefined {
  return IRREGULAR_VERBS_PT[infinitive];
}

function regularPresente(infinitive: string): Record<PersonPt, string> {
  const ending = verbEndingPt(infinitive);
  const stem = stemOf(infinitive);
  const endings: Record<VerbEndingPt, Record<PersonPt, string>> = {
    ar: { eu: "o", voce: "a", nos: "amos", voces: "am" },
    er: { eu: "o", voce: "e", nos: "emos", voces: "em" },
    ir: { eu: "o", voce: "e", nos: "imos", voces: "em" },
  };
  const e = endings[ending];
  return { eu: stem + e.eu, voce: stem + e.voce, nos: stem + e.nos, voces: stem + e.voces };
}

function regularPreteritoPerfeito(infinitive: string): Record<PersonPt, string> {
  const ending = verbEndingPt(infinitive);
  const stem = stemOf(infinitive);
  if (ending === "ar") {
    const euStem = frontVowelStem(infinitive, stem);
    return { eu: euStem + "ei", voce: stem + "ou", nos: stem + "amos", voces: stem + "aram" };
  }
  if (ending === "er") {
    return { eu: stem + "i", voce: stem + "eu", nos: stem + "emos", voces: stem + "eram" };
  }
  return { eu: stem + "i", voce: stem + "iu", nos: stem + "imos", voces: stem + "iram" };
}

function regularImperfeito(infinitive: string): Record<PersonPt, string> {
  const ending = verbEndingPt(infinitive);
  const stem = stemOf(infinitive);
  if (ending === "ar") {
    return { eu: stem + "ava", voce: stem + "ava", nos: stem + "ávamos", voces: stem + "avam" };
  }
  return { eu: stem + "ia", voce: stem + "ia", nos: stem + "íamos", voces: stem + "iam" };
}

function futureStemOf(infinitive: string): string {
  return override(infinitive)?.futureStem ?? infinitive;
}

function regularFuturoDoPresente(infinitive: string): Record<PersonPt, string> {
  const stem = futureStemOf(infinitive);
  return { eu: stem + "ei", voce: stem + "á", nos: stem + "emos", voces: stem + "ão" };
}

function regularFuturoDoPreterito(infinitive: string): Record<PersonPt, string> {
  const stem = futureStemOf(infinitive);
  return { eu: stem + "ia", voce: stem + "ia", nos: stem + "íamos", voces: stem + "iam" };
}

function regularPresenteDoSubjuntivo(infinitive: string): Record<PersonPt, string> {
  const ending = verbEndingPt(infinitive);
  const stem = frontVowelStem(infinitive, stemOf(infinitive));
  if (ending === "ar") {
    return { eu: stem + "e", voce: stem + "e", nos: stem + "emos", voces: stem + "em" };
  }
  return { eu: stem + "a", voce: stem + "a", nos: stem + "amos", voces: stem + "am" };
}

function regularParticiple(infinitive: string): string {
  const ending = verbEndingPt(infinitive);
  const stem = stemOf(infinitive);
  return ending === "ar" ? stem + "ado" : stem + "ido";
}

export function pastParticiplePt(infinitive: string): string {
  return override(infinitive)?.pastParticiple ?? regularParticiple(infinitive);
}

const TER_PRESENTE: Record<PersonPt, string> = { eu: "tenho", voce: "tem", nos: "temos", voces: "têm" };

function withOverride(regular: Record<PersonPt, string>, partial: Partial<Record<PersonPt, string>> | undefined) {
  if (!partial) return regular;
  return { ...regular, ...partial };
}

/** Full conjugation table for one tense across all four persons. */
export function conjugateAllPt(infinitive: string, tense: ConjugableTensePt): Record<PersonPt, string> {
  const ov = override(infinitive);

  if (tense === "preterito_perfeito_composto") {
    const participle = pastParticiplePt(infinitive);
    return {
      eu: `${TER_PRESENTE.eu} ${participle}`,
      voce: `${TER_PRESENTE.voce} ${participle}`,
      nos: `${TER_PRESENTE.nos} ${participle}`,
      voces: `${TER_PRESENTE.voces} ${participle}`,
    };
  }

  switch (tense) {
    case "presente":
      return withOverride(regularPresente(infinitive), ov?.presente);
    case "preterito_perfeito":
      return withOverride(regularPreteritoPerfeito(infinitive), ov?.preterito_perfeito);
    case "imperfeito":
      return withOverride(regularImperfeito(infinitive), ov?.imperfeito);
    case "futuro_do_presente":
      return regularFuturoDoPresente(infinitive);
    case "futuro_do_preterito":
      return regularFuturoDoPreterito(infinitive);
    case "presente_do_subjuntivo":
      return withOverride(regularPresenteDoSubjuntivo(infinitive), ov?.presente_do_subjuntivo);
  }
}

/** Single form, for a specific person, in one of the regularly-inflected tenses. */
export function conjugatePt(infinitive: string, tense: ConjugableTensePt, person: PersonPt): string {
  return conjugateAllPt(infinitive, tense)[person];
}

export type ImperativePolarityPt = "affirmative" | "negative";

/**
 * Imperativo — no "eu" form. Without "tu" in this register, imperativo for
 * every surviving person (você/nós/vocês) coincides exactly with presente
 * do subjuntivo, both affirmative and negative (unlike Spanish, where
 * affirmative tú is a genuine exception to the subjunctive-based pattern).
 */
export function conjugateImperativePt(
  infinitive: string,
  person: Exclude<PersonPt, "eu">,
  polarity: ImperativePolarityPt
): string {
  const subjuntivo = conjugateAllPt(infinitive, "presente_do_subjuntivo");
  return polarity === "negative" ? "não " + subjuntivo[person] : subjuntivo[person];
}

/**
 * Whether this verb can be conjugated correctly by this engine. Regular
 * verbs always can; irregular verbs only if they're in the curated override
 * table — otherwise the pure regular rule would silently produce a wrong
 * form.
 */
export function isFullySupportedPt(infinitive: string, verbType: string): boolean {
  try {
    verbEndingPt(infinitive);
  } catch {
    return false;
  }
  if (verbType === "irregular" || verbType === "stem_changing") {
    return isIrregularPt(infinitive);
  }
  return true;
}

export function isIrregularPt(infinitive: string): boolean {
  return infinitive in IRREGULAR_VERBS_PT;
}

/** Whether this specific (verb, tense, person) form deviates from the regular rule. */
export function isIrregularFormPt(
  infinitive: string,
  tense: TensePt,
  person: PersonPt,
  polarity: ImperativePolarityPt = "affirmative"
): boolean {
  if (tense === "futuro_do_presente" || tense === "futuro_do_preterito") {
    return !!override(infinitive)?.futureStem;
  }
  if (tense === "preterito_perfeito_composto") {
    return pastParticiplePt(infinitive) !== regularParticiple(infinitive);
  }
  if (tense === "imperativo") {
    if (person === "eu") return false;
    const actual = conjugateImperativePt(infinitive, person, polarity);
    const regular = (polarity === "negative" ? "não " : "") + regularPresenteDoSubjuntivo(infinitive)[person];
    return actual !== regular;
  }

  const actual = conjugatePt(infinitive, tense as ConjugableTensePt, person);
  switch (tense as ConjugableTensePt) {
    case "presente":
      return actual !== regularPresente(infinitive)[person];
    case "preterito_perfeito":
      return actual !== regularPreteritoPerfeito(infinitive)[person];
    case "imperfeito":
      return actual !== regularImperfeito(infinitive)[person];
    case "presente_do_subjuntivo":
      return actual !== regularPresenteDoSubjuntivo(infinitive)[person];
    default:
      return false;
  }
}
