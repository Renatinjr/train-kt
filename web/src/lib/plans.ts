import { and, asc, eq, inArray, notInArray, sql } from "drizzle-orm";
import type { DB } from "@/db";
import {
  exerciseVariations,
  exercises,
  workoutDays,
  workoutPlans,
  workoutSections,
} from "@/db/schema";
import type { DayDetail, PlanDetail, PlanRow } from "./models";
import { uuid } from "./uuid";

/*
 * Port of data/repository/PlanRepository.kt + data/db/dao/PlanDao.kt, scoped per user.
 *
 * Every write that may hit an existing row uses INSERT … ON CONFLICT DO UPDATE (or a plain
 * UPDATE), never INSERT OR REPLACE: REPLACE deletes the old row first and the FK cascade then
 * wipes its children (the bug fixed on Android in 68ae0dd).
 */

export class NotFoundError extends Error {
  constructor(what = "Not found") {
    super(what);
  }
}

// ---------- ownership checks ----------

function ownedPlan(db: DB, userId: string, planId: string) {
  const row = db
    .select({ id: workoutPlans.id })
    .from(workoutPlans)
    .where(and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)))
    .get();
  if (!row) throw new NotFoundError("Plan not found");
}

function ownedDay(db: DB, userId: string, dayId: string): string {
  const row = db
    .select({ planId: workoutDays.planId })
    .from(workoutDays)
    .innerJoin(workoutPlans, eq(workoutPlans.id, workoutDays.planId))
    .where(and(eq(workoutDays.id, dayId), eq(workoutPlans.userId, userId)))
    .get();
  if (!row) throw new NotFoundError("Day not found");
  return row.planId;
}

function ownedSection(db: DB, userId: string, sectionId: string): string {
  const row = db
    .select({ dayId: workoutSections.dayId })
    .from(workoutSections)
    .innerJoin(workoutDays, eq(workoutDays.id, workoutSections.dayId))
    .innerJoin(workoutPlans, eq(workoutPlans.id, workoutDays.planId))
    .where(and(eq(workoutSections.id, sectionId), eq(workoutPlans.userId, userId)))
    .get();
  if (!row) throw new NotFoundError("Section not found");
  return row.dayId;
}

export function ownedExercise(db: DB, userId: string, exerciseId: string): { sectionId: string; dayId: string } {
  const row = db
    .select({ sectionId: exercises.sectionId, dayId: workoutSections.dayId })
    .from(exercises)
    .innerJoin(workoutSections, eq(workoutSections.id, exercises.sectionId))
    .innerJoin(workoutDays, eq(workoutDays.id, workoutSections.dayId))
    .innerJoin(workoutPlans, eq(workoutPlans.id, workoutDays.planId))
    .where(and(eq(exercises.id, exerciseId), eq(workoutPlans.userId, userId)))
    .get();
  if (!row) throw new NotFoundError("Exercise not found");
  return row;
}

// ---------- reads ----------

export interface PlanSummary {
  plan: PlanRow;
  dayCount: number;
}

export function listPlanSummaries(db: DB, userId: string): PlanSummary[] {
  const rows = db
    .select({
      id: workoutPlans.id,
      name: workoutPlans.name,
      description: workoutPlans.description,
      createdAt: workoutPlans.createdAt,
      isActive: workoutPlans.isActive,
      dayCount: sql<number>`(select count(*) from ${workoutDays} where ${workoutDays.planId} = ${workoutPlans.id})`,
    })
    .from(workoutPlans)
    .where(eq(workoutPlans.userId, userId))
    .orderBy(asc(workoutPlans.createdAt))
    .all();
  return rows.map(({ dayCount, ...plan }) => ({ plan, dayCount: Number(dayCount) }));
}

/** Load days → sections → exercises → variations for the given days, sorted by position. */
function loadDays(db: DB, dayRows: (typeof workoutDays.$inferSelect)[]): DayDetail[] {
  if (dayRows.length === 0) return [];
  const dayIds = dayRows.map((d) => d.id);
  const sectionRows = db
    .select()
    .from(workoutSections)
    .where(inArray(workoutSections.dayId, dayIds))
    .orderBy(asc(workoutSections.position))
    .all();
  const sectionIds = sectionRows.map((s) => s.id);
  const exerciseRows = sectionIds.length
    ? db
        .select()
        .from(exercises)
        .where(inArray(exercises.sectionId, sectionIds))
        .orderBy(asc(exercises.position))
        .all()
    : [];
  const exerciseIds = exerciseRows.map((e) => e.id);
  const variationRows = exerciseIds.length
    ? db
        .select()
        .from(exerciseVariations)
        .where(inArray(exerciseVariations.exerciseId, exerciseIds))
        .orderBy(asc(exerciseVariations.position))
        .all()
    : [];

  return [...dayRows]
    .sort((a, b) => a.position - b.position)
    .map((day) => ({
      day,
      sections: sectionRows
        .filter((s) => s.dayId === day.id)
        .map((section) => ({
          section,
          exercises: exerciseRows
            .filter((e) => e.sectionId === section.id)
            .map((exercise) => ({
              exercise,
              variations: variationRows.filter((v) => v.exerciseId === exercise.id),
            })),
        })),
    }));
}

export function getPlanTree(db: DB, userId: string, planId: string): PlanDetail | null {
  const plan = db
    .select()
    .from(workoutPlans)
    .where(and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)))
    .get();
  if (!plan) return null;
  const days = db.select().from(workoutDays).where(eq(workoutDays.planId, plan.id)).all();
  const { userId: _omit, ...row } = plan;
  return { plan: row, days: loadDays(db, days) };
}

export function getActivePlanTree(db: DB, userId: string): PlanDetail | null {
  const plan = db
    .select({ id: workoutPlans.id })
    .from(workoutPlans)
    .where(and(eq(workoutPlans.userId, userId), eq(workoutPlans.isActive, true)))
    .get();
  return plan ? getPlanTree(db, userId, plan.id) : null;
}

export function getDayDetail(db: DB, userId: string, dayId: string): DayDetail | null {
  const row = db
    .select({ day: workoutDays })
    .from(workoutDays)
    .innerJoin(workoutPlans, eq(workoutPlans.id, workoutDays.planId))
    .where(and(eq(workoutDays.id, dayId), eq(workoutPlans.userId, userId)))
    .get();
  if (!row) return null;
  return loadDays(db, [row.day])[0];
}

// ---------- plans ----------

export function setActive(db: DB, userId: string, planId: string) {
  db.transaction((tx) => {
    ownedPlan(tx as unknown as DB, userId, planId);
    tx.update(workoutPlans).set({ isActive: false }).where(eq(workoutPlans.userId, userId)).run();
    tx.update(workoutPlans)
      .set({ isActive: true })
      .where(and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)))
      .run();
  });
}

export function deletePlan(db: DB, userId: string, planId: string) {
  db.transaction((tx) => {
    const plan = tx
      .select({ isActive: workoutPlans.isActive })
      .from(workoutPlans)
      .where(and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)))
      .get();
    if (!plan) throw new NotFoundError("Plan not found");
    tx.delete(workoutPlans).where(eq(workoutPlans.id, planId)).run();
    // Keep exactly one active plan when possible.
    if (plan.isActive) {
      const next = tx
        .select({ id: workoutPlans.id })
        .from(workoutPlans)
        .where(eq(workoutPlans.userId, userId))
        .orderBy(asc(workoutPlans.createdAt))
        .get();
      if (next) tx.update(workoutPlans).set({ isActive: true }).where(eq(workoutPlans.id, next.id)).run();
    }
  });
}

export interface DayInput {
  id?: string;
  name: string;
  dayLabel: string;
  colorHex: string;
  note: string;
}

export interface PlanInput {
  id?: string;
  name: string;
  description: string;
  days: DayInput[];
}

/**
 * Create or update a plan with its ordered list of days. Days that are missing from the input
 * are deleted (with their sections/exercises); kept days are updated in place so their
 * children survive. Returns the plan id.
 */
export function savePlanWithDays(db: DB, userId: string, input: PlanInput, activate = false): string {
  return db.transaction((tx) => {
    const t = tx as unknown as DB;
    let planId = input.id;
    if (planId) {
      ownedPlan(t, userId, planId);
      tx.update(workoutPlans)
        .set({ name: input.name, description: input.description })
        .where(eq(workoutPlans.id, planId))
        .run();
    } else {
      planId = uuid();
      const hasActive = tx
        .select({ id: workoutPlans.id })
        .from(workoutPlans)
        .where(and(eq(workoutPlans.userId, userId), eq(workoutPlans.isActive, true)))
        .get();
      tx.insert(workoutPlans)
        .values({
          id: planId,
          userId,
          name: input.name,
          description: input.description,
          createdAt: Date.now(),
          isActive: !hasActive,
        })
        .run();
    }

    const existingIds = new Set(
      tx
        .select({ id: workoutDays.id })
        .from(workoutDays)
        .where(eq(workoutDays.planId, planId))
        .all()
        .map((d) => d.id),
    );

    const keptIds: string[] = [];
    input.days.forEach((d, position) => {
      // Only reuse ids that already belong to this plan; anything else becomes a new day.
      const id = d.id && existingIds.has(d.id) ? d.id : uuid();
      keptIds.push(id);
      tx.insert(workoutDays)
        .values({ id, planId: planId!, name: d.name, dayLabel: d.dayLabel, colorHex: d.colorHex, note: d.note, position })
        .onConflictDoUpdate({
          target: workoutDays.id,
          set: { name: d.name, dayLabel: d.dayLabel, colorHex: d.colorHex, note: d.note, position },
        })
        .run();
    });

    tx.delete(workoutDays)
      .where(
        keptIds.length
          ? and(eq(workoutDays.planId, planId), notInArray(workoutDays.id, keptIds))
          : eq(workoutDays.planId, planId),
      )
      .run();

    if (activate) setActive(t, userId, planId);
    return planId;
  });
}

/** Insert a freshly parsed plan tree (from import) for this user. */
export function insertPlanTree(db: DB, userId: string, tree: PlanDetail, activate: boolean): string {
  return db.transaction((tx) => {
    const t = tx as unknown as DB;
    const hasActive = tx
      .select({ id: workoutPlans.id })
      .from(workoutPlans)
      .where(and(eq(workoutPlans.userId, userId), eq(workoutPlans.isActive, true)))
      .get();
    tx.insert(workoutPlans).values({ ...tree.plan, userId, isActive: false }).run();
    for (const d of tree.days) {
      tx.insert(workoutDays).values(d.day).run();
      for (const s of d.sections) {
        tx.insert(workoutSections).values(s.section).run();
        for (const e of s.exercises) {
          tx.insert(exercises).values(e.exercise).run();
          if (e.variations.length) tx.insert(exerciseVariations).values(e.variations).run();
        }
      }
    }
    if (activate || !hasActive) setActive(t, userId, tree.plan.id);
    return tree.plan.id;
  });
}

// ---------- sections ----------

export function addSection(db: DB, userId: string, dayId: string, title: string): string {
  ownedDay(db, userId, dayId);
  const max = db
    .select({ m: sql<number | null>`max(${workoutSections.position})` })
    .from(workoutSections)
    .where(eq(workoutSections.dayId, dayId))
    .get();
  const id = uuid();
  db.insert(workoutSections)
    .values({ id, dayId, title, position: (max?.m ?? -1) + 1 })
    .run();
  return id;
}

export function renameSection(db: DB, userId: string, sectionId: string, title: string) {
  ownedSection(db, userId, sectionId);
  db.update(workoutSections).set({ title }).where(eq(workoutSections.id, sectionId)).run();
}

export function deleteSection(db: DB, userId: string, sectionId: string) {
  ownedSection(db, userId, sectionId);
  db.delete(workoutSections).where(eq(workoutSections.id, sectionId)).run();
}

// ---------- exercises ----------

export interface ExerciseInput {
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
  variations: { label: string; isAlternative: boolean }[];
}

/** Create or update an exercise and replace its variations. Returns the exercise id. */
export function saveExercise(db: DB, userId: string, input: ExerciseInput): string {
  return db.transaction((tx) => {
    const t = tx as unknown as DB;
    ownedSection(t, userId, input.sectionId);
    const fields = {
      name: input.name,
      sets: input.sets,
      reps: input.reps,
      rest: input.rest,
      numSets: input.numSets,
      tip: input.tip,
      badgeLabel: input.badgeLabel,
      badgeColor: input.badgeColor,
    };
    let id = input.id;
    if (id) {
      const owner = ownedExercise(t, userId, id);
      if (owner.sectionId !== input.sectionId) throw new NotFoundError("Exercise not in section");
      tx.update(exercises).set(fields).where(eq(exercises.id, id)).run();
    } else {
      id = uuid();
      const max = tx
        .select({ m: sql<number | null>`max(${exercises.position})` })
        .from(exercises)
        .where(eq(exercises.sectionId, input.sectionId))
        .get();
      tx.insert(exercises)
        .values({ id, sectionId: input.sectionId, position: (max?.m ?? -1) + 1, ...fields })
        .run();
    }
    tx.delete(exerciseVariations).where(eq(exerciseVariations.exerciseId, id)).run();
    const vars = input.variations
      .filter((v) => v.label.trim() !== "")
      .map((v, position) => ({
        id: uuid(),
        exerciseId: id!,
        label: v.label.trim(),
        isAlternative: v.isAlternative,
        position,
      }));
    if (vars.length) tx.insert(exerciseVariations).values(vars).run();
    return id;
  });
}

export function deleteExercise(db: DB, userId: string, exerciseId: string) {
  ownedExercise(db, userId, exerciseId);
  db.delete(exercises).where(eq(exercises.id, exerciseId)).run();
}

/** Swap an exercise with its neighbour inside its section and renumber positions 0..n-1. */
export function moveExercise(db: DB, userId: string, exerciseId: string, up: boolean) {
  db.transaction((tx) => {
    const { sectionId } = ownedExercise(tx as unknown as DB, userId, exerciseId);
    const ids = tx
      .select({ id: exercises.id })
      .from(exercises)
      .where(eq(exercises.sectionId, sectionId))
      .orderBy(asc(exercises.position))
      .all()
      .map((r) => r.id);
    const i = ids.indexOf(exerciseId);
    const j = up ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    ids.forEach((id, position) => tx.update(exercises).set({ position }).where(eq(exercises.id, id)).run());
  });
}
