package com.renato.trainkt.data.db.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/** A variation of an exercise. [isAlternative] = a "gym is busy" fallback. */
@Entity(
    tableName = "exercise_variations",
    foreignKeys = [
        ForeignKey(
            entity = Exercise::class,
            parentColumns = ["id"],
            childColumns = ["exerciseId"],
            onDelete = ForeignKey.CASCADE,
        )
    ],
    indices = [Index("exerciseId")],
)
data class ExerciseVariation(
    @PrimaryKey val id: String,
    val exerciseId: String,
    val label: String,
    val isAlternative: Boolean,
    val position: Int,
)
