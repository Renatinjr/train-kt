import { z } from "zod";
import type { DayDetail, ExerciseDetail, PlanDetail, SectionDetail } from "../models";
import { DEFAULT_COLOR } from "../models";

/**
 * Port of app/.../data/model/ImportDto.kt + DtoMappers.kt. The JSON shape is identical to the
 * Android app's so files move freely between the two. Every field has a default; unknown keys
 * are ignored.
 */

const str = z.string().catch("").default("");

export const VariationDto = z.object({
  label: str,
  isAlternative: z.boolean().catch(false).default(false),
});

export const ExerciseDto = z.object({
  name: str,
  badge: str,
  badgeColor: str,
  sets: str,
  reps: str,
  rest: str,
  numSets: z.number().int().catch(0).default(0),
  tip: str,
  variations: z.array(VariationDto).default([]),
});

export const SectionDto = z.object({
  title: str,
  exercises: z.array(ExerciseDto).default([]),
});

export const DayDto = z.object({
  name: str,
  label: str,
  color: str,
  note: str,
  sections: z.array(SectionDto).default([]),
});

export const PlanDto = z.object({
  name: str,
  description: str,
  days: z.array(DayDto).default([]),
});

export const PlanFileDto = z.object({
  version: z.number().int().default(1),
  plan: PlanDto,
});

export type PlanFileDto = z.infer<typeof PlanFileDto>;
export type PlanFileInput = z.input<typeof PlanFileDto>;

const DEFAULT_NUM_SETS = 3;
const orIfBlank = (v: string, fallback: string) => (v.trim() === "" ? fallback : v);

/** Convert a parsed DTO into a linked plan tree with fresh ids and 0-based positions (inactive). */
export function toPlanDetail(dto: PlanFileDto, createdAt: number = Date.now()): PlanDetail {
  const planId = crypto.randomUUID();
  const days: DayDetail[] = dto.plan.days.map((d, dayIndex) => {
    const dayId = crypto.randomUUID();
    const dayColor = orIfBlank(d.color, DEFAULT_COLOR);
    const sections: SectionDetail[] = d.sections.map((s, sectionIndex) => {
      const sectionId = crypto.randomUUID();
      const exercises: ExerciseDetail[] = s.exercises.map((e, exIndex) => {
        const exId = crypto.randomUUID();
        return {
          exercise: {
            id: exId,
            sectionId,
            name: orIfBlank(e.name, `Exercise ${exIndex + 1}`),
            sets: e.sets,
            reps: e.reps,
            rest: e.rest,
            numSets: e.numSets > 0 ? e.numSets : DEFAULT_NUM_SETS,
            tip: e.tip,
            badgeLabel: e.badge,
            badgeColor: orIfBlank(e.badgeColor, dayColor),
            position: exIndex,
          },
          variations: e.variations.map((v, vIndex) => ({
            id: crypto.randomUUID(),
            exerciseId: exId,
            label: v.label,
            isAlternative: v.isAlternative,
            position: vIndex,
          })),
        };
      });
      return {
        section: {
          id: sectionId,
          dayId,
          title: orIfBlank(s.title, `Section ${sectionIndex + 1}`),
          position: sectionIndex,
        },
        exercises,
      };
    });
    return {
      day: {
        id: dayId,
        planId,
        name: orIfBlank(d.name, `Day ${dayIndex + 1}`),
        dayLabel: orIfBlank(d.label, `Day ${dayIndex + 1}`),
        colorHex: dayColor,
        position: dayIndex,
        note: d.note,
      },
      sections,
    };
  });

  return {
    plan: {
      id: planId,
      name: orIfBlank(dto.plan.name, "Imported Plan"),
      description: dto.plan.description,
      createdAt,
      isActive: false,
    },
    days,
  };
}

/** Serialize a stored plan tree back into the import JSON shape. */
export function toFileDto(p: PlanDetail): PlanFileDto {
  return {
    version: 1,
    plan: {
      name: p.plan.name,
      description: p.plan.description,
      days: p.days.map((d) => ({
        name: d.day.name,
        label: d.day.dayLabel,
        color: d.day.colorHex,
        note: d.day.note,
        sections: d.sections.map((s) => ({
          title: s.section.title,
          exercises: s.exercises.map(({ exercise: e, variations }) => ({
            name: e.name,
            badge: e.badgeLabel,
            badgeColor: e.badgeColor,
            sets: e.sets,
            reps: e.reps,
            rest: e.rest,
            numSets: e.numSets,
            tip: e.tip,
            variations: variations.map((v) => ({ label: v.label, isAlternative: v.isAlternative })),
          })),
        })),
      })),
    },
  };
}
