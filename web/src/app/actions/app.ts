"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { parseAuto } from "@/lib/import";
import * as plans from "@/lib/plans";
import { resetDaySets, toggleSet } from "@/lib/setlog";
import { saveSchedule } from "@/lib/settings";

/*
 * Every action: authenticate → validate with zod → call the user-scoped repository → revalidate.
 * Ownership is enforced in lib/plans.ts (NotFoundError for anything the user doesn't own).
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

const id = z.string().uuid();
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const hex = z.string().trim().max(9);
const text = (max: number) => z.string().trim().max(max);

async function run(fn: (userId: string) => void, paths: string[] = ["/"]): Promise<ActionResult> {
  const user = await requireUser();
  try {
    fn(user.id);
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? "Invalid input." };
    if (e instanceof plans.NotFoundError) return { ok: false, error: e.message };
    throw e;
  }
  for (const p of paths) revalidatePath(p, "layout");
  return { ok: true };
}

// ---------- plans ----------

export async function setActivePlanAction(planId: string) {
  return run((u) => plans.setActive(getDb(), u, id.parse(planId)));
}

export async function deletePlanAction(planId: string) {
  return run((u) => plans.deletePlan(getDb(), u, id.parse(planId)));
}

const planSchema = z.object({
  id: id.optional(),
  name: text(120).min(1, "Give the plan a name."),
  description: text(1000),
  activate: z.boolean().default(false),
  days: z
    .array(
      z.object({
        id: z.string().optional(),
        name: text(80).min(1, "Every day needs a name."),
        dayLabel: text(40),
        colorHex: hex,
        note: text(500),
      }),
    )
    .max(14),
});

export async function savePlanAction(input: z.input<typeof planSchema>): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    plans.savePlanWithDays(getDb(), user.id, parsed.data, parsed.data.activate);
  } catch (e) {
    if (e instanceof plans.NotFoundError) return { ok: false, error: e.message };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect("/plans");
}

export async function importPlanAction(raw: string, activate: boolean): Promise<ActionResult> {
  const user = await requireUser();
  if (typeof raw !== "string" || raw.length > 1_000_000) return { ok: false, error: "The file is too large." };
  const result = parseAuto(raw);
  if (!result.ok) return { ok: false, error: result.error };
  plans.insertPlanTree(getDb(), user.id, result.plan, activate === true);
  revalidatePath("/", "layout");
  redirect("/");
}

// ---------- day editing ----------

export async function addSectionAction(dayId: string, title: string) {
  return run((u) => plans.addSection(getDb(), u, id.parse(dayId), text(120).min(1).parse(title)));
}

export async function renameSectionAction(sectionId: string, title: string) {
  return run((u) => plans.renameSection(getDb(), u, id.parse(sectionId), text(120).min(1).parse(title)));
}

export async function deleteSectionAction(sectionId: string) {
  return run((u) => plans.deleteSection(getDb(), u, id.parse(sectionId)));
}

const exerciseSchema = z.object({
  id: id.optional(),
  sectionId: id,
  name: text(120).min(1, "The exercise needs a name."),
  sets: text(60),
  reps: text(60),
  rest: text(60),
  numSets: z.number().int().min(0).max(20),
  tip: text(1000),
  badgeLabel: text(40),
  badgeColor: hex,
  variations: z.array(z.object({ label: text(120), isAlternative: z.boolean() })).max(30),
});

export async function saveExerciseAction(input: z.input<typeof exerciseSchema>) {
  return run((u) => plans.saveExercise(getDb(), u, exerciseSchema.parse(input)));
}

export async function deleteExerciseAction(exerciseId: string) {
  return run((u) => plans.deleteExercise(getDb(), u, id.parse(exerciseId)));
}

export async function moveExerciseAction(exerciseId: string, up: boolean) {
  return run((u) => plans.moveExercise(getDb(), u, id.parse(exerciseId), up === true));
}

// ---------- set log ----------

export async function toggleSetAction(exerciseId: string, date: string, setIndex: number) {
  return run(
    (u) => toggleSet(getDb(), u, id.parse(exerciseId), dateKey.parse(date), z.number().int().min(0).max(19).parse(setIndex)),
    ["/history"],
  );
}

export async function resetSetsAction(dayId: string, date: string) {
  return run((u) => resetDaySets(getDb(), u, id.parse(dayId), dateKey.parse(date)), ["/history"]);
}

// ---------- schedule ----------

const scheduleSchema = z.object({
  startWeekday: z.number().int().min(1).max(7),
  hasFifthDay: z.boolean(),
});

export async function saveScheduleAction(input: z.input<typeof scheduleSchema>) {
  return run((u) => saveSchedule(getDb(), u, scheduleSchema.parse(input)));
}
