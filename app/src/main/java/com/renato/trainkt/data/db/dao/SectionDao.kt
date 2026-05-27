package com.renato.trainkt.data.db.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Update
import androidx.room.Upsert
import com.renato.trainkt.data.db.entities.WorkoutSection

@Dao
interface SectionDao {

    @Query("SELECT * FROM workout_sections WHERE dayId = :dayId ORDER BY position")
    suspend fun getSectionsForDay(dayId: String): List<WorkoutSection>

    @Upsert
    suspend fun upsert(section: WorkoutSection)

    @Upsert
    suspend fun upsertAll(sections: List<WorkoutSection>)

    @Update
    suspend fun update(section: WorkoutSection)

    @Query("DELETE FROM workout_sections WHERE id = :sectionId")
    suspend fun delete(sectionId: String)
}
