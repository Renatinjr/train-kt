import Link from "next/link";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { accentColor } from "@/lib/models";
import { getHistory } from "@/lib/setlog";
import { getUserToday } from "@/lib/today";

export const metadata = { title: "History" };

function formatDate(key: string, todayKey: string) {
  if (key === todayKey) return "Today";
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

/** New on the web: completed sets per workout per day, from set_logs. */
export default async function HistoryPage() {
  const user = await requireUser();
  const entries = getHistory(getDb(), user.id);
  const { dateKey } = await getUserToday();
  const byDate = new Map<string, typeof entries>();
  for (const e of entries) byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);

  return (
    <div className="space-y-5">
      <h1 className="text-[26px] font-extrabold tracking-tight">History</h1>
      {entries.length === 0 ? (
        <div className="card p-6 text-text-2">
          No sets logged yet. Open a workout and tap the set circles — every tick is saved here.
        </div>
      ) : (
        <div className="space-y-5">
          {[...byDate].map(([date, rows]) => (
            <section key={date}>
              <h2 className="label-xs mb-2">{formatDate(date, dateKey)}</h2>
              <ul className="space-y-2">
                {rows.map((r) => {
                  const c = accentColor(r.colorHex);
                  return (
                    <li key={r.dayId}>
                      <Link href={`/day/${r.dayId}`} className="card relative flex items-center gap-3 overflow-hidden p-4 pl-5 transition hover:bg-elevated">
                        <span className="absolute inset-y-0 left-0 w-1" style={{ background: c }} />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold" style={{ color: c }}>{r.dayName}</div>
                          <div className="truncate text-[12px] text-text-2">{r.planName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[18px] font-bold">{r.sets}</div>
                          <div className="text-[11px] text-text-2">sets · {r.exercises} ex.</div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
