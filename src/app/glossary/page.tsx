"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { fetchAllVocab, fetchAllVerbs } from "@/lib/glossary";
import type { VocabItem, Verb } from "@/lib/types";

const KINDS: { value: "vocab" | "verbs"; label: string }[] = [
  { value: "vocab", label: "Vocab" },
  { value: "verbs", label: "Verbos" },
];

function GlossaryHome() {
  const [kind, setKind] = useState<"vocab" | "verbs">("vocab");
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([fetchAllVocab(), fetchAllVerbs()])
      .then(([v, vb]) => {
        setVocab(v);
        setVerbs(vb);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredVocab = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vocab;
    return vocab.filter((item) => item.lemma.toLowerCase().includes(q) || item.translation.toLowerCase().includes(q));
  }, [vocab, query]);

  const filteredVerbs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return verbs;
    return verbs.filter((v) => v.infinitive.toLowerCase().includes(q) || v.translation.toLowerCase().includes(q));
  }, [verbs, query]);

  const activeCount = kind === "vocab" ? filteredVocab.length : filteredVerbs.length;
  const totalCount = kind === "vocab" ? vocab.length : verbs.length;

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Cuaderno</p>
          <h1 className="font-display text-3xl text-white">Glosario</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6 pb-8">
        <div className="flex gap-2 mb-4">
          {KINDS.map((k) => (
            <button
              key={k.value}
              onClick={() => setKind(k.value)}
              className={`flex-1 rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
                kind === k.value ? "bg-ink text-white" : "bg-card text-ink/55 shadow-card"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={kind === "vocab" ? "Buscar palabra o traducción…" : "Buscar verbo o traducción…"}
          className="w-full rounded-xl border border-line bg-card px-4 py-2.5 font-sans text-sm text-ink shadow-card mb-2"
        />

        {!loading && (
          <p className="font-sans text-xs text-ink/40 mb-4">
            {activeCount} de {totalCount}
          </p>
        )}

        {loading ? (
          <p className="font-sans text-sm text-ink/50">Loading…</p>
        ) : kind === "vocab" ? (
          <div className="flex flex-col gap-2">
            {filteredVocab.map((item) => (
              <div key={item.id} className="rounded-2xl bg-card shadow-card px-5 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-base text-ink">{item.lemma}</span>
                  <span className="font-sans text-[10px] font-medium text-agave-dark bg-agave-light rounded-full px-2 py-0.5 shrink-0 uppercase tracking-wide">
                    {item.cefr_level}
                  </span>
                </div>
                <p className="font-sans text-sm text-ink/70 mt-1">{item.translation}</p>
                <p className="font-sans text-xs text-ink/40 mt-1 uppercase tracking-wide">{item.part_of_speech}</p>
              </div>
            ))}
            {filteredVocab.length === 0 && (
              <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
                <p className="font-sans text-sm text-ink/60">No se encontraron palabras.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredVerbs.map((v) => (
              <div key={v.id} className="rounded-2xl bg-card shadow-card px-5 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-base text-ink">{v.infinitive}</span>
                  <span className="font-sans text-[10px] font-medium text-agave-dark bg-agave-light rounded-full px-2 py-0.5 shrink-0 uppercase tracking-wide">
                    {v.cefr_level}
                  </span>
                </div>
                <p className="font-sans text-sm text-ink/70 mt-1">{v.translation}</p>
                <p className="font-sans text-xs text-ink/40 mt-1 uppercase tracking-wide">{v.verb_type.replace("_", " ")}</p>
              </div>
            ))}
            {filteredVerbs.length === 0 && (
              <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
                <p className="font-sans text-sm text-ink/60">No se encontraron verbos.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function GlossaryPage() {
  return <AuthGate>{() => <GlossaryHome />}</AuthGate>;
}
