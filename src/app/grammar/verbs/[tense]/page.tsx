"use client";

import { useParams } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import TenseSession from "@/components/TenseSession";
import { CORE_TENSES, TENSE_LABELS } from "@/lib/conjugation";
import { CORE_TENSES_PT, TENSE_LABELS_PT } from "@/lib/conjugationPt";
import { CORE_TENSES_FR, TENSE_LABELS_FR } from "@/lib/conjugationFr";
import { useLanguage } from "@/lib/language";

export default function TensePage() {
  const params = useParams<{ tense: string }>();
  const tense = params.tense;
  const { language } = useLanguage();
  const tenses = language === "pt" ? CORE_TENSES_PT : language === "fr" ? CORE_TENSES_FR : CORE_TENSES;
  const labels: Record<string, string> = language === "pt" ? TENSE_LABELS_PT : language === "fr" ? TENSE_LABELS_FR : TENSE_LABELS;
  const valid = (tenses as string[]).includes(tense);

  if (!valid) {
    return <p className="font-sans text-sm text-ink/50 px-6 pt-10">Unknown tense.</p>;
  }

  return <AuthGate>{(user) => <TenseSession user={user} tenses={[tense]} label={labels[tense]} />}</AuthGate>;
}
