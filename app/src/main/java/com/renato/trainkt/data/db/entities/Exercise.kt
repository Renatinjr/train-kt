package com.renato.trainkt.data.db.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/** An individual exercise within a section. */
@Entity(
    tableName = "exercises",
    foreignKeys = [
        ForeignKey(
            entity = WorkoutSection::class,
            parentColumns = ["id"],
            childColumns = ["sectionId"],
            onDelete = ForeignKey.CASCADE,
        )
    ],
    indices = [Index("sectionId")],
)
data class Exercise(
    @PrimaryKey val id: String,
    val sectionId: String,
    val name: String,
    val sets: String,
    val reps: String,
    val rest: String,
    val numSets: Int,
    val tip: String,
    val badgeLabel: String,
    val badgeColor: String,
    val position: Int,
)
