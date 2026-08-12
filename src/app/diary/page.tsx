"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowLeft, Eraser, Pen, Plus, Redo2, Save, Trash2, Undo2 } from "lucide-react";
import AuthGate from "@/components/AuthGate";
import HandwritingCanvas, { type HandwritingCanvasHandle, type Stroke } from "@/components/HandwritingCanvas";
import { createDiaryEntry, deleteDiaryEntry, fetchDiaryEntries, updateDiaryEntry, type DiaryEntry } from "@/lib/diary";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function autoTitle(dateIso: string): string {
  const d = new Date(dateIso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

function EntryEditor({
  entry,
  userId,
  onBack,
  onSaved,
  onDeleted,
}: {
  entry: DiaryEntry | { id: null; title: null; strokes: Stroke[] };
  userId: string;
  onBack: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [strokes, setStrokes] = useState<Stroke[]>(entry.strokes);
  const [title, setTitle] = useState(entry.title ?? "");
  const [mode, setMode] = useState<"pen" | "eraser">("pen");
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HandwritingCanvasHandle>(null);

  async function handleSave() {
    setSaving(true);
    try {
      if (entry.id) {
        await updateDiaryEntry(entry.id, title || null, strokes);
      } else {
        await createDiaryEntry(userId, title || null, strokes);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!entry.id) return onBack();
    await deleteDiaryEntry(entry.id);
    onDeleted();
  }

  return (
    <main className="h-screen flex flex-col bg-ink-shell safe-top safe-bottom">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onBack} className="text-white/70 active:text-white">
          <ArrowLeft size={22} />
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sin título"
          className="flex-1 bg-transparent font-display text-lg text-white placeholder:text-white/30 outline-none"
        />
        <button
          onClick={handleDelete}
          className="text-white/40 active:text-marigold"
          aria-label="Eliminar"
        >
          <Trash2 size={19} />
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-marigold text-white px-4 py-2 font-sans text-sm font-medium active:scale-[0.97] transition-transform disabled:opacity-50"
        >
          <Save size={16} className="inline -mt-0.5 mr-1" />
          Guardar
        </button>
      </div>

      <div className="flex-1 px-4 pb-3 min-h-0">
        <HandwritingCanvas ref={canvasRef} strokes={strokes} onChange={setStrokes} mode={mode} />
      </div>

      <div className="flex items-center justify-center gap-3 px-4 pb-4">
        <button
          onClick={() => setMode("pen")}
          className={`rounded-full p-3 transition-colors ${mode === "pen" ? "bg-marigold text-white" : "bg-white/10 text-white/60"}`}
          aria-label="Lápiz"
        >
          <Pen size={20} />
        </button>
        <button
          onClick={() => setMode("eraser")}
          className={`rounded-full p-3 transition-colors ${mode === "eraser" ? "bg-marigold text-white" : "bg-white/10 text-white/60"}`}
          aria-label="Borrador"
        >
          <Eraser size={20} />
        </button>
        <button
          onClick={() => canvasRef.current?.undo()}
          className="rounded-full p-3 bg-white/10 text-white/60 active:text-white"
          aria-label="Deshacer"
        >
          <Undo2 size={20} />
        </button>
        <button
          onClick={() => canvasRef.current?.clear()}
          className="rounded-full p-3 bg-white/10 text-white/60 active:text-white"
          aria-label="Borrar todo"
        >
          <Redo2 size={20} className="rotate-180" />
        </button>
      </div>
    </main>
  );
}

function DiaryHome({ user }: { user: User }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DiaryEntry | { id: null; title: null; strokes: Stroke[] } | null>(null);

  function reload() {
    setLoading(true);
    fetchDiaryEntries(user.id)
      .then(setEntries)
      .finally(() => setLoading(false));
  }

  useEffect(reload, [user.id]);

  if (editing) {
    return (
      <EntryEditor
        entry={editing}
        userId={user.id}
        onBack={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
        onDeleted={() => {
          setEditing(null);
          reload();
        }}
      />
    );
  }

  return (
    <main>
      <header className="bg-ink-shell safe-top">
        <div className="max-w-md mx-auto px-6 pt-8 pb-10 flex items-center justify-between">
          <div>
            <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Cuaderno</p>
            <h1 className="font-display text-3xl text-white">Diario</h1>
          </div>
          <button
            onClick={() => setEditing({ id: null, title: null, strokes: [] })}
            className="rounded-full bg-marigold text-white p-3 active:scale-[0.95] transition-transform"
            aria-label="Nueva entrada"
          >
            <Plus size={22} />
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-6 pb-8">
        {loading ? (
          <p className="font-sans text-sm text-ink/50">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl bg-card shadow-card px-6 py-10 text-center">
            <p className="font-sans text-sm text-ink/60">
              Todavía no tienes entradas. Toca el botón + para escribir la primera con tu Apple Pencil.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((e) => (
              <button
                key={e.id}
                onClick={() => setEditing(e)}
                className="text-left rounded-2xl bg-card shadow-card px-5 py-4 active:scale-[0.98] transition-transform"
              >
                <span className="block font-display text-base text-ink">{e.title || autoTitle(e.createdAt)}</span>
                <span className="block font-sans text-xs text-ink/45 mt-0.5">
                  {new Date(e.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function DiaryPage() {
  return <AuthGate>{(user) => <DiaryHome user={user} />}</AuthGate>;
}
