import Link from "next/link";
import { ExportView } from "@/components/ExportView";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { exportFileName, exportJson } from "@/lib/import";
import { getPlanTree, listPlanSummaries } from "@/lib/plans";

export const metadata = { title: "Export" };

export default async function ExportPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const user = await requireUser();
  const db = getDb();
  const plans = listPlanSummaries(db, user.id).map((s) => s.plan);
  const { plan: requested } = await searchParams;
  const selected = plans.find((p) => p.id === requested) ?? plans.find((p) => p.isActive) ?? plans[0];
  const tree = selected ? getPlanTree(db, user.id, selected.id) : null;

  return (
    <div className="space-y-5">
      <h1 className="text-[26px] font-extrabold tracking-tight">Export plan</h1>
      {tree ? (
        <ExportView
          plans={plans.map(({ id, name }) => ({ id, name }))}
          selectedId={tree.plan.id}
          json={exportJson(tree)}
          fileName={exportFileName(tree)}
        />
      ) : (
        <p className="text-text-2">
          No plans to export yet. <Link href="/plans/new" className="text-accent hover:underline">Create one</Link>.
        </p>
      )}
    </div>
  );
}
