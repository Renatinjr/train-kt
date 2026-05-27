package com.renato.trainkt.data.model

import com.renato.trainkt.data.db.entities.Exercise
import com.renato.trainkt.data.db.entities.ExerciseVariation
import com.renato.trainkt.data.db.entities.WorkoutDay
import com.renato.trainkt.data.db.entities.WorkoutPlan
import com.renato.trainkt.data.db.entities.WorkoutSection

/**
 * Clean, position-sorted domain aggregates the UI consumes. Built from Room's
 * @Relation POJOs (see [com.renato.trainkt.data.model.toDetail]) so screens never
 * deal with unsorted relation lists.
 */
data class PlanDetail(
    val plan: WorkoutPlan,
    val days: List<DayDetail>,
) {
    val dayCount: Int get() = days.size
}

data class DayDetail(
    val day: WorkoutDay,
    val sections: List<SectionDetail>,
) {
    val exerciseCount: Int get() = sections.sumOf { it.exercises.size }
}

data class SectionDetail(
    val section: WorkoutSection,
    val exercises: List<ExerciseDetail>,
)

data class ExerciseDetail(
    val exercise: Exercise,
    val variations: List<ExerciseVariation>,
) {
    val primaryVariations: List<ExerciseVariation> get() = variations.filter { !it.isAlternative }
    val alternativeVariations: List<ExerciseVariation> get() = variations.filter { it.isAlternative }
}
