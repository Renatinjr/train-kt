/**
 * Shared session-cookie settings (used by both middleware and server code).
 *
 * The cookie is marked `Secure` only when the request actually arrived over HTTPS: browsers
 * silently drop Secure cookies set over plain http (except on localhost), which logs the user
 * out on the next navigation. Behind a TLS-terminating proxy (Caddy, nginx) the original
 * scheme comes from `X-Forwarded-Proto`. Set COOKIE_SECURE=true/false to force it.
 */

export const SESSION_COOKIE = "trainkt_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function isSecureRequest(headers: Headers, fallbackProtocol?: string): boolean {
  const forced = process.env.COOKIE_SECURE;
  if (forced === "true") return true;
  if (forced === "false") return false;
  const proto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (proto) return proto === "https";
  return fallbackProtocol === "https:";
}

export function sessionCookieOptions(expiresAt: number, secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    expires: new Date(expiresAt),
  };
}
