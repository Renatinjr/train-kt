"use client";

import { useState } from "react";
import { accentColor, alternativeVariations, primaryVariations, type ExerciseDetail } from "@/lib/models";
import { IconDown, IconEdit, IconSwap, IconTrash, IconUp } from "./icons";
import { BadgePill, InfoPill } from "./ui";

/** Port of ui/components/SetCounterDots.kt */
export function SetCounterDots({
  numSets,
  completed,
  accent,
  onToggle,
}: {
  numSets: number;
  completed: number[];
  accent: string;
  onToggle: (i: number) => void;
}) {
  const done = completed.length;
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {Array.from({ length: numSets }, (_, i) => {
        const on = completed.includes(i);
        return (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            aria-label={`Set ${i + 1}${on ? " completed" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(i);
            }}
            className="flex size-10 items-center justify-center rounded-full border-2 text-[14px] font-bold transition active:scale-90"
            style={{
              borderColor: on ? accent : "var(--color-muted)",
              background: on ? accent : "transparent",
              color: on ? "#0a0a0f" : "var(--color-text-2)",
            }}
          >
            {i + 1}
          </button>
        );
      })}
      <span className="ml-1 text-[13px] font-semibold" style={{ color: done === numSets ? accent : "var(--color-text-2)" }}>
        {done}/{numSets}
      </span>
    </div>
  );
}

/** Port of ui/components/AlternativesSection.kt */
function AlternativesSection({ labels }: { labels: string[] }) {
  return (
    <div className="rounded-lg border border-amber/30 bg-amber/10 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.11em] text-amber">
        <IconSwap size={14} /> Alternatives
      </div>
      <ul className="space-y-1">
        {labels.map((l, i) => (
          <li key={i} className="text-[13px] text-text-2">{l}</li>
        ))}
      </ul>
    </div>
  );
}

/** Port of ui/components/ExerciseCard.kt — expandable in view mode, compact controls in edit mode. */
export function ExerciseCard({
  detail,
  accent,
  completed,
  onToggleSet,
  editMode,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onMove,
}: {
  detail: ExerciseDetail;
  accent: string;
  completed: number[];
  onToggleSet: (i: number) => void;
  editMode: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (up: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const e = detail.exercise;
  const primaries = primaryVariations(detail);
  const alternatives = alternativeVariations(detail);
  const allDone = e.numSets > 0 && completed.length >= e.numSets;

  return (
    <div
      className="rounded-xl border bg-surface p-3.5 transition"
      style={{ borderColor: allDone && !editMode ? `${accent}88` : "var(--color-border)" }}
    >
      <div
        className={`flex items-center gap-2 ${editMode ? "" : "cursor-pointer"}`}
        onClick={() => !editMode && setExpanded((x) => !x)}
        role={editMode ? undefined : "button"}
        aria-expanded={editMode ? undefined : expanded}
        tabIndex={editMode ? undefined : 0}
        onKeyDown={(ev) => {
          if (!editMode && (ev.key === "Enter" || ev.key === " ")) {
            ev.preventDefault();
            setExpanded((x) => !x);
          }
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold">{e.name}</div>
          {e.badgeLabel && (
            <div className="mt-1.5">
              <BadgePill label={e.badgeLabel} color={accentColor(e.badgeColor, accent)} />
            </div>
          )}
        </div>
        {editMode ? (
          <div className="flex shrink-0 items-center">
            <button type="button" className="icon-btn" disabled={!canMoveUp} onClick={() => onMove(true)} aria-label="Move up"><IconUp size={18} /></button>
            <button type="button" className="icon-btn" disabled={!canMoveDown} onClick={() => onMove(false)} aria-label="Move down"><IconDown size={18} /></button>
            <button type="button" className="icon-btn" style={{ color: accent }} onClick={onEdit} aria-label="Edit exercise"><IconEdit size={18} /></button>
            <button type="button" className="icon-btn text-danger hover:text-danger" onClick={onDelete} aria-label="Delete exercise"><IconTrash size={18} /></button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            {e.numSets > 0 && (
              <span className="text-[12px] font-semibold" style={{ color: allDone ? accent : "var(--color-muted)" }}>
                {completed.length}/{e.numSets}
              </span>
            )}
            <IconDown size={20} className={`text-text-2 transition ${expanded ? "rotate-180" : ""}`} />
          </div>
        )}
      </div>

      {!editMode && (
        <>
          {(e.sets || e.reps || e.rest) && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              <InfoPill>{e.sets}</InfoPill>
              <InfoPill>{e.reps}</InfoPill>
              <InfoPill>{e.rest}</InfoPill>
            </div>
          )}
          {expanded && (
            <div className="mt-3 space-y-3">
              {e.tip && (
                <p className="rounded-lg bg-elevated p-3 text-[13px] italic text-text-2">{e.tip}</p>
              )}
              {primaries.length > 0 && (
                <div>
                  <div className="label-xs mb-1.5">Variations</div>
                  <ul className="space-y-1">
                    {primaries.map((v) => (
                      <li key={v.id} className="flex items-center gap-2.5 text-[13px] text-text-2">
                        <span className="size-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                        {v.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {alternatives.length > 0 && <AlternativesSection labels={alternatives.map((v) => v.label)} />}
              {e.numSets > 0 && (
                <div>
                  <div className="label-xs mb-2">Sets</div>
                  <SetCounterDots numSets={e.numSets} completed={completed} accent={accent} onToggle={onToggleSet} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
