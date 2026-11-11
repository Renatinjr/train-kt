"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { accentColor, DAY_COLORS } from "@/lib/models";
import { IconCheck, IconClose } from "./icons";

/** Port of ui/components/Pills.kt */
export function InfoPill({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-elevated px-2.5 py-1 text-[12px] font-medium text-text-2">
      {children}
    </span>
  );
}

export function BadgePill({ label, color }: { label: string; color: string }) {
  const c = accentColor(color);
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ color: c, background: `${c}22`, border: `1px solid ${c}55` }}
    >
      {label}
    </span>
  );
}

/** Port of ui/components/ColorPickerRow.kt */
export function ColorPickerRow({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
      {DAY_COLORS.map((c) => {
        const selected = value.toLowerCase() === c;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c}
            onClick={() => onChange(c)}
            className="flex size-8 items-center justify-center rounded-full transition hover:scale-110"
            style={{ background: c, boxShadow: selected ? `0 0 0 2px var(--color-bg), 0 0 0 4px ${c}` : undefined }}
          >
            {selected && <IconCheck size={16} className="text-[#0a0a0f]" />}
          </button>
        );
      })}
    </div>
  );
}

/** Native <dialog> modal: Esc and backdrop click close it. */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto w-[calc(100%-32px)] ${wide ? "max-w-xl" : "max-w-sm"} rounded-2xl border border-border bg-surface p-0 text-text shadow-2xl`}
    >
      {open && (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-[18px] font-bold">{title}</h2>
            <button type="button" className="icon-btn -mr-2" onClick={onClose} aria-label="Close">
              <IconClose size={18} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-[14px] text-text-2">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function TextInputDialog({
  open,
  title,
  label,
  initial,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  label: string;
  initial: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    if (open) setValue(initial);
  }, [open, initial]);
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onSubmit(value.trim());
            onClose();
          }
        }}
      >
        <label className="label-xs mb-1.5 block">{label}</label>
        <input className="input" autoFocus value={value} onChange={(e) => setValue(e.target.value)} />
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!value.trim()}>
            OK
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
      {message}
    </div>
  );
}
