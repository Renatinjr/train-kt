package com.renato.trainkt.data.repository

import androidx.room.withTransaction
import com.renato.trainkt.data.db.AppDatabase
import com.renato.trainkt.data.db.dao.DayDao
import com.renato.trainkt.data.db.dao.ExerciseDao
import com.renato.trainkt.data.db.dao.PlanDao
import com.renato.trainkt.data.db.dao.PlanSummary
import com.renato.trainkt.data.db.dao.SectionDao
import com.renato.trainkt.data.db.dao.VariationDao
import com.renato.trainkt.data.db.entities.Exercise
import com.renato.trainkt.data.db.entities.ExerciseVariation
import com.renato.trainkt.data.db.entities.WorkoutDay
import com.renato.trainkt.data.db.entities.WorkoutPlan
import com.renato.trainkt.data.db.entities.WorkoutSection
import com.renato.trainkt.data.model.DayDetail
import com.renato.trainkt.data.model.PlanDetail
import com.renato.trainkt.data.model.toDetail
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Single source of truth over the Room database for plans and their nested content.
 * Reads return position-sorted [PlanDetail] / [DayDetail] domain trees; multi-table
 * writes run inside [AppDatabase.withTransaction].
 */
@Singleton
class PlanRepository @Inject constructor(
    private val db: AppDatabase,
    private val planDao: PlanDao,
    private val dayDao: DayDao,
    private val sectionDao: SectionDao,
    private val exerciseDao: ExerciseDao,
    private val variationDao: VariationDao,
) {
    // --- Reads ---

    fun observePlanCount(): Flow<Int> = planDao.observePlanCount()

    fun observePlanSummaries(): Flow<List<PlanSummary>> = planDao.observePlanSummaries()

    fun observeActivePlan(): Flow<PlanDetail?> =
        planDao.observeActivePlanTree().map { it?.toDetail() }

    fun observePlanTree(planId: String): Flow<PlanDetail?> =
        planDao.observePlanTree(planId).map { it?.toDetail() }

    fun observeDay(dayId: String): Flow<DayDetail?> =
        dayDao.observeDayTree(dayId).map { it?.toDetail() }

    suspend fun getPlanDetail(planId: String): PlanDetail? =
        planDao.getPlanTree(planId)?.toDetail()

    // --- Plan / day CRUD ---

    /** Upsert a plan and reconcile its day list (deletes removed days), optionally activating it. */
    suspend fun savePlanWithDays(
        plan: WorkoutPlan,
        days: List<WorkoutDay>,
        activate: Boolean,
    ) = db.withTransaction {
        planDao.upsert(plan)
        val keep = days.map { it.id }.toSet()
        dayDao.getDaysForPlan(plan.id)
            .filter { it.id !in keep }
            .forEach { dayDao.delete(it.id) }
        dayDao.upsertAll(days)
        if (activate) planDao.setActive(plan.id)
    }

    suspend fun setActive(planId: String) = planDao.setActive(planId)

    suspend fun deletePlan(planId: String) = planDao.delete(planId)

    suspend fun planExists(planId: String): Boolean = planDao.getPlan(planId) != null

    // --- Section CRUD ---

    suspend fun addSection(dayId: String, title: String): String {
        val position = sectionDao.getSectionsForDay(dayId).size
        val section = WorkoutSection(IdGen.uuid(), dayId, title, position)
        sectionDao.upsert(section)
        return section.id
    }

    suspend fun updateSection(section: WorkoutSection) = sectionDao.update(section)

    suspend fun deleteSection(sectionId: String) = sectionDao.delete(sectionId)

    suspend fun reorderSections(sections: List<WorkoutSection>) =
        sectionDao.upsertAll(sections.mapIndexed { i, s -> s.copy(position = i) })

    // --- Exercise CRUD ---

    /** Insert/update an exercise and replace its full variation list atomically. */
    suspend fun saveExercise(
        exercise: Exercise,
        variations: List<ExerciseVariation>,
    ) = db.withTransaction {
        exerciseDao.upsert(exercise)
        variationDao.replaceForExercise(
            exercise.id,
            variations.mapIndexed { i, v -> v.copy(exerciseId = exercise.id, position = i) },
        )
    }

    suspend fun nextExercisePosition(sectionId: String): Int =
        exerciseDao.getExercisesForSection(sectionId).size

    suspend fun deleteExercise(exerciseId: String) = exerciseDao.delete(exerciseId)

    suspend fun reorderExercises(exercises: List<Exercise>) =
        exerciseDao.updateAll(exercises.mapIndexed { i, e -> e.copy(position = i) })

    // --- Import ---

    /** Persist a freshly-parsed plan tree (entities already carry generated ids/positions). */
    suspend fun insertPlanTree(tree: PlanDetail, activate: Boolean) = db.withTransaction {
        planDao.upsert(tree.plan)
        tree.days.forEach { dayDetail ->
            dayDao.upsert(dayDetail.day)
            dayDetail.sections.forEach { sectionDetail ->
                sectionDao.upsert(sectionDetail.section)
                sectionDetail.exercises.forEach { exDetail ->
                    exerciseDao.upsert(exDetail.exercise)
                    if (exDetail.variations.isNotEmpty()) {
                        variationDao.upsertAll(exDetail.variations)
                    }
                }
            }
        }
        if (activate) planDao.setActive(tree.plan.id)
    }
}
