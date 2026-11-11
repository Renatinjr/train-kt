"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const path = usePathname();
  const active = href === "/" ? path === "/" || path.startsWith("/day") : path.startsWith(href);
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition sm:flex-row sm:gap-2 sm:text-[13px] ${
        active ? "text-accent" : "text-text-2 hover:text-text"
      }`}
    >
      {children}
      <span>{label}</span>
    </Link>
  );
}
