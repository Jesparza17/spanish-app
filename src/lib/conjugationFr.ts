// Deterministic French conjugation engine — mirrors conjugation.ts's and
// conjugationPt.ts's architecture (regular rules + a curated override
// table), kept as its own file since French's irregularities (avoir/être
// auxiliary choice, -ger/-cer spelling, 3 regular groups instead of 2) are
// different enough from Spanish/Portuguese to make sharing logic more
// confusing than helpful.
//
// Register: unlike the simplifications made for Mexican Spanish (no
// vosotros) and Brazilian Portuguese (no tu), French genuinely uses all six
// persons in standard speech and writing — tu and vous are both live,
// distinct forms, not a register collapse. So this engine models the full
// six-person paradigm.

import { IRREGULAR_VERBS_FR, type IrregularConjugationFr } from "./irregularVerbsFr";
import type { CefrLevel } from "./types";

export type PersonFr = "je" | "tu" | "il" | "nous" | "vous" | "ils";

export const PERSONS_FR: PersonFr[] = ["je", "tu", "il", "nous", "vous", "ils"];

export const PERSON_LABELS_FR: Record<PersonFr, string> = {
  je: "je",
  tu: "tu",
  il: "il / elle",
  nous: "nous",
  vous: "vous",
  ils: "ils / elles",
};

export type ConjugableTenseFr =
  | "present"
  | "passe_compose"
  | "imparfait"
  | "futur_simple"
  | "conditionnel_present"
  | "subjonctif_present";

export type TenseFr = ConjugableTenseFr | "imperatif";

export const CORE_TENSES_FR: TenseFr[] = [
  "present",
  "passe_compose",
  "imparfait",
  "futur_simple",
  "conditionnel_present",
  "subjonctif_present",
  "imperatif",
];

export const TENSE_LABELS_FR: Record<TenseFr, string> = {
  present: "Présent",
  passe_compose: "Passé composé",
  imparfait: "Imparfait",
  futur_simple: "Futur simple",
  conditionnel_present: "Conditionnel présent",
  subjonctif_present: "Subjonctif présent",
  imperatif: "Impératif",
};

/** Rough CEFR level at which each tense is typically introduced. */
export const TENSE_CEFR_LEVELS_FR: Record<TenseFr, CefrLevel> = {
  present: "A1",
  passe_compose: "A2",
  imparfait: "A2",
  futur_simple: "B1",
  conditionnel_present: "B1",
  subjonctif_present: "B1",
  imperatif: "A2",
};

export type VerbEndingFr = "er" | "ir" | "re";

export function verbEndingFr(infinitive: string): VerbEndingFr {
  const ending = infinitive.slice(-2);
  if (ending !== "er" && ending !== "ir" && ending !== "re") {
    throw new Error(`"${infinitive}" doesn't end in -er/-ir/-re`);
  }
  return ending;
}

function stemOf(infinitive: string): string {
  return infinitive.slice(0, -2);
}

function override(infinitive: string): IrregularConjugationFr | undefined {
  return IRREGULAR_VERBS_FR[infinitive];
}

/**
 * -ger verbs keep a written "e" after the g, and -cer verbs take a cedilla
 * (ç), whenever the following ending starts with a back vowel (a/o) — this
 * preserves the soft [ʒ]/[s] sound. Endings starting with e/i already keep
 * the consonant soft on their own, so no adjustment applies there.
 */
function gerCerStem(infinitive: string, stem: string, endingFirstChar: string): string {
  if (!"ao".includes(endingFirstChar)) return stem;
  if (infinitive.endsWith("ger")) return stem + "e";
  if (infinitive.endsWith("cer")) return stem.slice(0, -1) + "ç";
  return stem;
}

function regularPresente(infinitive: string): Record<PersonFr, string> {
  const ending = verbEndingFr(infinitive);
  const stem = stemOf(infinitive);
  if (ending === "er") {
    return {
      je: stem + "e",
      tu: stem + "es",
      il: stem + "e",
      nous: gerCerStem(infinitive, stem, "o") + "ons",
      vous: stem + "ez",
      ils: stem + "ent",
    };
  }
  if (ending === "ir") {
    // Regular group 2 (-iss- infix), e.g. finir. Irregular -ir verbs
    // (partir, venir...) are always fully overridden, so this rule never
    // has to be linguistically accurate for them — only different from
    // their actual (overridden) forms, which it always is.
    return { je: stem + "is", tu: stem + "is", il: stem + "it", nous: stem + "issons", vous: stem + "issez", ils: stem + "issent" };
  }
  // -re group 3, e.g. vendre
  return { je: stem + "s", tu: stem + "s", il: stem, nous: stem + "ons", vous: stem + "ez", ils: stem + "ent" };
}

function regularImparfait(infinitive: string): Record<PersonFr, string> {
  const ending = verbEndingFr(infinitive);
  const stem = stemOf(infinitive);
  const base = ending === "ir" ? stem + "iss" : stem;
  const aBase = gerCerStem(infinitive, base, "a");
  return {
    je: aBase + "ais",
    tu: aBase + "ais",
    il: aBase + "ait",
    nous: base + "ions",
    vous: base + "iez",
    ils: aBase + "aient",
  };
}

function futureStemOf(infinitive: string): string {
  const ov = override(infinitive)?.futureStem;
  if (ov) return ov;
  return infinitive.endsWith("re") ? infinitive.slice(0, -1) : infinitive;
}

function regularFuturSimple(infinitive: string): Record<PersonFr, string> {
  const stem = futureStemOf(infinitive);
  return { je: stem + "ai", tu: stem + "as", il: stem + "a", nous: stem + "ons", vous: stem + "ez", ils: stem + "ont" };
}

function regularConditionnelPresent(infinitive: string): Record<PersonFr, string> {
  const stem = futureStemOf(infinitive);
  return { je: stem + "ais", tu: stem + "ais", il: stem + "ait", nous: stem + "ions", vous: stem + "iez", ils: stem + "aient" };
}

function regularSubjonctifPresent(infinitive: string): Record<PersonFr, string> {
  const ending = verbEndingFr(infinitive);
  const stem = stemOf(infinitive);
  const base = ending === "ir" ? stem + "iss" : stem;
  return { je: base + "e", tu: base + "es", il: base + "e", nous: base + "ions", vous: base + "iez", ils: base + "ent" };
}

function regularParticiple(infinitive: string): string {
  const ending = verbEndingFr(infinitive);
  const stem = stemOf(infinitive);
  if (ending === "er") return stem + "é";
  if (ending === "ir") return stem + "i";
  return stem + "u";
}

export function pastParticipleFr(infinitive: string): string {
  return override(infinitive)?.pastParticiple ?? regularParticiple(infinitive);
}

export function auxiliaryFr(infinitive: string): "avoir" | "être" {
  return override(infinitive)?.auxiliary ?? "avoir";
}

const AVOIR_PRESENT: Record<PersonFr, string> = { je: "ai", tu: "as", il: "a", nous: "avons", vous: "avez", ils: "ont" };
const ETRE_PRESENT: Record<PersonFr, string> = { je: "suis", tu: "es", il: "est", nous: "sommes", vous: "êtes", ils: "sont" };

function withOverride(regular: Record<PersonFr, string>, partial: Partial<Record<PersonFr, string>> | undefined) {
  if (!partial) return regular;
  return { ...regular, ...partial };
}

/**
 * Full conjugation table for one tense across all six persons.
 *
 * Passé composé simplification: être-verb participles grammatically agree
 * in gender with the subject (elle est allée vs. il est allé) — this app
 * doesn't model subject gender anywhere (il/elle are already collapsed
 * into one person label, same as Spanish's usted/él/ella), so nous/vous/ils
 * use the masculine-plural participle (+s) as the canonical answer,
 * consistent with that existing simplification rather than a new one.
 */
export function conjugateAllFr(infinitive: string, tense: ConjugableTenseFr): Record<PersonFr, string> {
  const ov = override(infinitive);

  if (tense === "passe_compose") {
    const aux = auxiliaryFr(infinitive);
    const auxForms = aux === "être" ? ETRE_PRESENT : AVOIR_PRESENT;
    const participle = pastParticipleFr(infinitive);
    const pluralParticiple = aux === "être" && !participle.endsWith("s") ? participle + "s" : participle;
    return {
      je: `${auxForms.je} ${participle}`,
      tu: `${auxForms.tu} ${participle}`,
      il: `${auxForms.il} ${participle}`,
      nous: `${auxForms.nous} ${pluralParticiple}`,
      vous: `${auxForms.vous} ${pluralParticiple}`,
      ils: `${auxForms.ils} ${pluralParticiple}`,
    };
  }

  switch (tense) {
    case "present":
      return withOverride(regularPresente(infinitive), ov?.present);
    case "imparfait":
      return withOverride(regularImparfait(infinitive), ov?.imparfait);
    case "futur_simple":
      return regularFuturSimple(infinitive);
    case "conditionnel_present":
      return regularConditionnelPresent(infinitive);
    case "subjonctif_present":
      return withOverride(regularSubjonctifPresent(infinitive), ov?.subjonctif_present);
  }
}

export function conjugateFr(infinitive: string, tense: ConjugableTenseFr, person: PersonFr): string {
  return conjugateAllFr(infinitive, tense)[person];
}

export type ImperativePersonFr = "tu" | "nous" | "vous";
export type ImperativePolarityFr = "affirmative" | "negative";

function startsWithVowelSound(s: string): boolean {
  return /^[aeiouhàâéèêëîïôùûü]/i.test(s);
}

/** Impératif — no je/il/ils forms. Derived from présent, except -er verbs drop the tu form's -s (Parle!, not Parles!), and être/avoir/savoir have their own irregular forms (see overrides). */
export function conjugateImperativeFr(infinitive: string, person: ImperativePersonFr, polarity: ImperativePolarityFr): string {
  const ov = override(infinitive);
  const overrideKey = person === "tu" ? "imperatifTu" : person === "nous" ? "imperatifNous" : "imperatifVous";
  const present = regularPresente(infinitive);

  let form: string;
  if (ov?.[overrideKey]) {
    form = ov[overrideKey]!;
  } else if (person === "tu") {
    const tuForm = present.tu;
    form = verbEndingFr(infinitive) === "er" && tuForm.endsWith("s") ? tuForm.slice(0, -1) : tuForm;
  } else {
    form = present[person];
  }

  if (polarity === "affirmative") return form;
  return startsWithVowelSound(form) ? `n'${form} pas` : `ne ${form} pas`;
}

export function isFullySupportedFr(infinitive: string, verbType: string): boolean {
  try {
    verbEndingFr(infinitive);
  } catch {
    return false;
  }
  if (verbType === "irregular" || verbType === "stem_changing") {
    return isIrregularFr(infinitive);
  }
  return true;
}

export function isIrregularFr(infinitive: string): boolean {
  return infinitive in IRREGULAR_VERBS_FR;
}

/** Whether this specific (verb, tense, person) form deviates from the regular rule. */
export function isIrregularFormFr(
  infinitive: string,
  tense: TenseFr,
  person: PersonFr | ImperativePersonFr,
  polarity: ImperativePolarityFr = "affirmative"
): boolean {
  if (tense === "futur_simple" || tense === "conditionnel_present") {
    return !!override(infinitive)?.futureStem;
  }
  if (tense === "passe_compose") {
    return pastParticipleFr(infinitive) !== regularParticiple(infinitive) || auxiliaryFr(infinitive) === "être";
  }
  if (tense === "imperatif") {
    const p = person as ImperativePersonFr;
    const actual = conjugateImperativeFr(infinitive, p, polarity);
    const presentRegular = regularPresente(infinitive);
    let regularForm =
      p === "tu"
        ? verbEndingFr(infinitive) === "er" && presentRegular.tu.endsWith("s")
          ? presentRegular.tu.slice(0, -1)
          : presentRegular.tu
        : presentRegular[p];
    if (polarity === "negative") {
      regularForm = startsWithVowelSound(regularForm) ? `n'${regularForm} pas` : `ne ${regularForm} pas`;
    }
    return actual !== regularForm;
  }

  const p = person as PersonFr;
  const actual = conjugateFr(infinitive, tense as ConjugableTenseFr, p);
  switch (tense as ConjugableTenseFr) {
    case "present":
      return actual !== regularPresente(infinitive)[p];
    case "imparfait":
      return actual !== regularImparfait(infinitive)[p];
    case "subjonctif_present":
      return actual !== regularSubjonctifPresent(infinitive)[p];
    default:
      return false;
  }
}
