package com.renato.trainkt.data.model

import com.renato.trainkt.data.db.relations.DayWithSections
import com.renato.trainkt.data.db.relations.ExerciseWithVariations
import com.renato.trainkt.data.db.relations.PlanWithDays
import com.renato.trainkt.data.db.relations.SectionWithExercises

// Room returns relation children unsorted — these mappers sort everything by `position`
// and produce the immutable [PlanDetail] tree the UI works with.

fun ExerciseWithVariations.toDetail(): ExerciseDetail =
    ExerciseDetail(
        exercise = exercise,
        variations = variations.sortedBy { it.position },
    )

fun SectionWithExercises.toDetail(): SectionDetail =
    SectionDetail(
        section = section,
        exercises = exercises.sortedBy { it.exercise.position }.map { it.toDetail() },
    )

fun DayWithSections.toDetail(): DayDetail =
    DayDetail(
        day = day,
        sections = sections.sortedBy { it.section.position }.map { it.toDetail() },
    )

fun PlanWithDays.toDetail(): PlanDetail =
    PlanDetail(
        plan = plan,
        days = days.sortedBy { it.day.position }.map { it.toDetail() },
    )
