package com.renato.trainkt.data.db.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/** A single training day inside a plan. */
@Entity(
    tableName = "workout_days",
    foreignKeys = [
        ForeignKey(
            entity = WorkoutPlan::class,
            parentColumns = ["id"],
            childColumns = ["planId"],
            onDelete = ForeignKey.CASCADE,
        )
    ],
    indices = [Index("planId")],
)
data class WorkoutDay(
    @PrimaryKey val id: String,
    val planId: String,
    val name: String,
    val dayLabel: String,
    val colorHex: String,
    val position: Int,
    val note: String,
)
