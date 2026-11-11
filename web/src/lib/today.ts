import "server-only";
import { cookies } from "next/headers";

/**
 * "Today" in the user's timezone. The browser reports its IANA zone through the `tz` cookie
 * (see components/TzSync); without it we fall back to the server's zone.
 */
export const TZ_COOKIE = "tz";

export async function getUserToday(): Promise<{ dateKey: string; weekday: number }> {
  const tz = (await cookies()).get(TZ_COOKIE)?.value;
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz || undefined,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    }).formatToParts(new Date());
  } catch {
    parts = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    }).formatToParts(new Date());
  }
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    dateKey: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: weekdays.indexOf(get("weekday")) + 1, // Calendar numbering, 1 = Sunday
  };
}
