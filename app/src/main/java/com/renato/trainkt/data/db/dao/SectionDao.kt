package com.renato.trainkt.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.renato.trainkt.data.db.entities.WorkoutSection

@Dao
interface SectionDao {

    @Query("SELECT * FROM workout_sections WHERE dayId = :dayId ORDER BY position")
    suspend fun getSectionsForDay(dayId: String): List<WorkoutSection>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(section: WorkoutSection)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(sections: List<WorkoutSection>)

    @Update
    suspend fun update(section: WorkoutSection)

    @Query("DELETE FROM workout_sections WHERE id = :sectionId")
    suspend fun delete(sectionId: String)
}
