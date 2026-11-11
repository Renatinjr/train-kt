import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import type { User } from "@/db/schema";
import { createSessionRow, deleteSessionRow, SESSION_TTL_MS, validateSession } from "./users";

export const SESSION_COOKIE = "trainkt_session";

function cookieOptions(expiresAt: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  };
}

/** Create a session and set the cookie. Only callable from Server Actions / route handlers. */
export async function startSession(userId: string) {
  const { id, expiresAt } = createSessionRow(getDb(), userId);
  (await cookies()).set(SESSION_COOKIE, id, cookieOptions(expiresAt));
}

export async function endSession() {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (id) deleteSessionRow(getDb(), id);
  jar.delete(SESSION_COOKIE);
}

/** The logged-in user for this request, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return validateSession(getDb(), id)?.user ?? null;
});

/** The logged-in user, or redirect to /login. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export { SESSION_TTL_MS };
