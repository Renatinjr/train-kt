"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deletePlanAction, setActivePlanAction } from "@/app/actions/app";
import { IconDownload, IconEdit, IconStar, IconTrash } from "./icons";
import { ConfirmDialog, ErrorBanner } from "./ui";

interface Row {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  dayCount: number;
}

/** Port of ui/plan/PlanListScreen.kt */
export function PlanList({ plans }: { plans: Row[] }) {
  const [pending, start] = useTransition();
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      setError(r.ok ? null : (r.error ?? "Something went wrong."));
    });

  return (
    <>
      <ErrorBanner message={error} />
      <ul className={`space-y-3 ${pending ? "opacity-70" : ""}`}>
        {plans.map((p) => (
          <li
            key={p.id}
            className="card flex items-center gap-3 p-4"
            style={p.isActive ? { borderColor: "var(--color-accent)" } : undefined}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[16px] font-semibold">{p.name}</span>
                {p.isActive && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-0.5 truncate text-[13px] text-text-2">
                {p.dayCount} day{p.dayCount === 1 ? "" : "s"}
                {p.description ? ` · ${p.description}` : ""}
              </div>
            </div>
            {!p.isActive && (
              <button
                type="button"
                className="icon-btn"
                title="Set active"
                aria-label={`Set ${p.name} active`}
                onClick={() => act(() => setActivePlanAction(p.id))}
              >
                <IconStar size={18} />
              </button>
            )}
            <Link href={`/export?plan=${p.id}`} className="icon-btn" title="Export" aria-label={`Export ${p.name}`}>
              <IconDownload size={18} />
            </Link>
            <Link href={`/plans/${p.id}/edit`} className="icon-btn" title="Edit" aria-label={`Edit ${p.name}`}>
              <IconEdit size={18} />
            </Link>
            <button
              type="button"
              className="icon-btn hover:text-danger"
              title="Delete"
              aria-label={`Delete ${p.name}`}
              onClick={() => setToDelete(p)}
            >
              <IconTrash size={18} />
            </button>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={toDelete != null}
        title="Delete plan?"
        message={
          <>
            <strong className="text-text">{toDelete?.name}</strong> and all its days, exercises and logged sets will be
            permanently deleted.
          </>
        }
        onConfirm={() => toDelete && act(() => deletePlanAction(toDelete.id))}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
