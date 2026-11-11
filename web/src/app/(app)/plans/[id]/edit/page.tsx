import { notFound } from "next/navigation";
import { PlanForm } from "@/components/PlanForm";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { getPlanTree } from "@/lib/plans";

export const metadata = { title: "Edit plan" };

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const tree = getPlanTree(getDb(), user.id, id);
  if (!tree) notFound();
  return (
    <div className="space-y-5">
      <h1 className="text-[26px] font-extrabold tracking-tight">Edit plan</h1>
      <PlanForm
        initial={{
          id: tree.plan.id,
          name: tree.plan.name,
          description: tree.plan.description,
          isActive: tree.plan.isActive,
          days: tree.days.map((d) => ({
            key: d.day.id,
            id: d.day.id,
            name: d.day.name,
            dayLabel: d.day.dayLabel,
            colorHex: d.day.colorHex,
            note: d.day.note,
          })),
        }}
      />
    </div>
  );
}
