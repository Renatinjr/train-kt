import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import type { User } from "@/db/schema";
import { isSecureRequest, SESSION_COOKIE, sessionCookieOptions } from "./cookie";
import { createSessionRow, deleteSessionRow, validateSession } from "./users";

export { SESSION_COOKIE };

/** Create a session and set the cookie. Only callable from Server Actions / route handlers. */
export async function startSession(userId: string) {
  const { id, expiresAt } = createSessionRow(getDb(), userId);
  const h = await headers();
  // Server actions are same-origin; Origin carries the scheme the browser used.
  const origin = h.get("origin");
  const secure = isSecureRequest(h, origin ? new URL(origin).protocol : undefined);
  (await cookies()).set(SESSION_COOKIE, id, sessionCookieOptions(expiresAt, secure));
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
