package com.renato.trainkt.di

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore
import androidx.room.Room
import com.renato.trainkt.data.db.AppDatabase
import com.renato.trainkt.data.db.dao.DayDao
import com.renato.trainkt.data.db.dao.ExerciseDao
import com.renato.trainkt.data.db.dao.PlanDao
import com.renato.trainkt.data.db.dao.SectionDao
import com.renato.trainkt.data.db.dao.VariationDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

private val Context.scheduleDataStore: DataStore<Preferences> by preferencesDataStore(name = "schedule")

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, AppDatabase.NAME).build()

    @Provides
    fun providePlanDao(db: AppDatabase): PlanDao = db.planDao()

    @Provides
    fun provideDayDao(db: AppDatabase): DayDao = db.dayDao()

    @Provides
    fun provideSectionDao(db: AppDatabase): SectionDao = db.sectionDao()

    @Provides
    fun provideExerciseDao(db: AppDatabase): ExerciseDao = db.exerciseDao()

    @Provides
    fun provideVariationDao(db: AppDatabase): VariationDao = db.variationDao()

    @Provides
    @Singleton
    fun provideDataStore(@ApplicationContext context: Context): DataStore<Preferences> =
        context.scheduleDataStore
}
