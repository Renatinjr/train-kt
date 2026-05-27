package com.renato.trainkt.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.renato.trainkt.data.db.entities.WorkoutDay
import com.renato.trainkt.data.db.relations.DayWithSections
import kotlinx.coroutines.flow.Flow

@Dao
interface DayDao {

    @Transaction
    @Query("SELECT * FROM workout_days WHERE id = :dayId")
    fun observeDayTree(dayId: String): Flow<DayWithSections?>

    @Transaction
    @Query("SELECT * FROM workout_days WHERE id = :dayId")
    suspend fun getDayTree(dayId: String): DayWithSections?

    @Query("SELECT * FROM workout_days WHERE planId = :planId ORDER BY position")
    suspend fun getDaysForPlan(planId: String): List<WorkoutDay>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(day: WorkoutDay)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(days: List<WorkoutDay>)

    @Update
    suspend fun update(day: WorkoutDay)

    @Update
    suspend fun updateAll(days: List<WorkoutDay>)

    @Query("DELETE FROM workout_days WHERE id = :dayId")
    suspend fun delete(dayId: String)
}
