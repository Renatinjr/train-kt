import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { scheduleSettings } from "@/db/schema";
import { DEFAULT_SCHEDULE, type ScheduleSettings } from "./schedule";

/** Replaces the Android DataStore-backed ScheduleRepository with a per-user row. */
export function getSchedule(db: DB, userId: string): ScheduleSettings {
  const row = db.select().from(scheduleSettings).where(eq(scheduleSettings.userId, userId)).get();
  return row ? { startWeekday: row.startWeekday, hasFifthDay: row.hasFifthDay } : DEFAULT_SCHEDULE;
}

export function saveSchedule(db: DB, userId: string, s: ScheduleSettings) {
  db.insert(scheduleSettings)
    .values({ userId, ...s })
    .onConflictDoUpdate({ target: scheduleSettings.userId, set: s })
    .run();
}
