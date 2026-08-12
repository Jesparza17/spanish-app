"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpenText, GraduationCap, PenLine, Library } from "lucide-react";

const TABS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/vocab", label: "Vocab", icon: BookOpenText },
  { href: "/grammar", label: "Gramática", icon: GraduationCap },
  { href: "/diary", label: "Diario", icon: PenLine, disabled: true },
  { href: "/glossary", label: "Glosario", icon: Library },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-ink-shell/95 backdrop-blur border-t border-white/10 safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, disabled }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={disabled ? "#" : href}
              aria-disabled={disabled}
              className={`flex flex-col items-center gap-1 py-2.5 font-sans text-[11px] transition-colors ${
                disabled
                  ? "text-white/25 pointer-events-none"
                  : active
                  ? "text-marigold"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
