import Link from "next/link";
import { DayCard, EmptyState, WeekStrip, type WeekCell } from "@/components/cards";
import { IconPlus, IconUpload } from "@/components/icons";
import { PlanSwitcher } from "@/components/PlanSwitcher";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { accentColor, dayExerciseCount } from "@/lib/models";
import { getActivePlanTree, listPlanSummaries } from "@/lib/plans";
import { todayDayIndex, week } from "@/lib/schedule";
import { getSchedule } from "@/lib/settings";
import { getUserToday } from "@/lib/today";

/** Port of ui/home/HomeScreen.kt */
export default async function HomePage() {
  const user = await requireUser();
  const db = getDb();
  const summaries = listPlanSummaries(db, user.id);
  if (summaries.length === 0) return <EmptyState />;

  const plan = getActivePlanTree(db, user.id);
  const settings = getSchedule(db, user.id);
  const { weekday } = await getUserToday();
  const days = plan?.days ?? [];

  const cells: WeekCell[] = week(settings, days.length, weekday).map((slot) => {
    const d = slot.dayIndex != null ? days[slot.dayIndex] : undefined;
    return {
      label: slot.label,
      workoutName: d?.day.name ?? null,
      accent: d?.day.colorHex ?? null,
      isToday: slot.isToday,
      dayId: d?.day.id ?? null,
    };
  });
  const todayIdx = todayDayIndex(settings, days.length, weekday);
  const today = todayIdx != null ? days[todayIdx] : undefined;

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="label-xs mb-1">Active plan</div>
          {plan ? (
            summaries.length > 1 ? (
              <PlanSwitcher plans={summaries.map((s) => s.plan)} activeId={plan.plan.id} />
            ) : (
              <h1 className="truncate text-[26px] font-extrabold tracking-tight">{plan.plan.name}</h1>
            )
          ) : (
            <h1 className="text-[26px] font-extrabold">No active plan</h1>
          )}
          {plan?.plan.description && <p className="mt-1 text-[13px] text-text-2">{plan.plan.description}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/import" className="btn-ghost px-3" aria-label="Import a plan" title="Import">
            <IconUpload size={18} />
          </Link>
          <Link href="/plans/new" className="btn-primary px-3" aria-label="New plan" title="New plan">
            <IconPlus size={18} />
          </Link>
        </div>
      </div>

      {!plan ? (
        <p className="text-text-2">
          Pick an active plan on the <Link href="/plans" className="text-accent hover:underline">Plans</Link> page.
        </p>
      ) : (
        <>
          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="label-xs">This week</h2>
              <Link href="/schedule" className="text-[12px] font-semibold text-text-2 hover:text-text">
                Edit schedule
              </Link>
            </div>
            <WeekStrip cells={cells} />
          </section>

          <section>
            <h2 className="label-xs mb-2.5">Today</h2>
            {today ? (
              <Link
                href={`/day/${today.day.id}`}
                className="block rounded-[14px] border p-5 transition hover:brightness-125"
                style={{
                  background: `${accentColor(today.day.colorHex)}1f`,
                  borderColor: accentColor(today.day.colorHex),
                }}
              >
                <div className="label-xs" style={{ color: accentColor(today.day.colorHex) }}>
                  {today.day.dayLabel}
                </div>
                <div className="mt-1.5 text-[26px] font-extrabold">{today.day.name}</div>
                <div className="mt-1.5 text-[13px] text-text-2">
                  {dayExerciseCount(today)} exercises · Start workout →
                </div>
              </Link>
            ) : (
              <div className="card p-5 text-text-2">Rest day — no workout scheduled.</div>
            )}
          </section>

          <section>
            <h2 className="label-xs mb-2.5">All days</h2>
            {days.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {days.map((d) => (
                  <DayCard
                    key={d.day.id}
                    id={d.day.id}
                    name={d.day.name}
                    dayLabel={d.day.dayLabel}
                    color={d.day.colorHex}
                    exerciseCount={dayExerciseCount(d)}
                    isToday={d.day.id === today?.day.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-text-2">
                This plan has no days yet.{" "}
                <Link href={`/plans/${plan.plan.id}/edit`} className="text-accent hover:underline">
                  Edit it
                </Link>{" "}
                to add some.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
