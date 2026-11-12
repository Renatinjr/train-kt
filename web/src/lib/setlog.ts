import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { DB } from "@/db";
import { exercises, setLogs, workoutDays, workoutPlans, workoutSections } from "@/db/schema";
import { ownedExercise } from "./plans";
import { uuid } from "./uuid";

/** Completed set indices per exercise for one day of the plan on [date]. */
export function getCompletedSets(db: DB, userId: string, dayId: string, date: string): Record<string, number[]> {
  const rows = db
    .select({ exerciseId: setLogs.exerciseId, setIndex: setLogs.setIndex })
    .from(setLogs)
    .innerJoin(exercises, eq(exercises.id, setLogs.exerciseId))
    .innerJoin(workoutSections, eq(workoutSections.id, exercises.sectionId))
    .where(and(eq(setLogs.userId, userId), eq(setLogs.date, date), eq(workoutSections.dayId, dayId)))
    .all();
  const out: Record<string, number[]> = {};
  for (const r of rows) (out[r.exerciseId] ??= []).push(r.setIndex);
  return out;
}

/** Toggle a set; returns true when the set is now completed. */
export function toggleSet(db: DB, userId: string, exerciseId: string, date: string, setIndex: number): boolean {
  return db.transaction((tx) => {
    ownedExercise(tx as unknown as DB, userId, exerciseId);
    const where = and(
      eq(setLogs.exerciseId, exerciseId),
      eq(setLogs.date, date),
      eq(setLogs.setIndex, setIndex),
    );
    const existing = tx.select({ id: setLogs.id }).from(setLogs).where(where).get();
    if (existing) {
      tx.delete(setLogs).where(eq(setLogs.id, existing.id)).run();
      return false;
    }
    tx.insert(setLogs)
      .values({ id: uuid(), userId, exerciseId, date, setIndex, completedAt: Date.now() })
      .run();
    return true;
  });
}

/** Clear all of today's sets for a day (the Android "reset sets" button). */
export function resetDaySets(db: DB, userId: string, dayId: string, date: string) {
  const exerciseIds = db
    .select({ id: exercises.id })
    .from(exercises)
    .innerJoin(workoutSections, eq(workoutSections.id, exercises.sectionId))
    .innerJoin(workoutDays, eq(workoutDays.id, workoutSections.dayId))
    .innerJoin(workoutPlans, eq(workoutPlans.id, workoutDays.planId))
    .where(and(eq(workoutDays.id, dayId), eq(workoutPlans.userId, userId)))
    .all()
    .map((r) => r.id);
  if (!exerciseIds.length) return;
  db.delete(setLogs)
    .where(and(eq(setLogs.userId, userId), eq(setLogs.date, date), inArray(setLogs.exerciseId, exerciseIds)))
    .run();
}

export interface HistoryEntry {
  date: string;
  dayId: string;
  dayName: string;
  colorHex: string;
  planName: string;
  sets: number;
  exercises: number;
}

/** One row per (date, workout day) with completed set counts, newest first. */
export function getHistory(db: DB, userId: string, limit = 60): HistoryEntry[] {
  return db
    .select({
      date: setLogs.date,
      dayId: workoutDays.id,
      dayName: workoutDays.name,
      colorHex: workoutDays.colorHex,
      planName: workoutPlans.name,
      sets: sql<number>`count(*)`,
      exercises: sql<number>`count(distinct ${setLogs.exerciseId})`,
    })
    .from(setLogs)
    .innerJoin(exercises, eq(exercises.id, setLogs.exerciseId))
    .innerJoin(workoutSections, eq(workoutSections.id, exercises.sectionId))
    .innerJoin(workoutDays, eq(workoutDays.id, workoutSections.dayId))
    .innerJoin(workoutPlans, eq(workoutPlans.id, workoutDays.planId))
    .where(eq(setLogs.userId, userId))
    .groupBy(setLogs.date, workoutDays.id)
    .orderBy(desc(setLogs.date), workoutDays.position)
    .limit(limit)
    .all()
    .map((r) => ({ ...r, sets: Number(r.sets), exercises: Number(r.exercises) }));
}
