import { beforeEach, describe, expect, it } from "vitest";
import { openDatabase, type DB } from "@/db";
import { parseText } from "@/lib/import";
import {
  addSection,
  deletePlan,
  getActivePlanTree,
  getDayDetail,
  getPlanTree,
  insertPlanTree,
  listPlanSummaries,
  moveExercise,
  saveExercise,
  savePlanWithDays,
  setActive,
} from "@/lib/plans";
import { getCompletedSets, getHistory, toggleSet } from "@/lib/setlog";
import { getSchedule, saveSchedule } from "@/lib/settings";
import { createUser, createSessionRow, validateSession, verifyCredentials, EmailTakenError } from "@/lib/users";
import { sampleText } from "./fixtures";

let db: DB;
let alice: string;
let bob: string;

function importSample(userId: string) {
  const r = parseText(sampleText);
  if (!r.ok) throw new Error(r.error);
  return insertPlanTree(db, userId, r.plan, true);
}

beforeEach(async () => {
  db = openDatabase(":memory:");
  alice = (await createUser(db, "Alice@Example.com", "password123")).id;
  bob = (await createUser(db, "bob@example.com", "password123")).id;
});

describe("users & sessions", () => {
  it("normalizes email, rejects duplicates and verifies passwords", async () => {
    await expect(createUser(db, "alice@example.com ", "x")).rejects.toBeInstanceOf(EmailTakenError);
    expect((await verifyCredentials(db, "ALICE@example.com", "password123"))?.id).toBe(alice);
    expect(await verifyCredentials(db, "alice@example.com", "wrong")).toBeNull();
    expect(await verifyCredentials(db, "nobody@example.com", "password123")).toBeNull();
  });

  it("creates and validates sessions", () => {
    const s = createSessionRow(db, alice);
    expect(validateSession(db, s.id)?.user.id).toBe(alice);
    expect(validateSession(db, "bogus")).toBeNull();
  });
});

describe("plans", () => {
  it("imports a tree and reads it back sorted", () => {
    const planId = importSample(alice);
    const tree = getActivePlanTree(db, alice)!;
    expect(tree.plan.id).toBe(planId);
    expect(tree.days.map((d) => d.day.name)).toEqual(["Push", "Pull"]);
    expect(tree.days[0].sections.map((s) => s.section.title)).toEqual(["Chest", "Shoulders"]);
    expect(tree.days[0].sections[0].exercises[0].variations).toHaveLength(2);
  });

  it("editing a plan keeps its exercises (no REPLACE cascade)", () => {
    const planId = importSample(alice);
    const tree = getPlanTree(db, alice, planId)!;
    savePlanWithDays(db, alice, {
      id: planId,
      name: "Renamed",
      description: "",
      days: tree.days
        .map((d) => ({ id: d.day.id, name: d.day.name + "!", dayLabel: d.day.dayLabel, colorHex: d.day.colorHex, note: "" }))
        .reverse(),
    });
    const after = getPlanTree(db, alice, planId)!;
    expect(after.plan.name).toBe("Renamed");
    expect(after.days.map((d) => d.day.name)).toEqual(["Pull!", "Push!"]);
    expect(after.days[1].sections[0].exercises).toHaveLength(1);
    expect(after.days[1].sections[0].exercises[0].variations).toHaveLength(2);
  });

  it("removing a day from the edit deletes it", () => {
    const planId = importSample(alice);
    const tree = getPlanTree(db, alice, planId)!;
    const push = tree.days[0].day;
    savePlanWithDays(db, alice, {
      id: planId,
      name: "x",
      description: "",
      days: [{ id: push.id, name: push.name, dayLabel: push.dayLabel, colorHex: push.colorHex, note: "" }],
    });
    expect(getPlanTree(db, alice, planId)!.days).toHaveLength(1);
  });

  it("keeps one active plan per user", () => {
    const a1 = importSample(alice);
    const a2 = importSample(alice);
    expect(getActivePlanTree(db, alice)!.plan.id).toBe(a2);
    setActive(db, alice, a1);
    expect(listPlanSummaries(db, alice).filter((p) => p.plan.isActive).map((p) => p.plan.id)).toEqual([a1]);
    deletePlan(db, alice, a1);
    expect(getActivePlanTree(db, alice)!.plan.id).toBe(a2);
  });

  it("saves exercises, replaces variations and reorders", () => {
    const planId = importSample(alice);
    const day = getPlanTree(db, alice, planId)!.days[0];
    const sectionId = day.sections[0].section.id;
    const firstId = day.sections[0].exercises[0].exercise.id;
    const newId = saveExercise(db, alice, {
      sectionId, name: "Dips", sets: "3 sets", reps: "8", rest: "", numSets: 3, tip: "", badgeLabel: "", badgeColor: "",
      variations: [{ label: "Bench dip", isAlternative: true }, { label: " ", isAlternative: false }],
    });
    moveExercise(db, alice, newId, true);
    const ex = getDayDetail(db, alice, day.day.id)!.sections[0].exercises;
    expect(ex.map((e) => e.exercise.name)).toEqual(["Dips", "Incline Bench Press"]);
    expect(ex[0].variations.map((v) => v.label)).toEqual(["Bench dip"]);
    saveExercise(db, alice, { ...ex[1].exercise, id: firstId, variations: [] });
    expect(getDayDetail(db, alice, day.day.id)!.sections[0].exercises[1].variations).toHaveLength(0);
    expect(addSection(db, alice, day.day.id, "Triceps")).toBeTruthy();
  });
});

describe("isolation between users", () => {
  it("bob cannot read or mutate alice's plan", () => {
    const planId = importSample(alice);
    const tree = getPlanTree(db, alice, planId)!;
    const day = tree.days[0];
    const exId = day.sections[0].exercises[0].exercise.id;

    expect(getPlanTree(db, bob, planId)).toBeNull();
    expect(getDayDetail(db, bob, day.day.id)).toBeNull();
    expect(listPlanSummaries(db, bob)).toHaveLength(0);
    expect(() => setActive(db, bob, planId)).toThrow();
    expect(() => deletePlan(db, bob, planId)).toThrow();
    expect(() => addSection(db, bob, day.day.id, "x")).toThrow();
    expect(() => toggleSet(db, bob, exId, "2026-11-11", 0)).toThrow();
    expect(() =>
      savePlanWithDays(db, bob, { id: planId, name: "pwned", description: "", days: [] }),
    ).toThrow();
    expect(getPlanTree(db, alice, planId)!.plan.name).toBe("My Workout");
    expect(getPlanTree(db, alice, planId)!.days).toHaveLength(2);
  });
});

describe("set log & schedule", () => {
  it("toggles sets per date and builds history", () => {
    const planId = importSample(alice);
    const day = getPlanTree(db, alice, planId)!.days[0];
    const exId = day.sections[0].exercises[0].exercise.id;
    expect(toggleSet(db, alice, exId, "2026-11-11", 0)).toBe(true);
    expect(toggleSet(db, alice, exId, "2026-11-11", 1)).toBe(true);
    expect(toggleSet(db, alice, exId, "2026-11-11", 1)).toBe(false);
    toggleSet(db, alice, exId, "2026-11-10", 2);
    expect(getCompletedSets(db, alice, day.day.id, "2026-11-11")).toEqual({ [exId]: [0] });
    const h = getHistory(db, alice);
    expect(h.map((x) => [x.date, x.sets])).toEqual([["2026-11-11", 1], ["2026-11-10", 1]]);
    expect(getHistory(db, bob)).toHaveLength(0);
  });

  it("stores schedule per user", () => {
    expect(getSchedule(db, alice)).toEqual({ startWeekday: 2, hasFifthDay: true });
    saveSchedule(db, alice, { startWeekday: 1, hasFifthDay: false });
    saveSchedule(db, alice, { startWeekday: 3, hasFifthDay: false });
    expect(getSchedule(db, alice)).toEqual({ startWeekday: 3, hasFifthDay: false });
    expect(getSchedule(db, bob).startWeekday).toBe(2);
  });
});
