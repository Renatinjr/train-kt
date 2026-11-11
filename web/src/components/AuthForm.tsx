"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/actions/auth";
import { ErrorBanner } from "./ui";

export function AuthForm({
  mode,
  action,
  next,
}: {
  mode: "login" | "register";
  action: (state: AuthState, form: FormData) => Promise<AuthState>;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isLogin = mode === "login";
  return (
    <form action={formAction} className="card space-y-4 p-6">
      <h1 className="text-[20px] font-bold">{isLogin ? "Log in" : "Create your account"}</h1>
      <ErrorBanner message={state.error} />
      {next && <input type="hidden" name="next" value={next} />}
      {!isLogin && (
        <div>
          <label htmlFor="name" className="label-xs mb-1.5 block">
            Name <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input id="name" name="name" className="input" autoComplete="name" defaultValue={state.name} />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label-xs mb-1.5 block">Email</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" defaultValue={state.email} />
      </div>
      <div>
        <label htmlFor="password" className="label-xs mb-1.5 block">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={isLogin ? undefined : 8}
          className="input"
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </div>
      {!isLogin && (
        <div>
          <label htmlFor="confirm" className="label-xs mb-1.5 block">Confirm password</label>
          <input id="confirm" name="confirm" type="password" required className="input" autoComplete="new-password" />
        </div>
      )}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Please wait…" : isLogin ? "Log in" : "Create account"}
      </button>
      <p className="text-center text-[13px] text-text-2">
        {isLogin ? (
          <>No account? <Link href="/register" className="font-semibold text-accent hover:underline">Sign up</Link></>
        ) : (
          <>Already registered? <Link href="/login" className="font-semibold text-accent hover:underline">Log in</Link></>
        )}
      </p>
    </form>
  );
}
