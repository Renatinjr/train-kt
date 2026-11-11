import { notFound } from "next/navigation";
import { DayView } from "@/components/DayView";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { getDayDetail } from "@/lib/plans";
import { getCompletedSets } from "@/lib/setlog";
import { getUserToday } from "@/lib/today";

export const metadata = { title: "Workout" };

export default async function DayPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = await params;
  const user = await requireUser();
  const db = getDb();
  const day = getDayDetail(db, user.id, dayId);
  if (!day) notFound();
  const { dateKey } = await getUserToday();
  return <DayView day={day} completed={getCompletedSets(db, user.id, dayId, dateKey)} date={dateKey} />;
}
