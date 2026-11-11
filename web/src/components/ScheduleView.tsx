"use client";

import { useState, useTransition } from "react";
import { saveScheduleAction } from "@/app/actions/app";
import { accentColor } from "@/lib/models";
import { WEEKDAYS_MONDAY_FIRST, week, weekdayName, type ScheduleSettings } from "@/lib/schedule";
import { ErrorBanner } from "./ui";

/** Port of ui/schedule/ScheduleScreen.kt — changes save immediately, like the Android toggles. */
export function ScheduleView({
  initial,
  days,
  today,
}: {
  initial: ScheduleSettings;
  days: { name: string; colorHex: string }[];
  today: number;
}) {
  const [s, setS] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = (next: ScheduleSettings) => {
    setS(next);
    start(async () => {
      const r = await saveScheduleAction(next);
      setError(r.ok ? null : r.error);
    });
  };

  const slots = week(s, days.length, today);

  return (
    <div className="space-y-5">
      <ErrorBanner message={error} />
      <div className="card p-5">
        <div className="label-xs mb-3">Cycle starts on</div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {WEEKDAYS_MONDAY_FIRST.map((wd) => {
            const on = s.startWeekday === wd;
            return (
              <button
                key={wd}
                type="button"
                aria-pressed={on}
                onClick={() => save({ ...s, startWeekday: wd })}
                className={`rounded-lg border px-2 py-2.5 text-[13px] font-semibold transition ${
                  on ? "border-accent bg-accent/15 text-accent" : "border-border text-text-2 hover:bg-elevated"
                }`}
              >
                {weekdayName(wd).slice(0, 3)}
              </button>
            );
          })}
        </div>

        <label className="mt-5 flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block font-semibold">5th training day</span>
            <span className="text-[13px] text-text-2">
              {s.hasFifthDay ? "5-day week" : "4-day week"} — up to {s.hasFifthDay ? 5 : 4} plan days are scheduled.
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={s.hasFifthDay}
            onChange={(e) => save({ ...s, hasFifthDay: e.target.checked })}
            className="peer sr-only"
          />
          <span className="relative h-7 w-12 shrink-0 rounded-full bg-elevated transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-text after:transition peer-checked:after:translate-x-5" />
        </label>
      </div>

      <div>
        <div className="label-xs mb-2.5">Week preview {pending && <span className="normal-case tracking-normal">· saving…</span>}</div>
        <ul className="card divide-y divide-border">
          {slots.map((slot) => {
            const d = slot.dayIndex != null ? days[slot.dayIndex] : undefined;
            const c = d ? accentColor(d.colorHex) : undefined;
            return (
              <li key={slot.weekday} className="flex items-center gap-3 px-4 py-3">
                <span className={`w-10 text-[13px] font-bold ${slot.isToday ? "text-text" : "text-text-2"}`}>{slot.label}</span>
                {d ? (
                  <>
                    <span className="size-2.5 rounded-full" style={{ background: c }} />
                    <span className="font-semibold" style={{ color: c }}>{d.name}</span>
                  </>
                ) : (
                  <span className="text-muted">Rest</span>
                )}
                {slot.isToday && <span className="ml-auto text-[11px] font-bold uppercase text-text-2">Today</span>}
              </li>
            );
          })}
        </ul>
        {days.length === 0 && <p className="mt-3 text-[13px] text-text-2">Activate a plan with days to see it scheduled.</p>}
        {days.length > (s.hasFifthDay ? 5 : 4) && (
          <p className="mt-3 text-[13px] text-text-2">
            Your plan has {days.length} days; only the first {s.hasFifthDay ? 5 : 4} fit in the weekly schedule.
          </p>
        )}
      </div>
    </div>
  );
}
