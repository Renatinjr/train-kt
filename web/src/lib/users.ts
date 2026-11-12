import bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import type { DB } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { uuid } from "./uuid";

/** Framework-free account + session primitives (testable without Next.js). */

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const RENEW_WHEN_LEFT_MS = 15 * 24 * 60 * 60 * 1000;

export class EmailTakenError extends Error {}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createUser(db: DB, email: string, password: string, name = ""): Promise<User> {
  const normalized = normalizeEmail(email);
  const existing = db.select({ id: users.id }).from(users).where(eq(users.email, normalized)).get();
  if (existing) throw new EmailTakenError("An account with this email already exists.");
  const user: User = {
    id: uuid(),
    email: normalized,
    passwordHash: await bcrypt.hash(password, 12),
    name: name.trim(),
    createdAt: Date.now(),
  };
  db.insert(users).values(user).run();
  return user;
}

// Hash compared against when the email does not exist, so timing doesn't reveal accounts.
let dummyHash: Promise<string> | undefined;

export async function verifyCredentials(db: DB, email: string, password: string): Promise<User | null> {
  const user = db.select().from(users).where(eq(users.email, normalizeEmail(email))).get();
  dummyHash ??= bcrypt.hash("dummy-password", 12);
  const ok = await bcrypt.compare(password, user?.passwordHash ?? (await dummyHash));
  return user && ok ? user : null;
}

export function createSessionRow(db: DB, userId: string): { id: string; expiresAt: number } {
  const id = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  db.insert(sessions).values({ id, userId, expiresAt }).run();
  // Opportunistic cleanup of expired sessions.
  db.delete(sessions).where(lt(sessions.expiresAt, Date.now())).run();
  return { id, expiresAt };
}

/** Validate a session id; slides the expiry when it is past half its lifetime. */
export function validateSession(db: DB, sessionId: string): { user: User; expiresAt: number; renewed: boolean } | null {
  const row = db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, Date.now())))
    .get();
  if (!row) return null;
  if (row.expiresAt - Date.now() < RENEW_WHEN_LEFT_MS) {
    const expiresAt = Date.now() + SESSION_TTL_MS;
    db.update(sessions).set({ expiresAt }).where(eq(sessions.id, sessionId)).run();
    return { user: row.user, expiresAt, renewed: true };
  }
  return { user: row.user, expiresAt: row.expiresAt, renewed: false };
}

export function deleteSessionRow(db: DB, sessionId: string) {
  db.delete(sessions).where(eq(sessions.id, sessionId)).run();
}
