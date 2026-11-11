import Link from "next/link";
import { EmptyState } from "@/components/cards";
import { IconDownload, IconPlus, IconUpload } from "@/components/icons";
import { PlanList } from "@/components/PlanList";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { listPlanSummaries } from "@/lib/plans";

export const metadata = { title: "Plans" };

export default async function PlansPage() {
  const user = await requireUser();
  const plans = listPlanSummaries(getDb(), user.id);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-extrabold tracking-tight">Plans</h1>
        <div className="flex gap-2">
          <Link href="/import" className="btn-ghost"><IconUpload size={16} /> Import</Link>
          {plans.length > 0 && <Link href="/export" className="btn-ghost"><IconDownload size={16} /> Export</Link>}
          <Link href="/plans/new" className="btn-primary"><IconPlus size={16} /> New</Link>
        </div>
      </div>
      {plans.length ? (
        <PlanList plans={plans.map((s) => ({ ...s.plan, dayCount: s.dayCount }))} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
