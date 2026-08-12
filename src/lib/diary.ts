import { supabase } from "./supabaseClient";
import type { Stroke } from "@/components/HandwritingCanvas";

export interface DiaryEntry {
  id: string;
  title: string | null;
  strokes: Stroke[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchDiaryEntries(userId: string): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("id, title, strokes, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    strokes: row.strokes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function fetchDiaryEntry(id: string): Promise<DiaryEntry | null> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("id, title, strokes, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, title: data.title, strokes: data.strokes, createdAt: data.created_at, updatedAt: data.updated_at };
}

export async function createDiaryEntry(userId: string, title: string | null, strokes: Stroke[]): Promise<string> {
  const { data, error } = await supabase
    .from("diary_entries")
    .insert({ user_id: userId, title, strokes })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateDiaryEntry(id: string, title: string | null, strokes: Stroke[]): Promise<void> {
  const { error } = await supabase
    .from("diary_entries")
    .update({ title, strokes, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  const { error } = await supabase.from("diary_entries").delete().eq("id", id);
  if (error) throw error;
}
