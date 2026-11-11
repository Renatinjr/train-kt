"use client";

import { useEffect, useState } from "react";
import type { ExerciseDetail } from "@/lib/models";
import { DAY_COLORS } from "@/lib/models";
import { IconPlus, IconTrash } from "./icons";
import { ErrorBanner, Modal } from "./ui";

export interface ExerciseDraft {
  id?: string;
  sectionId: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  numSets: number;
  tip: string;
  badgeLabel: string;
  badgeColor: string;
  variations: { key: string; label: string; isAlternative: boolean }[];
}

export function draftFrom(sectionId: string, d: ExerciseDetail | null, dayColor: string): ExerciseDraft {
  if (!d) {
    return {
      sectionId, name: "", sets: "3 sets", reps: "", rest: "", numSets: 3, tip: "",
      badgeLabel: "", badgeColor: dayColor, variations: [],
    };
  }
  const e = d.exercise;
  return {
    id: e.id, sectionId, name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, numSets: e.numSets,
    tip: e.tip, badgeLabel: e.badgeLabel, badgeColor: e.badgeColor || dayColor,
    variations: d.variations.map((v) => ({ key: v.id, label: v.label, isAlternative: v.isAlternative })),
  };
}

/** Port of ui/exercise/EditExerciseSheet.kt */
export function ExerciseEditor({
  draft,
  onClose,
  onSubmit,
}: {
  draft: ExerciseDraft | null;
  onClose: () => void;
  onSubmit: (d: ExerciseDraft) => Promise<string | null>;
}) {
  const [d, setD] = useState<ExerciseDraft | null>(draft);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setD(draft);
    setError(null);
  }, [draft]);

  const set = (patch: Partial<ExerciseDraft>) => setD((x) => (x ? { ...x, ...patch } : x));
  const setVar = (key: string, patch: Partial<ExerciseDraft["variations"][number]>) =>
    setD((x) => (x ? { ...x, variations: x.variations.map((v) => (v.key === key ? { ...v, ...patch } : v)) } : x));
  const addVar = (isAlternative: boolean) =>
    setD((x) => (x ? { ...x, variations: [...x.variations, { key: crypto.randomUUID(), label: "", isAlternative }] } : x));

  const field = (label: string, key: "name" | "sets" | "reps" | "rest" | "badgeLabel", placeholder = "") => (
    <div>
      <label className="label-xs mb-1.5 block" htmlFor={`ex-${key}`}>{label}</label>
      <input id={`ex-${key}`} className="input" value={d?.[key] ?? ""} placeholder={placeholder} onChange={(e) => set({ [key]: e.target.value })} />
    </div>
  );

  const varList = (alt: boolean) => {
    const items = d?.variations.filter((v) => v.isAlternative === alt) ?? [];
    return (
      <div>
        <div className={`label-xs mb-1.5 ${alt ? "text-amber" : ""}`}>{alt ? "Alternatives" : "Variations"}</div>
        <div className="space-y-2">
          {items.map((v) => (
            <div key={v.key} className="flex gap-2">
              <input className="input" value={v.label} placeholder={alt ? "e.g. Incline machine press" : "e.g. Dumbbell press"} onChange={(e) => setVar(v.key, { label: e.target.value })} aria-label={alt ? "Alternative" : "Variation"} />
              <button type="button" className="icon-btn shrink-0 hover:text-danger" onClick={() => set({ variations: d!.variations.filter((x) => x.key !== v.key) })} aria-label="Remove"><IconTrash size={16} /></button>
            </div>
          ))}
          <button type="button" className="text-[13px] font-semibold text-text-2 hover:text-text" onClick={() => addVar(alt)}>
            <span className="inline-flex items-center gap-1"><IconPlus size={14} /> Add {alt ? "alternative" : "variation"}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <Modal open={draft != null} onClose={onClose} title={draft?.id ? "Edit exercise" : "New exercise"} wide>
      {d && (
        <form
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!d.name.trim()) return setError("The exercise needs a name.");
            setSaving(true);
            const err = await onSubmit(d);
            setSaving(false);
            if (err) setError(err);
            else onClose();
          }}
        >
          <ErrorBanner message={error} />
          {field("Name", "name", "Incline Bench Press")}
          <div className="grid grid-cols-3 gap-3">
            {field("Sets", "sets", "3 sets")}
            {field("Reps", "reps", "6–8 reps")}
            {field("Rest", "rest", "2 min rest")}
          </div>
          <div>
            <label className="label-xs mb-1.5 block" htmlFor="ex-num">Set counter</label>
            <input id="ex-num" type="number" min={0} max={20} className="input w-28" value={d.numSets} onChange={(e) => set({ numSets: Math.max(0, Math.min(20, Number(e.target.value) || 0)) })} />
          </div>
          <div>
            <label className="label-xs mb-1.5 block" htmlFor="ex-tip">Tip</label>
            <textarea id="ex-tip" className="input min-h-16 resize-y" value={d.tip} onChange={(e) => set({ tip: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            {field("Badge", "badgeLabel", "Compound")}
            <div className="flex gap-1.5 pb-1.5">
              {DAY_COLORS.slice(0, 6).map((c) => (
                <button key={c} type="button" aria-label={`Badge color ${c}`} onClick={() => set({ badgeColor: c })} className="size-6 rounded-full" style={{ background: c, boxShadow: d.badgeColor === c ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${c}` : undefined }} />
              ))}
            </div>
          </div>
          {varList(false)}
          {varList(true)}
          <div className="sticky bottom-0 flex justify-end gap-2 bg-surface pt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
