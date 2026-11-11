"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconCheck, IconCopy, IconDownload } from "./icons";

/** Port of ui/importexport/ExportScreen.kt — Copy / Download instead of the Android share sheet. */
export function ExportView({
  plans,
  selectedId,
  json,
  fileName,
}: {
  plans: { id: string; name: string }[];
  selectedId: string;
  json: string;
  fileName: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const download = () => {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="plan" className="label-xs mb-1.5 block">Plan</label>
          <select id="plan" className="input" value={selectedId} onChange={(e) => router.replace(`/export?plan=${e.target.value}`)}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={async () => {
            await navigator.clipboard.writeText(json);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <><IconCheck size={16} /> Copied</> : <><IconCopy size={16} /> Copy</>}
        </button>
        <button type="button" className="btn-primary" onClick={download}>
          <IconDownload size={16} /> {fileName}
        </button>
      </div>
      <pre className="card max-h-[60vh] overflow-auto p-4 font-mono text-[12px] leading-relaxed text-text-2">{json}</pre>
    </div>
  );
}
