"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { endSession, startSession } from "@/lib/auth";
import { createUser, EmailTakenError, verifyCredentials } from "@/lib/users";

export interface AuthState {
  error?: string;
  email?: string;
  name?: string;
}

/** Only allow same-origin relative redirects after login. */
function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/";
}

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export async function loginAction(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  const email = String(form.get("email") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };
  const user = await verifyCredentials(getDb(), parsed.data.email, parsed.data.password);
  if (!user) return { error: "Wrong email or password.", email };
  await startSession(user.id);
  redirect(safeNext(form.get("next")));
}

const registerSchema = z
  .object({
    name: z.string().trim().max(80),
    email: z.string().trim().email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match.", path: ["confirm"] });

export async function registerAction(_: AuthState, form: FormData): Promise<AuthState> {
  const raw = {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
    confirm: String(form.get("confirm") ?? ""),
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, email: raw.email, name: raw.name };
  try {
    const user = await createUser(getDb(), parsed.data.email, parsed.data.password, parsed.data.name);
    await startSession(user.id);
  } catch (e) {
    if (e instanceof EmailTakenError) return { error: e.message, email: raw.email, name: raw.name };
    throw e;
  }
  redirect("/");
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
