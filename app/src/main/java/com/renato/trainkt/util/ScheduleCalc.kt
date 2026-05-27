package com.renato.trainkt.util

import com.renato.trainkt.data.repository.ScheduleSettings
import java.util.Calendar

/** A position in the rendered week strip (Monday-first). [dayIndex] == null means a rest day. */
data class WeekSlot(
    val weekdayCalendar: Int, // java.util.Calendar weekday (1=Sun … 7=Sat)
    val label: String,        // "Mon" … "Sun"
    val dayIndex: Int?,       // index into the plan's day list, or null for rest
    val isToday: Boolean,
)

/**
 * Pure week-schedule math. The plan's days are laid out for [cap] consecutive weekdays
 * starting at [ScheduleSettings.startWeekday]; remaining weekdays are rest. `cap` is 5 when
 * [ScheduleSettings.hasFifthDay] else 4 (the "4-day vs 5-day week" toggle).
 */
object ScheduleCalc {

    private val mondayFirst = listOf(
        Calendar.MONDAY, Calendar.TUESDAY, Calendar.WEDNESDAY, Calendar.THURSDAY,
        Calendar.FRIDAY, Calendar.SATURDAY, Calendar.SUNDAY,
    )
    private val labels = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")

    fun todayWeekday(): Int = Calendar.getInstance().get(Calendar.DAY_OF_WEEK)

    private fun offsetFor(weekday: Int, settings: ScheduleSettings): Int =
        (weekday - settings.startWeekday + 7) % 7

    /** Build the 7 Monday-first slots for the week, mapping weekdays to plan day indices. */
    fun week(settings: ScheduleSettings, dayCount: Int, today: Int = todayWeekday()): List<WeekSlot> {
        val cap = if (settings.hasFifthDay) 5 else 4
        val workoutCount = minOf(dayCount, cap)
        return mondayFirst.mapIndexed { i, weekday ->
            val offset = offsetFor(weekday, settings)
            val dayIndex = if (offset < workoutCount) offset else null
            WeekSlot(
                weekdayCalendar = weekday,
                label = labels[i],
                dayIndex = dayIndex,
                isToday = weekday == today,
            )
        }
    }

    /** The plan day index scheduled for [today], or null on a rest day. */
    fun todayDayIndex(settings: ScheduleSettings, dayCount: Int, today: Int = todayWeekday()): Int? {
        val cap = if (settings.hasFifthDay) 5 else 4
        val offset = offsetFor(today, settings)
        return if (offset < minOf(dayCount, cap)) offset else null
    }

    /** Human label for a Calendar weekday value, used by the schedule picker. */
    fun weekdayName(weekday: Int): String = when (weekday) {
        Calendar.SUNDAY -> "Sunday"
        Calendar.MONDAY -> "Monday"
        Calendar.TUESDAY -> "Tuesday"
        Calendar.WEDNESDAY -> "Wednesday"
        Calendar.THURSDAY -> "Thursday"
        Calendar.FRIDAY -> "Friday"
        Calendar.SATURDAY -> "Saturday"
        else -> "?"
    }

    val allWeekdaysMondayFirst: List<Int> get() = mondayFirst
}
