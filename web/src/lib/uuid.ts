/**
 * RFC 4122 v4 UUID that works everywhere this code runs. `crypto.randomUUID()` only exists in
 * secure contexts (HTTPS or localhost), so a page served over plain http on an IP/domain would
 * crash. `crypto.getRandomValues()` is available in every context, so build the UUID from it.
 */
export function uuid(): string {
  const c = globalThis.crypto;
  if (typeof c?.randomUUID === "function") return c.randomUUID();
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
