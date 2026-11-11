import Link from "next/link";
import { accentColor } from "@/lib/models";
import { IconPlus, IconUpload } from "./icons";

/** Port of ui/components/WeekStrip.kt */
export interface WeekCell {
  label: string;
  workoutName: string | null;
  accent: string | null;
  isToday: boolean;
  dayId: string | null;
}

export function WeekStrip({ cells }: { cells: WeekCell[] }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {cells.map((c) => {
        const accent = c.accent ? accentColor(c.accent) : null;
        const inner = (
          <div
            className={`flex h-[74px] flex-col items-center justify-between rounded-xl border px-1 py-2 transition ${
              c.dayId ? "hover:brightness-125" : ""
            }`}
            style={{
              background: accent ? `${accent}1f` : "var(--color-surface)",
              borderColor: c.isToday ? (accent ?? "var(--color-text-2)") : "var(--color-border)",
              borderWidth: c.isToday ? 2 : 1,
            }}
          >
            <span className={`text-[11px] font-bold ${c.isToday ? "text-text" : "text-text-2"}`}>{c.label}</span>
            {accent ? (
              <span className="size-2 rounded-full" style={{ background: accent }} />
            ) : (
              <span className="text-[10px] text-muted">Rest</span>
            )}
            <span
              className="w-full truncate text-center text-[10px] font-semibold"
              style={{ color: accent ?? "transparent" }}
              title={c.workoutName ?? undefined}
            >
              {c.workoutName ?? "·"}
            </span>
          </div>
        );
        return c.dayId ? (
          <Link key={c.label} href={`/day/${c.dayId}`} aria-label={`${c.label}: ${c.workoutName}`}>
            {inner}
          </Link>
        ) : (
          <div key={c.label}>{inner}</div>
        );
      })}
    </div>
  );
}

/** Port of ui/components/DayCard.kt */
export function DayCard({
  id,
  name,
  dayLabel,
  color,
  exerciseCount,
  isToday,
}: {
  id: string;
  name: string;
  dayLabel: string;
  color: string;
  exerciseCount: number;
  isToday: boolean;
}) {
  const accent = accentColor(color);
  return (
    <Link
      href={`/day/${id}`}
      className="group relative block overflow-hidden rounded-[14px] border bg-surface p-4 transition hover:bg-elevated"
      style={{ borderColor: isToday ? accent : "var(--color-border)" }}
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />
      <div className="flex items-center justify-between gap-2">
        <span className="label-xs truncate" style={{ color: accent }}>
          {dayLabel}
        </span>
        {isToday && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: accent, color: "#0a0a0f" }}>
            Today
          </span>
        )}
      </div>
      <div className="mt-2 truncate text-[18px] font-bold">{name}</div>
      <div className="mt-1 text-[13px] text-text-2">
        {exerciseCount} exercise{exerciseCount === 1 ? "" : "s"}
      </div>
    </Link>
  );
}

/** Port of ui/components/EmptyState.kt */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl border border-border bg-surface text-[40px]">
        🏋️
      </div>
      <h1 className="text-[26px] font-extrabold">No workout plans yet</h1>
      <p className="mt-2 max-w-sm text-[15px] text-text-2">
        Build a plan from scratch, or import one as JSON or plain text — including files exported from the Android app.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/plans/new" className="btn-primary">
          <IconPlus size={18} /> Create a plan
        </Link>
        <Link href="/import" className="btn-ghost">
          <IconUpload size={18} /> Import
        </Link>
      </div>
    </div>
  );
}
