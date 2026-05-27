package com.renato.trainkt.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.renato.trainkt.data.db.entities.Exercise

@Dao
interface ExerciseDao {

    @Query("SELECT * FROM exercises WHERE sectionId = :sectionId ORDER BY position")
    suspend fun getExercisesForSection(sectionId: String): List<Exercise>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(exercise: Exercise)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(exercises: List<Exercise>)

    @Update
    suspend fun update(exercise: Exercise)

    @Update
    suspend fun updateAll(exercises: List<Exercise>)

    @Query("DELETE FROM exercises WHERE id = :exerciseId")
    suspend fun delete(exerciseId: String)
}
