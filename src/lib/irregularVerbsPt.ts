// Curated override table for Brazilian Portuguese irregular verbs — same
// shape/philosophy as irregularVerbs.ts: store only the fields that differ
// from the regular rule. Every form below was cross-checked against
// conjugacao.com.br before being committed here (see the round's verify
// script), not recalled from memory alone — Portuguese hasn't had a whole
// session of use to catch engine bugs the way Spanish has, so the bar for
// "checked before shipping" is if anything higher here.
//
// Deliberately NOT included yet: verbs whose only irregularity is a
// "eu-form-only" consonant/vowel shift (dormir->durmo, pedir->peço,
// sentir->sinto...) — that pattern needs its own careful verification pass
// before it's safe to add, so it's a follow-up round, not this one.

import type { PersonPt } from "./conjugationPt";

export interface IrregularConjugationPt {
  presente?: Partial<Record<PersonPt, string>>;
  preterito_perfeito?: Partial<Record<PersonPt, string>>;
  imperfeito?: Partial<Record<PersonPt, string>>;
  presente_do_subjuntivo?: Partial<Record<PersonPt, string>>;
  futureStem?: string; // replaces the infinitive stem before regular futuro endings
  pastParticiple?: string;
}

export const IRREGULAR_VERBS_PT: Record<string, IrregularConjugationPt> = {
  ser: {
    presente: { eu: "sou", voce: "é", nos: "somos", voces: "são" },
    preterito_perfeito: { eu: "fui", voce: "foi", nos: "fomos", voces: "foram" },
    imperfeito: { eu: "era", voce: "era", nos: "éramos", voces: "eram" },
    presente_do_subjuntivo: { eu: "seja", voce: "seja", nos: "sejamos", voces: "sejam" },
  },
  estar: {
    presente: { eu: "estou", voce: "está", nos: "estamos", voces: "estão" },
    preterito_perfeito: { eu: "estive", voce: "esteve", nos: "estivemos", voces: "estiveram" },
    presente_do_subjuntivo: { eu: "esteja", voce: "esteja", nos: "estejamos", voces: "estejam" },
  },
  ter: {
    presente: { eu: "tenho", voce: "tem", nos: "temos", voces: "têm" },
    preterito_perfeito: { eu: "tive", voce: "teve", nos: "tivemos", voces: "tiveram" },
    imperfeito: { eu: "tinha", voce: "tinha", nos: "tínhamos", voces: "tinham" },
    presente_do_subjuntivo: { eu: "tenha", voce: "tenha", nos: "tenhamos", voces: "tenham" },
  },
  ir: {
    presente: { eu: "vou", voce: "vai", nos: "vamos", voces: "vão" },
    preterito_perfeito: { eu: "fui", voce: "foi", nos: "fomos", voces: "foram" },
    presente_do_subjuntivo: { eu: "vá", voce: "vá", nos: "vamos", voces: "vão" },
  },
  fazer: {
    presente: { eu: "faço", voce: "faz", nos: "fazemos", voces: "fazem" },
    preterito_perfeito: { eu: "fiz", voce: "fez", nos: "fizemos", voces: "fizeram" },
    presente_do_subjuntivo: { eu: "faça", voce: "faça", nos: "façamos", voces: "façam" },
    futureStem: "far",
    pastParticiple: "feito",
  },
  dizer: {
    presente: { eu: "digo", voce: "diz", nos: "dizemos", voces: "dizem" },
    preterito_perfeito: { eu: "disse", voce: "disse", nos: "dissemos", voces: "disseram" },
    presente_do_subjuntivo: { eu: "diga", voce: "diga", nos: "digamos", voces: "digam" },
    futureStem: "dir",
    pastParticiple: "dito",
  },
  poder: {
    presente: { eu: "posso", voce: "pode", nos: "podemos", voces: "podem" },
    preterito_perfeito: { eu: "pude", voce: "pôde", nos: "pudemos", voces: "puderam" },
    presente_do_subjuntivo: { eu: "possa", voce: "possa", nos: "possamos", voces: "possam" },
  },
  querer: {
    presente: { eu: "quero", voce: "quer", nos: "queremos", voces: "querem" },
    preterito_perfeito: { eu: "quis", voce: "quis", nos: "quisemos", voces: "quiseram" },
    presente_do_subjuntivo: { eu: "queira", voce: "queira", nos: "queiramos", voces: "queiram" },
  },
  saber: {
    presente: { eu: "sei", voce: "sabe", nos: "sabemos", voces: "sabem" },
    preterito_perfeito: { eu: "soube", voce: "soube", nos: "soubemos", voces: "souberam" },
    presente_do_subjuntivo: { eu: "saiba", voce: "saiba", nos: "saibamos", voces: "saibam" },
  },
  ver: {
    presente: { eu: "vejo", voce: "vê", nos: "vemos", voces: "veem" },
    preterito_perfeito: { eu: "vi", voce: "viu", nos: "vimos", voces: "viram" },
    presente_do_subjuntivo: { eu: "veja", voce: "veja", nos: "vejamos", voces: "vejam" },
    pastParticiple: "visto",
  },
  vir: {
    presente: { eu: "venho", voce: "vem", nos: "vimos", voces: "vêm" },
    preterito_perfeito: { eu: "vim", voce: "veio", nos: "viemos", voces: "vieram" },
    imperfeito: { eu: "vinha", voce: "vinha", nos: "vínhamos", voces: "vinham" },
    presente_do_subjuntivo: { eu: "venha", voce: "venha", nos: "venhamos", voces: "venham" },
    pastParticiple: "vindo",
  },
  dar: {
    presente: { eu: "dou", voce: "dá", nos: "damos", voces: "dão" },
    preterito_perfeito: { eu: "dei", voce: "deu", nos: "demos", voces: "deram" },
    presente_do_subjuntivo: { eu: "dê", voce: "dê", nos: "demos", voces: "deem" },
  },
  pôr: {
    presente: { eu: "ponho", voce: "põe", nos: "pomos", voces: "põem" },
    preterito_perfeito: { eu: "pus", voce: "pôs", nos: "pusemos", voces: "puseram" },
    imperfeito: { eu: "punha", voce: "punha", nos: "púnhamos", voces: "punham" },
    presente_do_subjuntivo: { eu: "ponha", voce: "ponha", nos: "ponhamos", voces: "ponham" },
    futureStem: "por",
    pastParticiple: "posto",
  },
  trazer: {
    presente: { eu: "trago", voce: "traz", nos: "trazemos", voces: "trazem" },
    preterito_perfeito: { eu: "trouxe", voce: "trouxe", nos: "trouxemos", voces: "trouxeram" },
    presente_do_subjuntivo: { eu: "traga", voce: "traga", nos: "tragamos", voces: "tragam" },
    futureStem: "trar",
  },
  haver: {
    presente: { eu: "hei", voce: "há", nos: "havemos", voces: "hão" },
    preterito_perfeito: { eu: "houve", voce: "houve", nos: "houvemos", voces: "houveram" },
    presente_do_subjuntivo: { eu: "haja", voce: "haja", nos: "hajamos", voces: "hajam" },
  },
  // Regular in every tense — only the participle is irregular.
  abrir: { pastParticiple: "aberto" },
  cobrir: { pastParticiple: "coberto" },
  descobrir: { pastParticiple: "descoberto" },
};
