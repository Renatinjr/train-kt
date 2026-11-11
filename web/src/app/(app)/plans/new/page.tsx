import { PlanForm } from "@/components/PlanForm";

export const metadata = { title: "New plan" };

export default function NewPlanPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-[26px] font-extrabold tracking-tight">New plan</h1>
      <PlanForm />
    </div>
  );
}
