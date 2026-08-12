// Curated, hand-verified overrides for the verbs whose conjugation doesn't
// follow the pure regular rules in conjugation.ts — irregular verbs and
// stem-changers. Sourced from RAE conjugation tables, not generated, so the
// tense/verb practice module never has to trust an LLM for something that
// has one objectively correct answer.
//
// A field is only present when that form actually deviates from the
// regular rule for the verb's -ar/-er/-ir ending; anything omitted falls
// back to the regular computation in conjugation.ts.

import type { Person } from "./conjugation";

export interface IrregularConjugation {
  presente?: Partial<Record<Person, string>>;
  preterito?: Partial<Record<Person, string>>;
  imperfecto?: Partial<Record<Person, string>>;
  presente_subjuntivo?: Partial<Record<Person, string>>;
  futureStem?: string; // replaces the infinitive stem before regular futuro/condicional endings
  pastParticiple?: string;
  imperativeTuAffirmative?: string; // the 8 verbs with an irregular affirmative tú command
  imperativeNosotrosAffirmative?: string; // "ir" -> "vamos" is the one common exception
}

export const IRREGULAR_VERBS: Record<string, IrregularConjugation> = {
  ser: {
    presente: { yo: "soy", tu: "eres", usted: "es", nosotros: "somos", ustedes: "son" },
    preterito: { yo: "fui", tu: "fuiste", usted: "fue", nosotros: "fuimos", ustedes: "fueron" },
    imperfecto: { yo: "era", tu: "eras", usted: "era", nosotros: "éramos", ustedes: "eran" },
    presente_subjuntivo: { yo: "sea", tu: "seas", usted: "sea", nosotros: "seamos", ustedes: "sean" },
    pastParticiple: "sido",
    imperativeTuAffirmative: "sé",
  },
  estar: {
    presente: { yo: "estoy", tu: "estás", usted: "está", nosotros: "estamos", ustedes: "están" },
    preterito: { yo: "estuve", tu: "estuviste", usted: "estuvo", nosotros: "estuvimos", ustedes: "estuvieron" },
    presente_subjuntivo: { yo: "esté", tu: "estés", usted: "esté", nosotros: "estemos", ustedes: "estén" },
  },
  ir: {
    presente: { yo: "voy", tu: "vas", usted: "va", nosotros: "vamos", ustedes: "van" },
    preterito: { yo: "fui", tu: "fuiste", usted: "fue", nosotros: "fuimos", ustedes: "fueron" },
    imperfecto: { yo: "iba", tu: "ibas", usted: "iba", nosotros: "íbamos", ustedes: "iban" },
    presente_subjuntivo: { yo: "vaya", tu: "vayas", usted: "vaya", nosotros: "vayamos", ustedes: "vayan" },
    imperativeTuAffirmative: "ve",
    imperativeNosotrosAffirmative: "vamos",
  },
  haber: {
    presente: { yo: "he", tu: "has", usted: "ha", nosotros: "hemos", ustedes: "han" },
    preterito: { yo: "hube", tu: "hubiste", usted: "hubo", nosotros: "hubimos", ustedes: "hubieron" },
    imperfecto: { yo: "había", tu: "habías", usted: "había", nosotros: "habíamos", ustedes: "habían" },
    presente_subjuntivo: { yo: "haya", tu: "hayas", usted: "haya", nosotros: "hayamos", ustedes: "hayan" },
    futureStem: "habr",
    pastParticiple: "habido",
  },
  tener: {
    presente: { yo: "tengo", tu: "tienes", usted: "tiene", nosotros: "tenemos", ustedes: "tienen" },
    preterito: { yo: "tuve", tu: "tuviste", usted: "tuvo", nosotros: "tuvimos", ustedes: "tuvieron" },
    presente_subjuntivo: { yo: "tenga", tu: "tengas", usted: "tenga", nosotros: "tengamos", ustedes: "tengan" },
    futureStem: "tendr",
    imperativeTuAffirmative: "ten",
  },
  hacer: {
    presente: { yo: "hago", tu: "haces", usted: "hace", nosotros: "hacemos", ustedes: "hacen" },
    preterito: { yo: "hice", tu: "hiciste", usted: "hizo", nosotros: "hicimos", ustedes: "hicieron" },
    presente_subjuntivo: { yo: "haga", tu: "hagas", usted: "haga", nosotros: "hagamos", ustedes: "hagan" },
    futureStem: "har",
    pastParticiple: "hecho",
    imperativeTuAffirmative: "haz",
  },
  poder: {
    presente: { yo: "puedo", tu: "puedes", usted: "puede", nosotros: "podemos", ustedes: "pueden" },
    preterito: { yo: "pude", tu: "pudiste", usted: "pudo", nosotros: "pudimos", ustedes: "pudieron" },
    presente_subjuntivo: { yo: "pueda", tu: "puedas", usted: "pueda", nosotros: "podamos", ustedes: "puedan" },
    futureStem: "podr",
  },
  querer: {
    presente: { yo: "quiero", tu: "quieres", usted: "quiere", nosotros: "queremos", ustedes: "quieren" },
    preterito: { yo: "quise", tu: "quisiste", usted: "quiso", nosotros: "quisimos", ustedes: "quisieron" },
    presente_subjuntivo: { yo: "quiera", tu: "quieras", usted: "quiera", nosotros: "queramos", ustedes: "quieran" },
    futureStem: "querr",
  },
  decir: {
    presente: { yo: "digo", tu: "dices", usted: "dice", nosotros: "decimos", ustedes: "dicen" },
    preterito: { yo: "dije", tu: "dijiste", usted: "dijo", nosotros: "dijimos", ustedes: "dijeron" },
    presente_subjuntivo: { yo: "diga", tu: "digas", usted: "diga", nosotros: "digamos", ustedes: "digan" },
    futureStem: "dir",
    pastParticiple: "dicho",
    imperativeTuAffirmative: "di",
  },
  poner: {
    presente: { yo: "pongo", tu: "pones", usted: "pone", nosotros: "ponemos", ustedes: "ponen" },
    preterito: { yo: "puse", tu: "pusiste", usted: "puso", nosotros: "pusimos", ustedes: "pusieron" },
    presente_subjuntivo: { yo: "ponga", tu: "pongas", usted: "ponga", nosotros: "pongamos", ustedes: "pongan" },
    futureStem: "pondr",
    pastParticiple: "puesto",
    imperativeTuAffirmative: "pon",
  },
  saber: {
    presente: { yo: "sé", tu: "sabes", usted: "sabe", nosotros: "sabemos", ustedes: "saben" },
    preterito: { yo: "supe", tu: "supiste", usted: "supo", nosotros: "supimos", ustedes: "supieron" },
    presente_subjuntivo: { yo: "sepa", tu: "sepas", usted: "sepa", nosotros: "sepamos", ustedes: "sepan" },
    futureStem: "sabr",
  },
  salir: {
    presente: { yo: "salgo", tu: "sales", usted: "sale", nosotros: "salimos", ustedes: "salen" },
    presente_subjuntivo: { yo: "salga", tu: "salgas", usted: "salga", nosotros: "salgamos", ustedes: "salgan" },
    futureStem: "saldr",
    imperativeTuAffirmative: "sal",
  },
  venir: {
    presente: { yo: "vengo", tu: "vienes", usted: "viene", nosotros: "venimos", ustedes: "vienen" },
    preterito: { yo: "vine", tu: "viniste", usted: "vino", nosotros: "vinimos", ustedes: "vinieron" },
    presente_subjuntivo: { yo: "venga", tu: "vengas", usted: "venga", nosotros: "vengamos", ustedes: "vengan" },
    futureStem: "vendr",
    imperativeTuAffirmative: "ven",
  },
  dar: {
    presente: { yo: "doy", tu: "das", usted: "da", nosotros: "damos", ustedes: "dan" },
    preterito: { yo: "di", tu: "diste", usted: "dio", nosotros: "dimos", ustedes: "dieron" },
    presente_subjuntivo: { yo: "dé", tu: "des", usted: "dé", nosotros: "demos", ustedes: "den" },
  },
  ver: {
    presente: { yo: "veo", tu: "ves", usted: "ve", nosotros: "vemos", ustedes: "ven" },
    preterito: { yo: "vi", tu: "viste", usted: "vio", nosotros: "vimos", ustedes: "vieron" },
    imperfecto: { yo: "veía", tu: "veías", usted: "veía", nosotros: "veíamos", ustedes: "veían" },
    presente_subjuntivo: { yo: "vea", tu: "veas", usted: "vea", nosotros: "veamos", ustedes: "vean" },
    pastParticiple: "visto",
  },
  traer: {
    presente: { yo: "traigo", tu: "traes", usted: "trae", nosotros: "traemos", ustedes: "traen" },
    preterito: { yo: "traje", tu: "trajiste", usted: "trajo", nosotros: "trajimos", ustedes: "trajeron" },
    presente_subjuntivo: { yo: "traiga", tu: "traigas", usted: "traiga", nosotros: "traigamos", ustedes: "traigan" },
  },
  oír: {
    presente: { yo: "oigo", tu: "oyes", usted: "oye", nosotros: "oímos", ustedes: "oyen" },
    preterito: { yo: "oí", tu: "oíste", usted: "oyó", nosotros: "oímos", ustedes: "oyeron" },
    presente_subjuntivo: { yo: "oiga", tu: "oigas", usted: "oiga", nosotros: "oigamos", ustedes: "oigan" },
  },
  conducir: {
    presente: { yo: "conduzco", tu: "conduces", usted: "conduce", nosotros: "conducimos", ustedes: "conducen" },
    preterito: { yo: "conduje", tu: "condujiste", usted: "condujo", nosotros: "condujimos", ustedes: "condujeron" },
    presente_subjuntivo: {
      yo: "conduzca",
      tu: "conduzcas",
      usted: "conduzca",
      nosotros: "conduzcamos",
      ustedes: "conduzcan",
    },
  },
  conocer: {
    presente: { yo: "conozco", tu: "conoces", usted: "conoce", nosotros: "conocemos", ustedes: "conocen" },
    presente_subjuntivo: {
      yo: "conozca",
      tu: "conozcas",
      usted: "conozca",
      nosotros: "conozcamos",
      ustedes: "conozcan",
    },
  },
  jugar: {
    presente: { yo: "juego", tu: "juegas", usted: "juega", nosotros: "jugamos", ustedes: "juegan" },
    preterito: { yo: "jugué", tu: "jugaste", usted: "jugó", nosotros: "jugamos", ustedes: "jugaron" },
    presente_subjuntivo: { yo: "juegue", tu: "juegues", usted: "juegue", nosotros: "juguemos", ustedes: "jueguen" },
  },
  pensar: {
    presente: { yo: "pienso", tu: "piensas", usted: "piensa", nosotros: "pensamos", ustedes: "piensan" },
    presente_subjuntivo: { yo: "piense", tu: "pienses", usted: "piense", nosotros: "pensemos", ustedes: "piensen" },
  },
  cerrar: {
    presente: { yo: "cierro", tu: "cierras", usted: "cierra", nosotros: "cerramos", ustedes: "cierran" },
    presente_subjuntivo: { yo: "cierre", tu: "cierres", usted: "cierre", nosotros: "cerremos", ustedes: "cierren" },
  },
  entender: {
    presente: { yo: "entiendo", tu: "entiendes", usted: "entiende", nosotros: "entendemos", ustedes: "entienden" },
    presente_subjuntivo: {
      yo: "entienda",
      tu: "entiendas",
      usted: "entienda",
      nosotros: "entendamos",
      ustedes: "entiendan",
    },
  },
  perder: {
    presente: { yo: "pierdo", tu: "pierdes", usted: "pierde", nosotros: "perdemos", ustedes: "pierden" },
    presente_subjuntivo: { yo: "pierda", tu: "pierdas", usted: "pierda", nosotros: "perdamos", ustedes: "pierdan" },
  },
  volver: {
    presente: { yo: "vuelvo", tu: "vuelves", usted: "vuelve", nosotros: "volvemos", ustedes: "vuelven" },
    presente_subjuntivo: { yo: "vuelva", tu: "vuelvas", usted: "vuelva", nosotros: "volvamos", ustedes: "vuelvan" },
    pastParticiple: "vuelto",
  },
  dormir: {
    presente: { yo: "duermo", tu: "duermes", usted: "duerme", nosotros: "dormimos", ustedes: "duermen" },
    preterito: { yo: "dormí", tu: "dormiste", usted: "durmió", nosotros: "dormimos", ustedes: "durmieron" },
    presente_subjuntivo: { yo: "duerma", tu: "duermas", usted: "duerma", nosotros: "durmamos", ustedes: "duerman" },
  },
  morir: {
    presente: { yo: "muero", tu: "mueres", usted: "muere", nosotros: "morimos", ustedes: "mueren" },
    preterito: { yo: "morí", tu: "moriste", usted: "murió", nosotros: "morimos", ustedes: "murieron" },
    presente_subjuntivo: { yo: "muera", tu: "mueras", usted: "muera", nosotros: "muramos", ustedes: "mueran" },
    pastParticiple: "muerto",
  },
  pedir: {
    presente: { yo: "pido", tu: "pides", usted: "pide", nosotros: "pedimos", ustedes: "piden" },
    preterito: { yo: "pedí", tu: "pediste", usted: "pidió", nosotros: "pedimos", ustedes: "pidieron" },
    presente_subjuntivo: { yo: "pida", tu: "pidas", usted: "pida", nosotros: "pidamos", ustedes: "pidan" },
  },
  servir: {
    presente: { yo: "sirvo", tu: "sirves", usted: "sirve", nosotros: "servimos", ustedes: "sirven" },
    preterito: { yo: "serví", tu: "serviste", usted: "sirvió", nosotros: "servimos", ustedes: "sirvieron" },
    presente_subjuntivo: { yo: "sirva", tu: "sirvas", usted: "sirva", nosotros: "sirvamos", ustedes: "sirvan" },
  },
  seguir: {
    presente: { yo: "sigo", tu: "sigues", usted: "sigue", nosotros: "seguimos", ustedes: "siguen" },
    preterito: { yo: "seguí", tu: "seguiste", usted: "siguió", nosotros: "seguimos", ustedes: "siguieron" },
    presente_subjuntivo: { yo: "siga", tu: "sigas", usted: "siga", nosotros: "sigamos", ustedes: "sigan" },
  },
  sentir: {
    presente: { yo: "siento", tu: "sientes", usted: "siente", nosotros: "sentimos", ustedes: "sienten" },
    preterito: { yo: "sentí", tu: "sentiste", usted: "sintió", nosotros: "sentimos", ustedes: "sintieron" },
    presente_subjuntivo: { yo: "sienta", tu: "sientas", usted: "sienta", nosotros: "sintamos", ustedes: "sientan" },
  },
  preferir: {
    presente: { yo: "prefiero", tu: "prefieres", usted: "prefiere", nosotros: "preferimos", ustedes: "prefieren" },
    preterito: { yo: "preferí", tu: "preferiste", usted: "prefirió", nosotros: "preferimos", ustedes: "prefirieron" },
    presente_subjuntivo: {
      yo: "prefiera",
      tu: "prefieras",
      usted: "prefiera",
      nosotros: "prefiramos",
      ustedes: "prefieran",
    },
  },
  empezar: {
    presente: { yo: "empiezo", tu: "empiezas", usted: "empieza", nosotros: "empezamos", ustedes: "empiezan" },
    preterito: { yo: "empecé", tu: "empezaste", usted: "empezó", nosotros: "empezamos", ustedes: "empezaron" },
    presente_subjuntivo: {
      yo: "empiece",
      tu: "empieces",
      usted: "empiece",
      nosotros: "empecemos",
      ustedes: "empiecen",
    },
  },
  comenzar: {
    presente: { yo: "comienzo", tu: "comienzas", usted: "comienza", nosotros: "comenzamos", ustedes: "comienzan" },
    preterito: { yo: "comencé", tu: "comenzaste", usted: "comenzó", nosotros: "comenzamos", ustedes: "comenzaron" },
    presente_subjuntivo: {
      yo: "comience",
      tu: "comiences",
      usted: "comience",
      nosotros: "comencemos",
      ustedes: "comiencen",
    },
  },
};
