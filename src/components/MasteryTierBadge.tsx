import type { MasteryTier } from "@/lib/grammarQueue";

const TIER_LABELS: Record<MasteryTier, string> = {
  none: "Not yet tested",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

// Reuses the same ink/agave/marigold progression as the dashboard's vocab
// mastery-bucket widget — bronze/silver/gold is the same idea (retention
// deepening over repeated success), just for whole tests instead of items.
const TIER_CLASSES: Record<MasteryTier, string> = {
  none: "bg-ink/8 text-ink/40",
  bronze: "bg-ink/15 text-ink/60",
  silver: "bg-agave-light text-agave-dark",
  gold: "bg-marigold-light text-marigold-dark",
};

export default function MasteryTierBadge({ tier, className = "" }: { tier: MasteryTier; className?: string }) {
  if (tier === "none") return null;
  return (
    <span
      className={`inline-flex items-center font-sans text-[10px] font-medium uppercase tracking-wide rounded-full px-2 py-0.5 ${TIER_CLASSES[tier]} ${className}`}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
