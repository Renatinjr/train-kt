/**
 * Port of util/ScheduleCalc.kt. Weekdays use java.util.Calendar numbering (1 = Sun … 7 = Sat)
 * so the stored settings mean the same thing as on Android. The plan's days fill `cap`
 * consecutive weekdays from `startWeekday` (cap = 5 with the fifth day, else 4); the rest are
 * rest days. The week is rendered Monday-first.
 */

export interface ScheduleSettings {
  startWeekday: number;
  hasFifthDay: boolean;
}

export const DEFAULT_SCHEDULE: ScheduleSettings = { startWeekday: 2, hasFifthDay: true };

export interface WeekSlot {
  weekday: number;
  label: string;
  /** Index into the plan's day list, or null for a rest day. */
  dayIndex: number | null;
  isToday: boolean;
}

export const WEEKDAYS_MONDAY_FIRST = [2, 3, 4, 5, 6, 7, 1] as const;
const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const NAMES: Record<number, string> = {
  1: "Sunday",
  2: "Monday",
  3: "Tuesday",
  4: "Wednesday",
  5: "Thursday",
  6: "Friday",
  7: "Saturday",
};

/** Calendar weekday for a JS Date in the local timezone. */
export function calendarWeekday(date: Date = new Date()): number {
  return date.getDay() + 1;
}

const cap = (s: ScheduleSettings) => (s.hasFifthDay ? 5 : 4);
const offsetFor = (weekday: number, s: ScheduleSettings) => (weekday - s.startWeekday + 7) % 7;

export function week(settings: ScheduleSettings, dayCount: number, today: number): WeekSlot[] {
  const workoutCount = Math.min(dayCount, cap(settings));
  return WEEKDAYS_MONDAY_FIRST.map((weekday, i) => {
    const offset = offsetFor(weekday, settings);
    return {
      weekday,
      label: LABELS[i],
      dayIndex: offset < workoutCount ? offset : null,
      isToday: weekday === today,
    };
  });
}

export function todayDayIndex(settings: ScheduleSettings, dayCount: number, today: number): number | null {
  const offset = offsetFor(today, settings);
  return offset < Math.min(dayCount, cap(settings)) ? offset : null;
}

export function weekdayName(weekday: number): string {
  return NAMES[weekday] ?? "?";
}

/** Local date as YYYY-MM-DD (the key used for set logs). */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
