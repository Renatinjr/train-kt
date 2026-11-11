"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import {
  addSectionAction,
  deleteExerciseAction,
  deleteSectionAction,
  moveExerciseAction,
  renameSectionAction,
  resetSetsAction,
  saveExerciseAction,
  toggleSetAction,
  type ActionResult,
} from "@/app/actions/app";
import { accentColor, dayExerciseCount, type DayDetail } from "@/lib/models";
import { ExerciseCard } from "./ExerciseCard";
import { draftFrom, ExerciseEditor, type ExerciseDraft } from "./ExerciseEditor";
import { IconBack, IconCheck, IconEdit, IconPlus, IconRefresh, IconTrash } from "./icons";
import { ConfirmDialog, ErrorBanner, TextInputDialog } from "./ui";

type Completed = Record<string, number[]>;

/** Port of ui/day/DayScreen.kt + DayViewModel.kt; set taps persist to set_logs for [date]. */
export function DayView({ day, completed, date }: { day: DayDetail; completed: Completed; date: string }) {
  const accent = accentColor(day.day.colorHex);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const [editor, setEditor] = useState<ExerciseDraft | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; message: string; run: () => Promise<ActionResult> } | null>(null);

  const [optimistic, applyOptimistic] = useOptimistic(
    completed,
    (state: Completed, a: { exerciseId: string; index: number } | "reset") => {
      if (a === "reset") return {};
      const cur = state[a.exerciseId] ?? [];
      return {
        ...state,
        [a.exerciseId]: cur.includes(a.index) ? cur.filter((x) => x !== a.index) : [...cur, a.index],
      };
    },
  );

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      setError(r.ok ? null : r.error);
    });

  const toggle = (exerciseId: string, index: number) =>
    start(async () => {
      applyOptimistic({ exerciseId, index });
      const r = await toggleSetAction(exerciseId, date, index);
      if (!r.ok) setError(r.error);
    });

  const totalSets = day.sections.reduce((n, s) => n + s.exercises.reduce((m, e) => m + e.exercise.numSets, 0), 0);
  const doneSets = Object.values(optimistic).reduce((n, v) => n + v.length, 0);
  const exerciseCount = dayExerciseCount(day);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1">
        <Link href="/" className="icon-btn -ml-2" aria-label="Back"><IconBack size={20} /></Link>
        <span className="flex-1" />
        {!editMode && doneSets > 0 && (
          <button
            type="button"
            className="icon-btn"
            title="Reset today's sets"
            aria-label="Reset today's sets"
            onClick={() =>
              setConfirm({
                title: "Reset sets?",
                message: "Clear every set you've ticked for this workout today.",
                run: async () => {
                  applyOptimistic("reset");
                  return resetSetsAction(day.day.id, date);
                },
              })
            }
          >
            <IconRefresh size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setEditMode((x) => !x)}
          className={`btn px-3 ${editMode ? "bg-amber text-[#1a1205]" : "border border-border text-text-2 hover:text-text"}`}
        >
          {editMode ? <><IconCheck size={16} /> Done</> : <><IconEdit size={16} /> Edit</>}
        </button>
      </div>

      <ErrorBanner message={error} />

      <div
        className="rounded-2xl p-5"
        style={{
          background: `${accent}1f`,
          border: editMode ? "2px solid var(--color-amber)" : `1px solid ${accent}99`,
        }}
      >
        <div className="label-xs" style={{ color: accent }}>{day.day.dayLabel}</div>
        <h1 className="mt-1.5 text-[34px] font-extrabold leading-tight tracking-tight">{day.day.name}</h1>
        <div className={`mt-2 text-[13px] ${editMode ? "text-amber" : "text-text-2"}`}>
          {exerciseCount} exercises{editMode ? " · editing" : totalSets ? ` · ${doneSets}/${totalSets} sets today` : ""}
        </div>
        {!editMode && totalSets > 0 && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/30">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (doneSets / totalSets) * 100)}%`, background: accent }} />
          </div>
        )}
        {day.day.note && <p className="mt-2 text-[13px] text-text-2">{day.day.note}</p>}
      </div>

      {day.sections.map((s) => (
        <section key={s.section.id} className="space-y-3">
          <div className="flex items-center gap-1">
            <h2 className="flex-1 text-[20px] font-bold">{s.section.title}</h2>
            {editMode && (
              <>
                <button type="button" className="icon-btn" aria-label="Rename section" onClick={() => setRenaming({ id: s.section.id, title: s.section.title })}><IconEdit size={18} /></button>
                <button
                  type="button"
                  className="icon-btn text-danger hover:text-danger"
                  aria-label="Delete section"
                  onClick={() =>
                    setConfirm({
                      title: "Delete section?",
                      message: `"${s.section.title}" and its ${s.exercises.length} exercise(s) will be deleted.`,
                      run: () => deleteSectionAction(s.section.id),
                    })
                  }
                >
                  <IconTrash size={18} />
                </button>
              </>
            )}
          </div>
          {s.exercises.map((ex, i) => (
            <ExerciseCard
              key={ex.exercise.id}
              detail={ex}
              accent={accent}
              completed={optimistic[ex.exercise.id] ?? []}
              onToggleSet={(idx) => toggle(ex.exercise.id, idx)}
              editMode={editMode}
              canMoveUp={i > 0}
              canMoveDown={i < s.exercises.length - 1}
              onEdit={() => setEditor(draftFrom(s.section.id, ex, day.day.colorHex))}
              onDelete={() =>
                setConfirm({
                  title: "Delete exercise?",
                  message: `"${ex.exercise.name}" will be deleted.`,
                  run: () => deleteExerciseAction(ex.exercise.id),
                })
              }
              onMove={(up) => run(() => moveExerciseAction(ex.exercise.id, up))}
            />
          ))}
          {editMode && (
            <button type="button" className="btn w-full border border-dashed border-border text-text-2 hover:bg-surface hover:text-text" onClick={() => setEditor(draftFrom(s.section.id, null, day.day.colorHex))}>
              <IconPlus size={18} /> Add exercise
            </button>
          )}
        </section>
      ))}

      {editMode ? (
        <button type="button" className="btn w-full border border-dashed border-amber/50 text-amber hover:bg-amber/10" onClick={() => setAddingSection(true)}>
          <IconPlus size={18} /> New section
        </button>
      ) : (
        day.sections.length === 0 && (
          <p className="text-[13px] text-text-2">No exercises yet. Tap <strong>Edit</strong> to add sections and exercises.</p>
        )
      )}

      <ExerciseEditor
        draft={editor}
        onClose={() => setEditor(null)}
        onSubmit={async (d) => {
          const r = await saveExerciseAction({
            id: d.id,
            sectionId: d.sectionId,
            name: d.name,
            sets: d.sets,
            reps: d.reps,
            rest: d.rest,
            numSets: d.numSets,
            tip: d.tip,
            badgeLabel: d.badgeLabel,
            badgeColor: d.badgeColor,
            variations: d.variations.map(({ label, isAlternative }) => ({ label, isAlternative })),
          });
          return r.ok ? null : r.error;
        }}
      />
      <TextInputDialog
        open={addingSection}
        title="New section"
        label="Section title"
        initial=""
        onClose={() => setAddingSection(false)}
        onSubmit={(t) => run(() => addSectionAction(day.day.id, t))}
      />
      <TextInputDialog
        open={renaming != null}
        title="Rename section"
        label="Section title"
        initial={renaming?.title ?? ""}
        onClose={() => setRenaming(null)}
        onSubmit={(t) => renaming && run(() => renameSectionAction(renaming.id, t))}
      />
      <ConfirmDialog
        open={confirm != null}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        confirmLabel={confirm?.title.startsWith("Reset") ? "Reset" : "Delete"}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && run(confirm.run)}
      />
    </div>
  );
}
