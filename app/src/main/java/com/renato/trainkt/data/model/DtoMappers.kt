package com.renato.trainkt.data.model

import com.renato.trainkt.data.db.entities.Exercise
import com.renato.trainkt.data.db.entities.ExerciseVariation
import com.renato.trainkt.data.db.entities.WorkoutDay
import com.renato.trainkt.data.db.entities.WorkoutPlan
import com.renato.trainkt.data.db.entities.WorkoutSection
import com.renato.trainkt.data.repository.IdGen

private const val DEFAULT_COLOR = "#4a9eff"
private const val DEFAULT_NUM_SETS = 3

/**
 * Convert a parsed [PlanFileDto] into a fully-linked [PlanDetail] with freshly generated
 * ids, correct foreign keys and 0-based positions. The resulting plan is created inactive;
 * activation is decided by the caller. Empty fields get sensible fallbacks.
 */
fun PlanFileDto.toPlanDetail(createdAt: Long = System.currentTimeMillis()): PlanDetail {
    val planId = IdGen.uuid()
    val planEntity = WorkoutPlan(
        id = planId,
        name = plan.name.ifBlank { "Imported Plan" },
        description = plan.description,
        createdAt = createdAt,
        isActive = false,
    )

    val days = plan.days.mapIndexed { dayIndex, dayDto ->
        val dayId = IdGen.uuid()
        val dayColor = dayDto.color.ifBlank { DEFAULT_COLOR }
        val dayEntity = WorkoutDay(
            id = dayId,
            planId = planId,
            name = dayDto.name.ifBlank { "Day ${dayIndex + 1}" },
            dayLabel = dayDto.label.ifBlank { "Day ${dayIndex + 1}" },
            colorHex = dayColor,
            position = dayIndex,
            note = dayDto.note,
        )

        val sections = dayDto.sections.mapIndexed { sectionIndex, sectionDto ->
            val sectionId = IdGen.uuid()
            val sectionEntity = WorkoutSection(
                id = sectionId,
                dayId = dayId,
                title = sectionDto.title.ifBlank { "Section ${sectionIndex + 1}" },
                position = sectionIndex,
            )

            val exercises = sectionDto.exercises.mapIndexed { exIndex, exDto ->
                val exId = IdGen.uuid()
                val exEntity = Exercise(
                    id = exId,
                    sectionId = sectionId,
                    name = exDto.name.ifBlank { "Exercise ${exIndex + 1}" },
                    sets = exDto.sets,
                    reps = exDto.reps,
                    rest = exDto.rest,
                    numSets = if (exDto.numSets > 0) exDto.numSets else DEFAULT_NUM_SETS,
                    tip = exDto.tip,
                    badgeLabel = exDto.badge,
                    badgeColor = exDto.badgeColor.ifBlank { dayColor },
                    position = exIndex,
                )
                val variations = exDto.variations.mapIndexed { vIndex, vDto ->
                    ExerciseVariation(
                        id = IdGen.uuid(),
                        exerciseId = exId,
                        label = vDto.label,
                        isAlternative = vDto.isAlternative,
                        position = vIndex,
                    )
                }
                ExerciseDetail(exEntity, variations)
            }
            SectionDetail(sectionEntity, exercises)
        }
        DayDetail(dayEntity, sections)
    }
    return PlanDetail(planEntity, days)
}

/** Serialize a stored plan tree back into the import JSON shape for export. */
fun PlanDetail.toFileDto(): PlanFileDto = PlanFileDto(
    version = 1,
    plan = PlanDto(
        name = plan.name,
        description = plan.description,
        days = days.map { dayDetail ->
            DayDto(
                name = dayDetail.day.name,
                label = dayDetail.day.dayLabel,
                color = dayDetail.day.colorHex,
                note = dayDetail.day.note,
                sections = dayDetail.sections.map { sectionDetail ->
                    SectionDto(
                        title = sectionDetail.section.title,
                        exercises = sectionDetail.exercises.map { exDetail ->
                            val e = exDetail.exercise
                            ExerciseDto(
                                name = e.name,
                                badge = e.badgeLabel,
                                badgeColor = e.badgeColor,
                                sets = e.sets,
                                reps = e.reps,
                                rest = e.rest,
                                numSets = e.numSets,
                                tip = e.tip,
                                variations = exDetail.variations.map { v ->
                                    VariationDto(label = v.label, isAlternative = v.isAlternative)
                                },
                            )
                        },
                    )
                },
            )
        },
    ),
)
