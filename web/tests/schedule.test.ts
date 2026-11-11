import { describe, expect, it } from "vitest";
import { todayDayIndex, week } from "@/lib/schedule";

const MON = 2, TUE = 3, FRI = 6, SAT = 7, SUN = 1;

describe("schedule (ported ScheduleCalc)", () => {
  it("5-day week from Monday", () => {
    const slots = week({ startWeekday: MON, hasFifthDay: true }, 5, TUE);
    expect(slots.map((s) => s.label)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(slots.map((s) => s.dayIndex)).toEqual([0, 1, 2, 3, 4, null, null]);
    expect(slots.find((s) => s.isToday)?.label).toBe("Tue");
  });

  it("4-day week caps workouts", () => {
    const s = { startWeekday: MON, hasFifthDay: false };
    expect(week(s, 5, MON).map((x) => x.dayIndex)).toEqual([0, 1, 2, 3, null, null, null]);
    expect(todayDayIndex(s, 5, FRI)).toBeNull();
  });

  it("start on Sunday wraps around", () => {
    const s = { startWeekday: SUN, hasFifthDay: true };
    expect(week(s, 5, SUN).map((x) => x.dayIndex)).toEqual([1, 2, 3, 4, null, null, 0]);
    expect(todayDayIndex(s, 5, SUN)).toBe(0);
    expect(todayDayIndex(s, 5, SAT)).toBeNull();
  });

  it("plans with fewer days than the cap", () => {
    const s = { startWeekday: MON, hasFifthDay: true };
    expect(week(s, 3, MON).map((x) => x.dayIndex)).toEqual([0, 1, 2, null, null, null, null]);
    expect(todayDayIndex(s, 0, MON)).toBeNull();
  });
});
