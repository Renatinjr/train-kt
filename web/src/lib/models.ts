import type {
  Exercise,
  ExerciseVariation,
  WorkoutDay,
  WorkoutPlan,
  WorkoutSection,
} from "@/db/schema";

/** Port of app/.../data/model/PlanModels.kt — a fully-linked, position-sorted plan tree. */

export type PlanRow = Omit<WorkoutPlan, "userId">;

export interface ExerciseDetail {
  exercise: Exercise;
  variations: ExerciseVariation[];
}

export interface SectionDetail {
  section: WorkoutSection;
  exercises: ExerciseDetail[];
}

export interface DayDetail {
  day: WorkoutDay;
  sections: SectionDetail[];
}

export interface PlanDetail {
  plan: PlanRow;
  days: DayDetail[];
}

export const primaryVariations = (e: ExerciseDetail) => e.variations.filter((v) => !v.isAlternative);
export const alternativeVariations = (e: ExerciseDetail) => e.variations.filter((v) => v.isAlternative);
export const dayExerciseCount = (d: DayDetail) =>
  d.sections.reduce((n, s) => n + s.exercises.length, 0);

export type ImportResult = { ok: true; plan: PlanDetail } | { ok: false; error: string };

export const DAY_COLORS = [
  "#4a9eff",
  "#2dd4a0",
  "#e0a53d",
  "#e05656",
  "#a974ff",
  "#ff7eb6",
  "#5ad1e8",
  "#9ccc4a",
  "#ff9d4a",
  "#8891a0",
] as const;

export const DEFAULT_COLOR = "#4a9eff";

/** Parse "#rrggbb" safely, falling back to [fallback] (mirrors ColorExt.toAccentColor). */
export function accentColor(hex: string | null | undefined, fallback: string = DEFAULT_COLOR): string {
  if (!hex) return fallback;
  const h = hex.trim();
  return /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(h) ? h : fallback;
}
