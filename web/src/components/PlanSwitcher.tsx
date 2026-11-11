"use client";

import { useTransition } from "react";
import { setActivePlanAction } from "@/app/actions/app";

/** Port of the HomeScreen title dropdown: switch the active plan. */
export function PlanSwitcher({ plans, activeId }: { plans: { id: string; name: string }[]; activeId: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Active plan"
      className="max-w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-[26px] font-extrabold tracking-tight outline-none disabled:opacity-60"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23888896' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right center",
      }}
      value={activeId}
      disabled={pending}
      onChange={(e) => start(() => void setActivePlanAction(e.target.value))}
    >
      {plans.map((p) => (
        <option key={p.id} value={p.id} className="bg-surface text-[15px] font-normal">
          {p.name}
        </option>
      ))}
    </select>
  );
}
