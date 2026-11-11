import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/*
 * Mirrors the Android Room schema (app/.../data/db/entities) with two additions:
 * - every plan belongs to a user (multi-account web app);
 * - set_logs persists completed sets per date (the Android app keeps them in memory).
 * All ids are UUID strings; every child FK cascades on delete.
 */

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default(""),
  createdAt: integer("created_at").notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const workoutPlans = sqliteTable(
  "workout_plans",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    createdAt: integer("created_at").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [index("plans_user_idx").on(t.userId)],
);

export const workoutDays = sqliteTable(
  "workout_days",
  {
    id: text("id").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => workoutPlans.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    dayLabel: text("day_label").notNull().default(""),
    colorHex: text("color_hex").notNull().default("#4a9eff"),
    position: integer("position").notNull(),
    note: text("note").notNull().default(""),
  },
  (t) => [index("days_plan_idx").on(t.planId)],
);

export const workoutSections = sqliteTable(
  "workout_sections",
  {
    id: text("id").primaryKey(),
    dayId: text("day_id")
      .notNull()
      .references(() => workoutDays.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    position: integer("position").notNull(),
  },
  (t) => [index("sections_day_idx").on(t.dayId)],
);

export const exercises = sqliteTable(
  "exercises",
  {
    id: text("id").primaryKey(),
    sectionId: text("section_id")
      .notNull()
      .references(() => workoutSections.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sets: text("sets").notNull().default(""),
    reps: text("reps").notNull().default(""),
    rest: text("rest").notNull().default(""),
    numSets: integer("num_sets").notNull().default(3),
    tip: text("tip").notNull().default(""),
    badgeLabel: text("badge_label").notNull().default(""),
    badgeColor: text("badge_color").notNull().default(""),
    position: integer("position").notNull(),
  },
  (t) => [index("exercises_section_idx").on(t.sectionId)],
);

export const exerciseVariations = sqliteTable(
  "exercise_variations",
  {
    id: text("id").primaryKey(),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    isAlternative: integer("is_alternative", { mode: "boolean" }).notNull().default(false),
    position: integer("position").notNull(),
  },
  (t) => [index("variations_exercise_idx").on(t.exerciseId)],
);

export const scheduleSettings = sqliteTable("schedule_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  /** java.util.Calendar numbering: 1 = Sunday … 7 = Saturday. */
  startWeekday: integer("start_weekday").notNull().default(2),
  hasFifthDay: integer("has_fifth_day", { mode: "boolean" }).notNull().default(true),
});

export const setLogs = sqliteTable(
  "set_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    /** Local calendar date of the workout, YYYY-MM-DD. */
    date: text("date").notNull(),
    setIndex: integer("set_index").notNull(),
    completedAt: integer("completed_at")
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("set_logs_unique").on(t.exerciseId, t.date, t.setIndex),
    index("set_logs_user_date_idx").on(t.userId, t.date),
  ],
);

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type WorkoutDay = typeof workoutDays.$inferSelect;
export type WorkoutSection = typeof workoutSections.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type ExerciseVariation = typeof exerciseVariations.$inferSelect;
export type User = typeof users.$inferSelect;
