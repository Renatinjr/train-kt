package com.renato.trainkt.data.db.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/** A titled group of exercises inside a day (e.g. "Chest", "Compound Lifts"). */
@Entity(
    tableName = "workout_sections",
    foreignKeys = [
        ForeignKey(
            entity = WorkoutDay::class,
            parentColumns = ["id"],
            childColumns = ["dayId"],
            onDelete = ForeignKey.CASCADE,
        )
    ],
    indices = [Index("dayId")],
)
data class WorkoutSection(
    @PrimaryKey val id: String,
    val dayId: String,
    val title: String,
    val position: Int,
)
