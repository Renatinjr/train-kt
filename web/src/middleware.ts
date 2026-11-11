import { NextResponse, type NextRequest } from "next/server";
import { isSecureRequest, SESSION_COOKIE, SESSION_TTL_MS, sessionCookieOptions } from "@/lib/cookie";

/*
 * Cheap gate: requests without a session cookie go to /login. The session itself is validated
 * against SQLite in requireUser() on every page/action. When the cookie is present its expiry
 * is slid forward to match the DB-side sliding expiry.
 */

const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get(SESSION_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!session && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (session && req.method === "GET") {
    const secure = isSecureRequest(req.headers, req.nextUrl.protocol);
    res.cookies.set(SESSION_COOKIE, session, sessionCookieOptions(Date.now() + SESSION_TTL_MS, secure));
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
