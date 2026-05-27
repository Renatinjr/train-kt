package com.renato.trainkt.data.db.dao

import androidx.room.Dao
import androidx.room.Embedded
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.renato.trainkt.data.db.entities.WorkoutPlan
import com.renato.trainkt.data.db.relations.PlanWithDays
import kotlinx.coroutines.flow.Flow

/** Lightweight row for the plan list (avoids loading the whole tree). */
data class PlanSummary(
    @Embedded val plan: WorkoutPlan,
    val dayCount: Int,
)

@Dao
interface PlanDao {

    @Query(
        "SELECT p.*, (SELECT COUNT(*) FROM workout_days d WHERE d.planId = p.id) AS dayCount " +
            "FROM workout_plans p ORDER BY p.createdAt DESC"
    )
    fun observePlanSummaries(): Flow<List<PlanSummary>>

    @Query("SELECT COUNT(*) FROM workout_plans")
    fun observePlanCount(): Flow<Int>

    @Transaction
    @Query("SELECT * FROM workout_plans WHERE id = :planId")
    fun observePlanTree(planId: String): Flow<PlanWithDays?>

    @Transaction
    @Query("SELECT * FROM workout_plans WHERE isActive = 1 LIMIT 1")
    fun observeActivePlanTree(): Flow<PlanWithDays?>

    @Query("SELECT * FROM workout_plans WHERE id = :planId")
    suspend fun getPlan(planId: String): WorkoutPlan?

    @Transaction
    @Query("SELECT * FROM workout_plans WHERE id = :planId")
    suspend fun getPlanTree(planId: String): PlanWithDays?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(plan: WorkoutPlan)

    @Update
    suspend fun update(plan: WorkoutPlan)

    @Query("DELETE FROM workout_plans WHERE id = :planId")
    suspend fun delete(planId: String)

    @Query("UPDATE workout_plans SET isActive = 0")
    suspend fun clearActiveFlags()

    @Query("UPDATE workout_plans SET isActive = 1 WHERE id = :planId")
    suspend fun markActive(planId: String)

    /** Make exactly one plan active in a single transaction. */
    @Transaction
    suspend fun setActive(planId: String) {
        clearActiveFlags()
        markActive(planId)
    }
}
