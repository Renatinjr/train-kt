import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <img src="/icon.svg" alt="" className="size-10 rounded-xl" />
          <div>
            <div className="text-[22px] font-extrabold tracking-tight">TrainKT</div>
            <div className="text-[13px] text-text-2">Your training plan, everywhere.</div>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
