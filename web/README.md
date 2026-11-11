# TrainKT Web

Web version of TrainKT: Next.js 15 (App Router, Server Actions), with all data in **SQLite** through `better-sqlite3` and Drizzle ORM. Log in with email and password.

## Run

```bash
npm install
npm run dev           # development, http://localhost:3000
npm run build && npm start   # production
npm test              # Vitest: parsers, schedule math, DB layer and per-user isolation
```

**With Bun** (recommended for production):

```bash
bun install
bun run bun:build
bun run bun:start       # runs Next.js on the Bun runtime
```

On Bun, the app uses the built-in `bun:sqlite`, because Bun can't load the `better-sqlite3` native addon. On Node it uses `better-sqlite3`. Both read the same database file. See `src/db/index.ts`.

The database file is created and migrated automatically on first request. Its path is `./data/trainkt.db`, and you can override it with `DATABASE_URL` (see `.env.example`).

Requirements:
- Node 20+
- A platform where `better-sqlite3` installs a prebuilt binary or can compile one

Before deploying with `next start`, run it behind HTTPS. The session cookie is set `Secure` in production.

## What's stored

Each user only ever sees their own rows.

| Table | Contents |
|---|---|
| `users`, `sessions` | Accounts (passwords hashed with bcrypt). Sessions use an opaque random id in an httpOnly cookie and last 30 days with a sliding expiry. |
| `workout_plans` → `workout_days` → `workout_sections` → `exercises` → `exercise_variations` | Same tree as the Android Room schema. Every plan has a `user_id`. |
| `schedule_settings` | Per user: the cycle's start weekday and whether there is a 5th training day. |
| `set_logs` | One row per completed set per date. The Android app keeps this only in memory; the web version persists it, so a workout survives a refresh and the **History** page can list past workouts. |

## Layout

- `src/db/`: Drizzle schema and connection. Migrations are applied at startup from `drizzle/`. After changing the schema, run `npm run db:generate`.
- `src/lib/`:
  - framework-free domain code, ported from the Kotlin sources:
    - `import/` ← `JsonParser`, `TextParser`, `ImportDto`, `DtoMappers`
    - `schedule.ts` ← `ScheduleCalc`
    - `plans.ts` ← `PlanRepository`/`PlanDao`
  - `auth.ts` / `users.ts`: sessions and accounts.
- `src/app/actions/`: Server Actions. Each one authenticates, validates with zod, then calls the user-scoped repository.
- `src/app/(app)/`: Home, Plans, Plan editor, Day (workout and edit mode), Import, Export, Schedule and History.
- `src/app/(auth)/`: Login and Register.

Plan edits update rows in place (`ON CONFLICT DO UPDATE`), never `INSERT OR REPLACE`. A replace would cascade-delete the children of the replaced row; this is the same bug fixed on Android in 68ae0dd.
