import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

/**
 * Synchronous Drizzle SQLite database. Under Bun we use the built-in `bun:sqlite` (Bun can't
 * load the better-sqlite3 native addon); under Node we use better-sqlite3. Both drivers expose
 * the same sync query API, so the rest of the app doesn't care which one is active.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DB = BaseSQLiteDatabase<"sync", any, typeof schema>;

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");
const isBun = typeof (globalThis as { Bun?: unknown }).Bun !== "undefined";

/** Open a database at [file], apply pragmas and run pending migrations. */
export function openDatabase(file: string): DB {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });

  if (isBun) {
    // Static requires inside the branch: only the active runtime's driver is ever loaded.
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { Database } = require("bun:sqlite");
    const { drizzle } = require("drizzle-orm/bun-sqlite");
    const { migrate } = require("drizzle-orm/bun-sqlite/migrator");
    const sqlite = new Database(file, { create: true });
    sqlite.exec("PRAGMA journal_mode = WAL;");
    sqlite.exec("PRAGMA foreign_keys = ON;");
    const db = drizzle(sqlite, { schema }) as DB;
    migrate(db, { migrationsFolder: MIGRATIONS_DIR });
    return db;
  }

  const Database = require("better-sqlite3");
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  const { migrate } = require("drizzle-orm/better-sqlite3/migrator");
  /* eslint-enable @typescript-eslint/no-require-imports */
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema }) as DB;
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  return db;
}

// Reuse one connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { __trainktDb?: DB };

export function getDb(): DB {
  if (!globalForDb.__trainktDb) {
    globalForDb.__trainktDb = openDatabase(process.env.DATABASE_URL ?? "./data/trainkt.db");
  }
  return globalForDb.__trainktDb;
}
