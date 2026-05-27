package com.renato.trainkt.data.db.relations

import androidx.room.Embedded
import androidx.room.Relation
import com.renato.trainkt.data.db.entities.Exercise
import com.renato.trainkt.data.db.entities.ExerciseVariation
import com.renato.trainkt.data.db.entities.WorkoutDay
import com.renato.trainkt.data.db.entities.WorkoutPlan
import com.renato.trainkt.data.db.entities.WorkoutSection

/**
 * Nested @Relation POJOs that let Room hydrate the whole Plan → Day → Section →
 * Exercise → Variation tree in one query. Lists arrive unsorted; callers sort by
 * `position` (see PlanRepository / mappers).
 */
data class ExerciseWithVariations(
    @Embedded val exercise: Exercise,
    @Relation(parentColumn = "id", entityColumn = "exerciseId")
    val variations: List<ExerciseVariation>,
)

data class SectionWithExercises(
    @Embedded val section: WorkoutSection,
    @Relation(entity = Exercise::class, parentColumn = "id", entityColumn = "sectionId")
    val exercises: List<ExerciseWithVariations>,
)

data class DayWithSections(
    @Embedded val day: WorkoutDay,
    @Relation(entity = WorkoutSection::class, parentColumn = "id", entityColumn = "dayId")
    val sections: List<SectionWithExercises>,
)

data class PlanWithDays(
    @Embedded val plan: WorkoutPlan,
    @Relation(entity = WorkoutDay::class, parentColumn = "id", entityColumn = "planId")
    val days: List<DayWithSections>,
)
