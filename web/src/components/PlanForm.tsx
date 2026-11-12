"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { savePlanAction } from "@/app/actions/app";
import { DAY_COLORS } from "@/lib/models";
import { IconDown, IconPlus, IconTrash, IconUp } from "./icons";
import { ColorPickerRow, ErrorBanner } from "./ui";
import { uuid } from "@/lib/uuid";

export interface DayDraft {
  key: string;
  id?: string;
  name: string;
  dayLabel: string;
  colorHex: string;
  note: string;
}

/** Port of ui/plan/CreateEditPlanScreen.kt + CreateEditPlanViewModel.kt */
export function PlanForm({
  initial,
}: {
  initial?: { id: string; name: string; description: string; isActive: boolean; days: DayDraft[] };
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [days, setDays] = useState<DayDraft[]>(initial?.days ?? []);
  const [activate, setActivate] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const update = (key: string, patch: Partial<DayDraft>) =>
    setDays((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const move = (i: number, dir: -1 | 1) =>
    setDays((ds) => {
      const next = [...ds];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });
  const addDay = () =>
    setDays((ds) => [
      ...ds,
      {
        key: uuid(),
        name: "",
        dayLabel: `Day ${ds.length + 1}`,
        colorHex: DAY_COLORS[ds.length % DAY_COLORS.length],
        note: "",
      },
    ]);

  const save = () => {
    if (!name.trim()) return setError("Give the plan a name.");
    setError(null);
    start(async () => {
      const r = await savePlanAction({
        id: initial?.id,
        name,
        description,
        activate: initial ? false : activate,
        days: days.map((d, i) => ({
          id: d.id,
          name: d.name.trim() || `Day ${i + 1}`,
          dayLabel: d.dayLabel.trim() || `Day ${i + 1}`,
          colorHex: d.colorHex,
          note: d.note,
        })),
      });
      // On success the action redirects; we only get here on error.
      if (r && !r.ok) setError(r.error);
    });
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <ErrorBanner message={error} />
      <div className="card space-y-4 p-5">
        <div>
          <label htmlFor="plan-name" className="label-xs mb-1.5 block">Plan name</label>
          <input id="plan-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Push Pull Legs" autoFocus={!initial} />
        </div>
        <div>
          <label htmlFor="plan-desc" className="label-xs mb-1.5 block">Description</label>
          <textarea id="plan-desc" className="input min-h-20 resize-y" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
        </div>
        {!initial && (
          <label className="flex items-center gap-2 text-[14px] text-text-2">
            <input type="checkbox" checked={activate} onChange={(e) => setActivate(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
            Make this the active plan
          </label>
        )}
      </div>

      <div>
        <h2 className="label-xs mb-2.5">Training days</h2>
        <div className="space-y-3">
          {days.map((d, i) => (
            <div key={d.key} className="card relative overflow-hidden p-4 pl-5">
              <span className="absolute inset-y-0 left-0 w-1" style={{ background: d.colorHex }} />
              <div className="flex items-center gap-1">
                <span className="label-xs flex-1" style={{ color: d.colorHex }}>Day {i + 1}</span>
                <button type="button" className="icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move day up"><IconUp size={18} /></button>
                <button type="button" className="icon-btn" disabled={i === days.length - 1} onClick={() => move(i, 1)} aria-label="Move day down"><IconDown size={18} /></button>
                <button type="button" className="icon-btn hover:text-danger" onClick={() => setDays((ds) => ds.filter((x) => x.key !== d.key))} aria-label="Remove day"><IconTrash size={18} /></button>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <input className="input" placeholder={`Name (e.g. Push)`} value={d.name} onChange={(e) => update(d.key, { name: e.target.value })} aria-label="Day name" />
                <input className="input" placeholder="Label (e.g. Day 1)" value={d.dayLabel} onChange={(e) => update(d.key, { dayLabel: e.target.value })} aria-label="Day label" />
              </div>
              <input className="input mt-3" placeholder="Note (optional)" value={d.note} onChange={(e) => update(d.key, { note: e.target.value })} aria-label="Day note" />
              <div className="mt-3">
                <ColorPickerRow value={d.colorHex} onChange={(c) => update(d.key, { colorHex: c })} />
              </div>
              {d.id && (
                <p className="mt-3 text-[12px] text-muted">Removing a saved day also deletes its sections and exercises.</p>
              )}
            </div>
          ))}
          <button type="button" onClick={addDay} className="btn w-full border border-dashed border-border text-text-2 hover:bg-surface hover:text-text">
            <IconPlus size={18} /> Add day
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link href="/plans" className="btn-ghost">Cancel</Link>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save changes" : "Create plan"}
        </button>
      </div>
    </form>
  );
}
