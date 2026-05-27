package com.renato.trainkt.data.db.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/** Top-level plan. The user may keep several; exactly one is [isActive] at a time. */
@Entity(tableName = "workout_plans")
data class WorkoutPlan(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val createdAt: Long,
    val isActive: Boolean,
)
