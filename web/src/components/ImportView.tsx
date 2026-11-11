"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { importPlanAction } from "@/app/actions/app";
import { parseAuto } from "@/lib/import";
import { dayExerciseCount } from "@/lib/models";
import { IconUpload } from "./icons";
import { ErrorBanner } from "./ui";

const EXAMPLE = `PLAN: My Workout
DAY: Push | color:#4a9eff
SECTION: Chest
- Incline Bench Press | 3 sets | 6-8 reps | 2 min rest
  ALT: Incline machine press
DAY: Pull | color:#2dd4a0
SECTION: Back
- Pull-up | 3 sets | 6-8 reps | 2-3 min rest`;

/** Port of ui/importexport/ImportScreen.kt — file or paste, live preview, then import. */
export function ImportView() {
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [activate, setActivate] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // Parsing is pure, so the preview runs in the browser; the server re-parses on import.
  const result = useMemo(() => (raw.trim() ? parseAuto(raw) : null), [raw]);

  return (
    <div className="space-y-5">
      <div className="card space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()}>
            <IconUpload size={16} /> Choose file
          </button>
          <span className="truncate text-[13px] text-text-2">{fileName ?? ".json or .txt"}</span>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.txt,application/json,text/plain"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setFileName(f.name);
              setRaw(await f.text());
              setServerError(null);
            }}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="paste" className="label-xs">Or paste JSON / text</label>
            {!raw && (
              <button type="button" className="text-[12px] font-semibold text-accent hover:underline" onClick={() => setRaw(EXAMPLE)}>
                Insert example
              </button>
            )}
          </div>
          <textarea
            id="paste"
            className="input h-56 resize-y font-mono text-[12px] leading-relaxed"
            spellCheck={false}
            value={raw}
            placeholder={EXAMPLE}
            onChange={(e) => {
              setRaw(e.target.value);
              setFileName(null);
              setServerError(null);
            }}
          />
        </div>
      </div>

      {result && !result.ok && <ErrorBanner message={result.error} />}
      <ErrorBanner message={serverError} />

      {result?.ok && (
        <div className="card p-5">
          <div className="label-xs mb-1">Preview</div>
          <div className="text-[20px] font-bold">{result.plan.plan.name}</div>
          {result.plan.plan.description && <p className="text-[13px] text-text-2">{result.plan.plan.description}</p>}
          <ul className="mt-3 space-y-2">
            {result.plan.days.map((d) => (
              <li key={d.day.id} className="flex items-center gap-3 rounded-lg bg-elevated px-3 py-2">
                <span className="size-2.5 rounded-full" style={{ background: d.day.colorHex }} />
                <span className="flex-1 font-semibold">{d.day.name}</span>
                <span className="text-[12px] text-text-2">
                  {d.sections.length} section{d.sections.length === 1 ? "" : "s"} · {dayExerciseCount(d)} exercises
                </span>
              </li>
            ))}
          </ul>
          <label className="mt-4 flex items-center gap-2 text-[14px] text-text-2">
            <input type="checkbox" checked={activate} onChange={(e) => setActivate(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
            Make this the active plan
          </label>
          <button
            type="button"
            className="btn-primary mt-4 w-full"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await importPlanAction(raw, activate);
                if (r && !r.ok) setServerError(r.error);
              })
            }
          >
            {pending ? "Importing…" : "Import plan"}
          </button>
        </div>
      )}

      <details className="card p-5 text-[13px] text-text-2">
        <summary className="cursor-pointer font-semibold text-text">Supported formats</summary>
        <p className="mt-3">
          <strong className="text-text">JSON</strong> — the same file the Android app exports:{" "}
          <code className="font-mono text-[12px]">{`{ "version": 1, "plan": { "name", "days": [ { "name", "color", "sections": [ { "title", "exercises": [...] } ] } ] } }`}</code>
        </p>
        <p className="mt-2">
          <strong className="text-text">Text</strong> — one item per line: <code className="font-mono">PLAN:</code>,{" "}
          <code className="font-mono">DAY: Name | color:#hex</code>, <code className="font-mono">SECTION: Title</code>,{" "}
          <code className="font-mono">- Exercise | sets | reps | rest</code>, <code className="font-mono">ALT: alternative</code>.
        </p>
      </details>
    </div>
  );
}
