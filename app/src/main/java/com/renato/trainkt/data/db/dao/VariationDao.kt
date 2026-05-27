package com.renato.trainkt.data.db.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import com.renato.trainkt.data.db.entities.ExerciseVariation

@Dao
interface VariationDao {

    @Upsert
    suspend fun upsertAll(variations: List<ExerciseVariation>)

    @Query("DELETE FROM exercise_variations WHERE exerciseId = :exerciseId")
    suspend fun deleteForExercise(exerciseId: String)

    /** Replace all variations of an exercise (used when saving the edit sheet). */
    @androidx.room.Transaction
    suspend fun replaceForExercise(exerciseId: String, variations: List<ExerciseVariation>) {
        deleteForExercise(exerciseId)
        if (variations.isNotEmpty()) upsertAll(variations)
    }
}
