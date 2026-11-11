import type { ImportResult, PlanDetail } from "../models";
import { PlanFileDto, toFileDto, toPlanDetail } from "./dto";

/** Port of util/JsonParser.kt — parses `{ "version", "plan": { ... } }`. */
export function parseJson(raw: string): ImportResult {
  const text = raw.trim();
  if (text === "") return { ok: false, error: "The file is empty." };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: `Couldn't parse JSON: ${(e as Error).message || "invalid format"}` };
  }
  const parsed = PlanFileDto.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: `Couldn't parse JSON: ${parsed.error.issues[0]?.message ?? "invalid format"}` };
  }
  if (parsed.data.plan.days.length === 0) {
    return { ok: false, error: 'No workout days found in the JSON. Check the "days" array.' };
  }
  return { ok: true, plan: toPlanDetail(parsed.data) };
}

interface MDay {
  name: string;
  color: string;
  sections: MSection[];
}
interface MSection {
  title: string;
  exercises: MExercise[];
}
interface MExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  numSets: number;
  variations: { label: string; isAlternative: boolean }[];
}

const startsWithCI = (line: string, prefix: string) =>
  line.slice(0, prefix.length).toUpperCase() === prefix.toUpperCase();
const afterColon = (line: string) => line.slice(line.indexOf(":") + 1).trim();

/**
 * Port of util/TextParser.kt — the line-based format:
 *
 *   PLAN: My Workout
 *   DAY: Push | color:#4a9eff
 *   SECTION: Chest
 *   - Incline Bench Press | 3 sets | 6-8 reps | 2 min rest
 *     ALT: Incline machine press
 */
export function parseText(raw: string): ImportResult {
  if (raw.trim() === "") return { ok: false, error: "The text is empty." };

  let planName = "";
  const days: MDay[] = [];
  const currentDay = () => {
    if (days.length === 0) days.push({ name: "Day 1", color: "", sections: [] });
    return days[days.length - 1];
  };

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "") continue;

    if (startsWithCI(line, "PLAN:")) {
      planName = afterColon(line);
    } else if (startsWithCI(line, "DAY:")) {
      const parts = afterColon(line).split("|").map((p) => p.trim());
      const color = parts.slice(1).find((p) => startsWithCI(p, "color:"));
      days.push({ name: parts[0] ?? "", color: color ? afterColon(color) : "", sections: [] });
    } else if (startsWithCI(line, "SECTION:")) {
      currentDay().sections.push({ title: afterColon(line), exercises: [] });
    } else if (startsWithCI(line, "ALT:")) {
      const ex = days.at(-1)?.sections.at(-1)?.exercises.at(-1);
      ex?.variations.push({ label: afterColon(line), isAlternative: true });
    } else if (line.startsWith("-")) {
      const parts = line.slice(1).trim().split("|").map((p) => p.trim());
      const [name = "", sets = "", reps = "", rest = ""] = parts;
      const numSets = Number.parseInt(sets.match(/\d+/)?.[0] ?? "0", 10) || 0;
      const day = currentDay();
      if (day.sections.length === 0) day.sections.push({ title: "Exercises", exercises: [] });
      day.sections[day.sections.length - 1].exercises.push({
        name,
        sets,
        reps,
        rest,
        numSets,
        variations: [],
      });
    }
    // Unknown lines are ignored, keeping the format forgiving.
  }

  if (days.length === 0) {
    return { ok: false, error: 'No DAY: lines found. Start a day with "DAY: Name".' };
  }

  const dto = PlanFileDto.parse({
    plan: {
      name: planName,
      days: days.map((d) => ({
        name: d.name,
        color: d.color,
        sections: d.sections.map((s) => ({ title: s.title, exercises: s.exercises })),
      })),
    },
  });
  return { ok: true, plan: toPlanDetail(dto) };
}

/** Port of util/ImportParser.kt — leading `{` means JSON, otherwise plain text. */
export function parseAuto(raw: string): ImportResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, error: "Nothing to import." };
  return trimmed.startsWith("{") ? parseJson(trimmed) : parseText(trimmed);
}

/** Port of util/PlanExporter.kt. */
export function exportJson(plan: PlanDetail): string {
  return JSON.stringify(toFileDto(plan), null, 2);
}

export function exportFileName(plan: PlanDetail): string {
  const slug = plan.plan.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "plan"}.json`;
}
