import { ScheduleView } from "@/components/ScheduleView";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { getActivePlanTree } from "@/lib/plans";
import { getSchedule } from "@/lib/settings";
import { getUserToday } from "@/lib/today";

export const metadata = { title: "Schedule" };

export default async function SchedulePage() {
  const user = await requireUser();
  const db = getDb();
  const plan = getActivePlanTree(db, user.id);
  const { weekday } = await getUserToday();
  return (
    <div className="space-y-5">
      <h1 className="text-[26px] font-extrabold tracking-tight">Schedule</h1>
      <ScheduleView
        initial={getSchedule(db, user.id)}
        days={(plan?.days ?? []).map((d) => ({ name: d.day.name, colorHex: d.day.colorHex }))}
        today={weekday}
      />
    </div>
  );
}
