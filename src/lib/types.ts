export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Theme {
  id: string;
  name: string;
  description: string | null;
}

export interface VocabItem {
  id: string;
  lemma: string;
  translation: string;
  part_of_speech: string;
  example_sentence: string;
  example_translation: string;
  cefr_level: CefrLevel;
}

export interface Verb {
  id: string;
  infinitive: string;
  translation: string;
  verb_type: string;
  example_sentence: string;
  example_translation: string;
  cefr_level: CefrLevel;
}

export interface SrsRow {
  id: string;
  user_id: string;
  vocab_item_id: string | null;
  verb_id: string | null;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: string;
  last_reviewed_at: string | null;
}

// What the review screen actually renders — a vocab item or verb, unified,
// with its SRS state attached.
export interface ReviewCard {
  srsId: string;
  kind: "vocab" | "verb";
  front: string; // lemma or infinitive
  translation: string;
  example: string;
  exampleTranslation: string;
  cefrLevel: CefrLevel;
}

export interface GrammarTopic {
  id: string;
  slug: string;
  title: string;
  category: string;
  explanationMd: string;
  cefrLevel: CefrLevel;
  sortOrder: number;
}

// A practice item in the grammar module — either a topic cloze sentence or
// a verb-tense conjugation drill, unified the same way ReviewCard unifies
// vocab/verbs.
export interface GrammarExercise {
  id: string;
  kind: "topic" | "tense";
  prompt: string;
  acceptedAnswers: string[];
  explanation: string | null;
  cefrLevel: CefrLevel;
}

export interface GrammarProgress {
  scopeType: "tense" | "topic" | "combined";
  scopeKey: string;
  correctCount: number;
  attemptCount: number;
  bestTestScore: number | null;
  lastPracticedAt: string | null;
}
