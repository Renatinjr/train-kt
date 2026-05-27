package com.renato.trainkt.data.db.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Update
import androidx.room.Upsert
import com.renato.trainkt.data.db.entities.Exercise

@Dao
interface ExerciseDao {

    @Query("SELECT * FROM exercises WHERE sectionId = :sectionId ORDER BY position")
    suspend fun getExercisesForSection(sectionId: String): List<Exercise>

    // @Upsert so editing an exercise updates it in place instead of delete+insert
    // (which would cascade-delete its variations before they're rewritten).
    @Upsert
    suspend fun upsert(exercise: Exercise)

    @Upsert
    suspend fun upsertAll(exercises: List<Exercise>)

    @Update
    suspend fun update(exercise: Exercise)

    @Update
    suspend fun updateAll(exercises: List<Exercise>)

    @Query("DELETE FROM exercises WHERE id = :exerciseId")
    suspend fun delete(exerciseId: String)
}
