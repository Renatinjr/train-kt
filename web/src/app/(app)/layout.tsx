import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { IconBook, IconCalendar, IconHistory, IconHome, IconLogout } from "@/components/icons";
import { NavLink } from "@/components/NavLink";
import { TzSync } from "@/components/TzSync";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const nav = (
    <>
      <NavLink href="/" label="Home"><IconHome size={20} /></NavLink>
      <NavLink href="/plans" label="Plans"><IconBook size={20} /></NavLink>
      <NavLink href="/schedule" label="Schedule"><IconCalendar size={20} /></NavLink>
      <NavLink href="/history" label="History"><IconHistory size={20} /></NavLink>
    </>
  );
  return (
    <div className="min-h-dvh pb-20 sm:pb-0">
      <TzSync />
      <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <img src="/icon.svg" alt="" className="size-7 rounded-lg" />
            TrainKT
          </Link>
          <nav className="ml-2 hidden flex-1 items-center gap-1 sm:flex">{nav}</nav>
          <div className="ml-auto flex items-center gap-1">
            <span className="hidden max-w-[180px] truncate text-[13px] text-text-2 md:inline" title={user.email}>
              {user.name || user.email}
            </span>
            <form action={logoutAction}>
              <button type="submit" className="icon-btn" aria-label="Log out" title="Log out">
                <IconLogout size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur sm:hidden">
        {nav}
      </nav>
    </div>
  );
}
