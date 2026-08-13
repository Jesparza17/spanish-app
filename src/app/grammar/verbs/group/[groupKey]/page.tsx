"use client";

import { useParams } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import TenseSession from "@/components/TenseSession";
import { tensesForGroup } from "@/lib/grammarQueue";
import { TENSE_GROUP_LABELS, type TenseGroupKey } from "@/lib/conjugation";
import { TENSE_GROUP_LABELS_PT } from "@/lib/conjugationPt";
import { TENSE_GROUP_LABELS_FR } from "@/lib/conjugationFr";
import { useLanguage } from "@/lib/language";

const GROUP_KEYS: TenseGroupKey[] = ["present", "past", "subjunctive", "perfect", "all"];

export default function TenseGroupPage() {
  const params = useParams<{ groupKey: string }>();
  const groupKey = params.groupKey;
  const { language } = useLanguage();
  const labels = language === "pt" ? TENSE_GROUP_LABELS_PT : language === "fr" ? TENSE_GROUP_LABELS_FR : TENSE_GROUP_LABELS;
  const valid = (GROUP_KEYS as string[]).includes(groupKey);

  if (!valid) {
    return <p className="font-sans text-sm text-ink/50 px-6 pt-10">Unknown tense group.</p>;
  }

  const key = groupKey as TenseGroupKey;
  const tenses = tensesForGroup(key, language);

  return (
    <AuthGate>
      {(user) => <TenseSession user={user} tenses={tenses} groupKey={key} label={labels[key]} />}
    </AuthGate>
  );
}
