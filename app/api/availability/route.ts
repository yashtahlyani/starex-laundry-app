import { NextResponse } from "next/server";
import { getClosedWindows } from "@/lib/availability";

export const dynamic = "force-dynamic";
// Next patches global fetch and caches GET responses in its Data Cache.
// supabase-js calls fetch, so this route served its very first answer - an
// empty list, taken before the table existed - to every later request,
// reporting "nothing is closed" while /api/bookings correctly refused the
// same date. force-dynamic alone did not stop it; the fetch itself has to be
// opted out. Found 2026-11-19 by a holiday the booking endpoint honoured and
// this one denied.
export const fetchCache = "force-no-store";
export const revalidate = 0;

/**
 * Which pickup dates and windows are closed, for the booking form.
 *
 * Public on purpose, and deliberately thin: dates and window labels only.
 * The reason a day is closed is the owner's business, not the internet's, so
 * it is not returned here even though it is stored.
 *
 * This is a courtesy, not the enforcement. /api/bookings checks again on
 * submit, because anything a browser is told it can edit.
 */
export async function GET() {
  const { windows, degraded } = await getClosedWindows();
  return NextResponse.json(
    {
      closed: windows.map(w => ({ date: w.date, timeSlot: w.timeSlot })),
      // The booking form should know the difference between "nothing is
      // closed" and "we could not find out" — they look identical in an
      // empty array, and only one of them means the greyed-out windows can
      // be trusted.
      degraded,
    },
    // Belt and braces against any layer deciding a GET with no parameters is
    // cacheable. A stale copy of this would show windows that are closed.
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
