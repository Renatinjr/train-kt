package com.renato.trainkt.data.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.renato.trainkt.data.db.dao.DayDao
import com.renato.trainkt.data.db.dao.ExerciseDao
import com.renato.trainkt.data.db.dao.PlanDao
import com.renato.trainkt.data.db.dao.SectionDao
import com.renato.trainkt.data.db.dao.VariationDao
import com.renato.trainkt.data.db.entities.Exercise
import com.renato.trainkt.data.db.entities.ExerciseVariation
import com.renato.trainkt.data.db.entities.WorkoutDay
import com.renato.trainkt.data.db.entities.WorkoutPlan
import com.renato.trainkt.data.db.entities.WorkoutSection

@Database(
    entities = [
        WorkoutPlan::class,
        WorkoutDay::class,
        WorkoutSection::class,
        Exercise::class,
        ExerciseVariation::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun planDao(): PlanDao
    abstract fun dayDao(): DayDao
    abstract fun sectionDao(): SectionDao
    abstract fun exerciseDao(): ExerciseDao
    abstract fun variationDao(): VariationDao

    companion object {
        const val NAME = "trainkt.db"
    }
}
