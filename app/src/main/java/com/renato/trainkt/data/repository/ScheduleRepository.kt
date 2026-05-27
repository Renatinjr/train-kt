package com.renato.trainkt.data.repository

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

/** Persisted week-schedule settings (DataStore Preferences). */
data class ScheduleSettings(
    val startWeekday: Int = DEFAULT_START_WEEKDAY, // java.util.Calendar: 1=Sun … 7=Sat
    val hasFifthDay: Boolean = true,
) {
    companion object {
        const val DEFAULT_START_WEEKDAY = 2 // Monday
    }
}

@Singleton
class ScheduleRepository @Inject constructor(
    private val dataStore: DataStore<Preferences>,
) {
    private val startWeekdayKey = intPreferencesKey("start_weekday")
    private val hasFifthDayKey = booleanPreferencesKey("has_fifth_day")

    val settings: Flow<ScheduleSettings> = dataStore.data.map { prefs ->
        ScheduleSettings(
            startWeekday = prefs[startWeekdayKey] ?: ScheduleSettings.DEFAULT_START_WEEKDAY,
            hasFifthDay = prefs[hasFifthDayKey] ?: true,
        )
    }

    suspend fun setStartWeekday(weekday: Int) {
        dataStore.edit { it[startWeekdayKey] = weekday }
    }

    suspend fun setHasFifthDay(enabled: Boolean) {
        dataStore.edit { it[hasFifthDayKey] = enabled }
    }
}
