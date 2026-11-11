import { describe, expect, it } from "vitest";
import { exportFileName, exportJson, parseAuto, parseJson, parseText } from "@/lib/import";
import { alternativeVariations, primaryVariations } from "@/lib/models";
import { sampleJson, sampleText } from "./fixtures";

describe("import parsers (ported from ParserTest.kt)", () => {
  it("jsonParse builds expected tree", () => {
    const r = parseJson(sampleJson);
    if (!r.ok) throw new Error(r.error);
    expect(r.plan.plan.name).toBe("Push Pull Legs");
    expect(r.plan.days).toHaveLength(1);
    const day = r.plan.days[0];
    expect(day.sections).toHaveLength(1);
    const ex = day.sections[0].exercises[0];
    expect(ex.exercise.name).toBe("Incline Bench Press");
    expect(ex.exercise.numSets).toBe(3);
    expect(ex.variations).toHaveLength(4);
    expect(primaryVariations(ex)).toHaveLength(2);
    expect(alternativeVariations(ex)).toHaveLength(2);
  });

  it("textParse builds days, sections and alternatives", () => {
    const r = parseText(sampleText);
    if (!r.ok) throw new Error(r.error);
    expect(r.plan.plan.name).toBe("My Workout");
    expect(r.plan.days).toHaveLength(2);
    const push = r.plan.days[0];
    expect(push.day.name).toBe("Push");
    expect(push.day.colorHex).toBe("#4a9eff");
    expect(push.sections).toHaveLength(2);
    const incline = push.sections[0].exercises[0];
    expect(incline.exercise.numSets).toBe(3);
    expect(alternativeVariations(incline)).toHaveLength(2);
    expect(r.plan.days[1].day.name).toBe("Pull");
  });

  it("jsonParse empty/invalid payload returns error", () => {
    expect(parseJson("").ok).toBe(false);
    expect(parseJson("{ not json").ok).toBe(false);
    expect(parseJson('{"plan":{"days":[]}}').ok).toBe(false);
  });

  it("applies DtoMappers fallbacks", () => {
    const r = parseJson('{"plan":{"days":[{"sections":[{"exercises":[{}]}]}]}}');
    if (!r.ok) throw new Error(r.error);
    const d = r.plan.days[0];
    expect(r.plan.plan.name).toBe("Imported Plan");
    expect(d.day.name).toBe("Day 1");
    expect(d.day.colorHex).toBe("#4a9eff");
    const e = d.sections[0].exercises[0].exercise;
    expect(e.name).toBe("Exercise 1");
    expect(e.numSets).toBe(3);
    expect(e.badgeColor).toBe("#4a9eff");
  });

  it("parseAuto picks the right parser and export round-trips", () => {
    expect(parseAuto("   ").ok).toBe(false);
    const r = parseAuto(sampleJson);
    if (!r.ok) throw new Error(r.error);
    const again = parseAuto(exportJson(r.plan));
    if (!again.ok) throw new Error(again.error);
    expect(JSON.parse(exportJson(again.plan))).toEqual(JSON.parse(exportJson(r.plan)));
    expect(exportFileName(r.plan)).toBe("push-pull-legs.json");
  });
});
