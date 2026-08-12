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
    // Suffixing moves the stress off the "i", so the hiatus accent from the bare
    // infinitive is dropped: oiré/oiría, not oíré/oíría.
    futureStem: "oir",
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
  // Otherwise fully regular verbs whose past participle is the one
  // irregular form — worth curating explicitly rather than letting the
  // regular rule silently produce "escribido"/"abrido"/"rompido".
  escribir: {
    pastParticiple: "escrito",
  },
  abrir: {
    pastParticiple: "abierto",
  },
  romper: {
    pastParticiple: "roto",
  },
  cubrir: {
    pastParticiple: "cubierto",
  },
  descubrir: {
    pastParticiple: "descubierto",
  },
  resolver: {
    presente: { yo: "resuelvo", tu: "resuelves", usted: "resuelve", nosotros: "resolvemos", ustedes: "resuelven" },
    presente_subjuntivo: {
      yo: "resuelva",
      tu: "resuelvas",
      usted: "resuelva",
      nosotros: "resolvamos",
      ustedes: "resuelvan",
    },
    pastParticiple: "resuelto",
  },
  // Regular preterito now that regularPreterito handles vowel-final stems
  // (see conjugation.ts) — only presente/subjuntivo need overriding here.
  caer: {
    presente: { yo: "caigo", tu: "caes", usted: "cae", nosotros: "caemos", ustedes: "caen" },
    presente_subjuntivo: { yo: "caiga", tu: "caigas", usted: "caiga", nosotros: "caigamos", ustedes: "caigan" },
  },
  valer: {
    presente: { yo: "valgo", tu: "vales", usted: "vale", nosotros: "valemos", ustedes: "valen" },
    presente_subjuntivo: { yo: "valga", tu: "valgas", usted: "valga", nosotros: "valgamos", ustedes: "valgan" },
    futureStem: "valdr",
  },
  caber: {
    presente: { yo: "quepo", tu: "cabes", usted: "cabe", nosotros: "cabemos", ustedes: "caben" },
    preterito: { yo: "cupe", tu: "cupiste", usted: "cupo", nosotros: "cupimos", ustedes: "cupieron" },
    presente_subjuntivo: { yo: "quepa", tu: "quepas", usted: "quepa", nosotros: "quepamos", ustedes: "quepan" },
    futureStem: "cabr",
  },
  producir: {
    presente: { yo: "produzco", tu: "produces", usted: "produce", nosotros: "producimos", ustedes: "producen" },
    preterito: { yo: "produje", tu: "produjiste", usted: "produjo", nosotros: "produjimos", ustedes: "produjeron" },
    presente_subjuntivo: {
      yo: "produzca",
      tu: "produzcas",
      usted: "produzca",
      nosotros: "produzcamos",
      ustedes: "produzcan",
    },
  },
  traducir: {
    presente: { yo: "traduzco", tu: "traduces", usted: "traduce", nosotros: "traducimos", ustedes: "traducen" },
    preterito: { yo: "traduje", tu: "tradujiste", usted: "tradujo", nosotros: "tradujimos", ustedes: "tradujeron" },
    presente_subjuntivo: {
      yo: "traduzca",
      tu: "traduzcas",
      usted: "traduzca",
      nosotros: "traduzcamos",
      ustedes: "traduzcan",
    },
  },
  // -uir verbs: inserts "y" everywhere in presente except nosotros, and
  // throughout presente_subjuntivo including nosotros. Preterito is
  // regular now that regularPreterito handles vowel-final (weak-vowel)
  // stems on its own — construiste/construimos, no accent.
  construir: {
    presente: { yo: "construyo", tu: "construyes", usted: "construye", nosotros: "construimos", ustedes: "construyen" },
    presente_subjuntivo: {
      yo: "construya",
      tu: "construyas",
      usted: "construya",
      nosotros: "construyamos",
      ustedes: "construyan",
    },
  },
  huir: {
    presente: { yo: "huyo", tu: "huyes", usted: "huye", nosotros: "huimos", ustedes: "huyen" },
    presente_subjuntivo: { yo: "huya", tu: "huyas", usted: "huya", nosotros: "huyamos", ustedes: "huyan" },
  },
  vestir: {
    presente: { yo: "visto", tu: "vistes", usted: "viste", nosotros: "vestimos", ustedes: "visten" },
    preterito: { yo: "vestí", tu: "vestiste", usted: "vistió", nosotros: "vestimos", ustedes: "vistieron" },
    presente_subjuntivo: { yo: "vista", tu: "vistas", usted: "vista", nosotros: "vistamos", ustedes: "vistan" },
  },
  elegir: {
    presente: { yo: "elijo", tu: "eliges", usted: "elige", nosotros: "elegimos", ustedes: "eligen" },
    preterito: { yo: "elegí", tu: "elegiste", usted: "eligió", nosotros: "elegimos", ustedes: "eligieron" },
    presente_subjuntivo: { yo: "elija", tu: "elijas", usted: "elija", nosotros: "elijamos", ustedes: "elijan" },
  },
  excluir: {
    presente: { yo: "excluyo", tu: "excluyes", usted: "excluye", nosotros: "excluimos", ustedes: "excluyen" },
    presente_subjuntivo: { yo: "excluya", tu: "excluyas", usted: "excluya", nosotros: "excluyamos", ustedes: "excluyan" },
  },
  incluir: {
    presente: { yo: "incluyo", tu: "incluyes", usted: "incluye", nosotros: "incluimos", ustedes: "incluyen" },
    presente_subjuntivo: { yo: "incluya", tu: "incluyas", usted: "incluya", nosotros: "incluyamos", ustedes: "incluyan" },
  },
  concluir: {
    presente: { yo: "concluyo", tu: "concluyes", usted: "concluye", nosotros: "concluimos", ustedes: "concluyen" },
    presente_subjuntivo: { yo: "concluya", tu: "concluyas", usted: "concluya", nosotros: "concluyamos", ustedes: "concluyan" },
  },
  distribuir: {
    presente: {
      yo: "distribuyo",
      tu: "distribuyes",
      usted: "distribuye",
      nosotros: "distribuimos",
      ustedes: "distribuyen",
    },
    presente_subjuntivo: {
      yo: "distribuya",
      tu: "distribuyas",
      usted: "distribuya",
      nosotros: "distribuyamos",
      ustedes: "distribuyan",
    },
  },
  contribuir: {
    presente: {
      yo: "contribuyo",
      tu: "contribuyes",
      usted: "contribuye",
      nosotros: "contribuimos",
      ustedes: "contribuyen",
    },
    presente_subjuntivo: {
      yo: "contribuya",
      tu: "contribuyas",
      usted: "contribuya",
      nosotros: "contribuyamos",
      ustedes: "contribuyan",
    },
  },
  sustituir: {
    presente: {
      yo: "sustituyo",
      tu: "sustituyes",
      usted: "sustituye",
      nosotros: "sustituimos",
      ustedes: "sustituyen",
    },
    presente_subjuntivo: {
      yo: "sustituya",
      tu: "sustituyas",
      usted: "sustituya",
      nosotros: "sustituyamos",
      ustedes: "sustituyan",
    },
  },
  atribuir: {
    presente: { yo: "atribuyo", tu: "atribuyes", usted: "atribuye", nosotros: "atribuimos", ustedes: "atribuyen" },
    presente_subjuntivo: {
      yo: "atribuya",
      tu: "atribuyas",
      usted: "atribuya",
      nosotros: "atribuyamos",
      ustedes: "atribuyan",
    },
  },
  disminuir: {
    presente: {
      yo: "disminuyo",
      tu: "disminuyes",
      usted: "disminuye",
      nosotros: "disminuimos",
      ustedes: "disminuyen",
    },
    presente_subjuntivo: {
      yo: "disminuya",
      tu: "disminuyas",
      usted: "disminuya",
      nosotros: "disminuyamos",
      ustedes: "disminuyan",
    },
  },
  fluir: {
    presente: { yo: "fluyo", tu: "fluyes", usted: "fluye", nosotros: "fluimos", ustedes: "fluyen" },
    presente_subjuntivo: { yo: "fluya", tu: "fluyas", usted: "fluya", nosotros: "fluyamos", ustedes: "fluyan" },
  },
  influir: {
    presente: { yo: "influyo", tu: "influyes", usted: "influye", nosotros: "influimos", ustedes: "influyen" },
    presente_subjuntivo: {
      yo: "influya",
      tu: "influyas",
      usted: "influya",
      nosotros: "influyamos",
      ustedes: "influyan",
    },
  },
  destruir: {
    presente: { yo: "destruyo", tu: "destruyes", usted: "destruye", nosotros: "destruimos", ustedes: "destruyen" },
    presente_subjuntivo: {
      yo: "destruya",
      tu: "destruyas",
      usted: "destruya",
      nosotros: "destruyamos",
      ustedes: "destruyan",
    },
  },
  constituir: {
    presente: {
      yo: "constituyo",
      tu: "constituyes",
      usted: "constituye",
      nosotros: "constituimos",
      ustedes: "constituyen",
    },
    presente_subjuntivo: {
      yo: "constituya",
      tu: "constituyas",
      usted: "constituya",
      nosotros: "constituyamos",
      ustedes: "constituyan",
    },
  },
  // o -> hue diphthong with h-insertion; the only common -er verb of this type.
  oler: {
    presente: { yo: "huelo", tu: "hueles", usted: "huele", nosotros: "olemos", ustedes: "huelen" },
    presente_subjuntivo: { yo: "huela", tu: "huelas", usted: "huela", nosotros: "olamos", ustedes: "huelan" },
  },
  // e -> i stem change; ñ absorbs the following "i" in preterito usted/ustedes (riñó, not riñió).
  reñir: {
    presente: { yo: "riño", tu: "riñes", usted: "riñe", nosotros: "reñimos", ustedes: "riñen" },
    preterito: { yo: "reñí", tu: "reñiste", usted: "riñó", nosotros: "reñimos", ustedes: "riñeron" },
    presente_subjuntivo: { yo: "riña", tu: "riñas", usted: "riña", nosotros: "riñamos", ustedes: "riñan" },
  },
};
