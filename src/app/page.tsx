import Link from "next/link";
import { ChevronRight, BookOpenText, GraduationCap, PenLine } from "lucide-react";

const NAV_CARDS = [
  {
    href: "/vocab",
    icon: BookOpenText,
    title: "Vocab & verbs",
    subtitle: "Review what's due today",
    active: true,
  },
  {
    href: "/grammar",
    icon: GraduationCap,
    title: "Gramática",
    subtitle: "Grammar rules & verb tenses",
    active: true,
  },
  {
    href: "/diary",
    icon: PenLine,
    title: "Diario",
    subtitle: "Write, get it corrected",
    active: false,
  },
];

export default function Home() {
  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Cuaderno</p>
          <h1 className="font-display text-3xl text-white">Buenos días.</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6">
        <div className="flex flex-col gap-3">
          {NAV_CARDS.map(({ href, icon: Icon, title, subtitle, active }) => (
            <Link
              key={href}
              href={active ? href : "#"}
              aria-disabled={!active}
              className={`flex items-center gap-4 rounded-2xl bg-card px-5 py-4 shadow-card transition-transform ${
                active ? "active:scale-[0.98]" : "opacity-50 pointer-events-none"
              }`}
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-agave-light text-agave-dark shrink-0">
                <Icon size={20} />
              </span>
              <span className="flex-1">
                <span className="block font-display text-lg text-ink leading-tight">{title}</span>
                <span className="block font-sans text-sm text-ink/55 mt-0.5">{subtitle}</span>
              </span>
              {active && <ChevronRight size={18} className="text-ink/30" />}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
