// Curated override table for French irregular verbs — same shape/philosophy
// as irregularVerbs.ts (Spanish) and irregularVerbsPt.ts (Portuguese): store
// only the fields that differ from the regular rule. Every form below was
// cross-checked against conjugaison.com before being committed (see the
// round's verify script), not recalled from memory alone.

import type { PersonFr } from "./conjugationFr";

export interface IrregularConjugationFr {
  present?: Partial<Record<PersonFr, string>>;
  imparfait?: Partial<Record<PersonFr, string>>;
  subjonctif_present?: Partial<Record<PersonFr, string>>;
  futureStem?: string; // replaces the infinitive-derived stem before regular futur/conditionnel endings
  pastParticiple?: string;
  auxiliary?: "avoir" | "être"; // defaults to avoir when absent
  imperatifTu?: string;
  imperatifNous?: string;
  imperatifVous?: string;
}

export const IRREGULAR_VERBS_FR: Record<string, IrregularConjugationFr> = {
  être: {
    present: { je: "suis", tu: "es", il: "est", nous: "sommes", vous: "êtes", ils: "sont" },
    imparfait: { je: "étais", tu: "étais", il: "était", nous: "étions", vous: "étiez", ils: "étaient" },
    subjonctif_present: { je: "sois", tu: "sois", il: "soit", nous: "soyons", vous: "soyez", ils: "soient" },
    futureStem: "ser",
    pastParticiple: "été",
    imperatifTu: "sois",
    imperatifNous: "soyons",
    imperatifVous: "soyez",
  },
  avoir: {
    present: { je: "ai", tu: "as", il: "a", nous: "avons", vous: "avez", ils: "ont" },
    subjonctif_present: { je: "aie", tu: "aies", il: "ait", nous: "ayons", vous: "ayez", ils: "aient" },
    futureStem: "aur",
    pastParticiple: "eu",
    imperatifTu: "aie",
    imperatifNous: "ayons",
    imperatifVous: "ayez",
  },
  aller: {
    present: { je: "vais", tu: "vas", il: "va", nous: "allons", vous: "allez", ils: "vont" },
    subjonctif_present: { je: "aille", tu: "ailles", il: "aille", nous: "allions", vous: "alliez", ils: "aillent" },
    futureStem: "ir",
    pastParticiple: "allé",
    auxiliary: "être",
  },
  faire: {
    present: { je: "fais", tu: "fais", il: "fait", nous: "faisons", vous: "faites", ils: "font" },
    subjonctif_present: { je: "fasse", tu: "fasses", il: "fasse", nous: "fassions", vous: "fassiez", ils: "fassent" },
    futureStem: "fer",
    pastParticiple: "fait",
  },
  pouvoir: {
    present: { je: "peux", tu: "peux", il: "peut", nous: "pouvons", vous: "pouvez", ils: "peuvent" },
    subjonctif_present: { je: "puisse", tu: "puisses", il: "puisse", nous: "puissions", vous: "puissiez", ils: "puissent" },
    futureStem: "pourr",
    pastParticiple: "pu",
  },
  vouloir: {
    present: { je: "veux", tu: "veux", il: "veut", nous: "voulons", vous: "voulez", ils: "veulent" },
    subjonctif_present: { je: "veuille", tu: "veuilles", il: "veuille", nous: "voulions", vous: "vouliez", ils: "veuillent" },
    futureStem: "voudr",
    pastParticiple: "voulu",
  },
  savoir: {
    present: { je: "sais", tu: "sais", il: "sait", nous: "savons", vous: "savez", ils: "savent" },
    subjonctif_present: { je: "sache", tu: "saches", il: "sache", nous: "sachions", vous: "sachiez", ils: "sachent" },
    futureStem: "saur",
    pastParticiple: "su",
    imperatifTu: "sache",
    imperatifNous: "sachons",
    imperatifVous: "sachez",
  },
  voir: {
    present: { je: "vois", tu: "vois", il: "voit", nous: "voyons", vous: "voyez", ils: "voient" },
    imparfait: { je: "voyais", tu: "voyais", il: "voyait", nous: "voyions", vous: "voyiez", ils: "voyaient" },
    subjonctif_present: { je: "voie", tu: "voies", il: "voie", nous: "voyions", vous: "voyiez", ils: "voient" },
    futureStem: "verr",
    pastParticiple: "vu",
  },
  venir: {
    present: { je: "viens", tu: "viens", il: "vient", nous: "venons", vous: "venez", ils: "viennent" },
    subjonctif_present: { je: "vienne", tu: "viennes", il: "vienne", nous: "venions", vous: "veniez", ils: "viennent" },
    futureStem: "viendr",
    pastParticiple: "venu",
    auxiliary: "être",
  },
  devoir: {
    present: { je: "dois", tu: "dois", il: "doit", nous: "devons", vous: "devez", ils: "doivent" },
    subjonctif_present: { je: "doive", tu: "doives", il: "doive", nous: "devions", vous: "deviez", ils: "doivent" },
    futureStem: "devr",
    pastParticiple: "dû",
  },
  prendre: {
    present: { je: "prends", tu: "prends", il: "prend", nous: "prenons", vous: "prenez", ils: "prennent" },
    subjonctif_present: { je: "prenne", tu: "prennes", il: "prenne", nous: "prenions", vous: "preniez", ils: "prennent" },
    pastParticiple: "pris",
  },
  dire: {
    present: { je: "dis", tu: "dis", il: "dit", nous: "disons", vous: "dites", ils: "disent" },
    subjonctif_present: { je: "dise", tu: "dises", il: "dise", nous: "disions", vous: "disiez", ils: "disent" },
    pastParticiple: "dit",
  },
  mettre: {
    present: { je: "mets", tu: "mets", il: "met", nous: "mettons", vous: "mettez", ils: "mettent" },
    subjonctif_present: { je: "mette", tu: "mettes", il: "mette", nous: "mettions", vous: "mettiez", ils: "mettent" },
    pastParticiple: "mis",
  },
  partir: {
    present: { je: "pars", tu: "pars", il: "part", nous: "partons", vous: "partez", ils: "partent" },
    subjonctif_present: { je: "parte", tu: "partes", il: "parte", nous: "partions", vous: "partiez", ils: "partent" },
    pastParticiple: "parti",
    auxiliary: "être",
  },
  connaître: {
    present: { je: "connais", tu: "connais", il: "connaît", nous: "connaissons", vous: "connaissez", ils: "connaissent" },
    subjonctif_present: {
      je: "connaisse",
      tu: "connaisses",
      il: "connaisse",
      nous: "connaissions",
      vous: "connaissiez",
      ils: "connaissent",
    },
    futureStem: "connaîtr",
    pastParticiple: "connu",
  },
  boire: {
    present: { je: "bois", tu: "bois", il: "boit", nous: "buvons", vous: "buvez", ils: "boivent" },
    imparfait: { je: "buvais", tu: "buvais", il: "buvait", nous: "buvions", vous: "buviez", ils: "buvaient" },
    subjonctif_present: { je: "boive", tu: "boives", il: "boive", nous: "buvions", vous: "buviez", ils: "boivent" },
    pastParticiple: "bu",
  },
  mourir: {
    present: { je: "meurs", tu: "meurs", il: "meurt", nous: "mourons", vous: "mourez", ils: "meurent" },
    subjonctif_present: { je: "meure", tu: "meures", il: "meure", nous: "mourions", vous: "mouriez", ils: "meurent" },
    futureStem: "mourr",
    pastParticiple: "mort",
    auxiliary: "être",
  },
  // The rest of the "maison d'être" verbs that ARE fully regular apart from
  // taking être instead of avoir — only the auxiliary needs overriding.
  arriver: { auxiliary: "être" },
  entrer: { auxiliary: "être" },
  monter: { auxiliary: "être" },
  rester: { auxiliary: "être" },
  retourner: { auxiliary: "être" },
  tomber: { auxiliary: "être" },
  rentrer: { auxiliary: "être" },
  descendre: { auxiliary: "être" },
};
