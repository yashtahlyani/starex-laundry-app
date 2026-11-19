import { NextResponse } from "next/server";
import { getClosedWindows } from "@/lib/availability";

export const dynamic = "force-dynamic";

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
  const { windows } = await getClosedWindows();
  return NextResponse.json({
    closed: windows.map(w => ({ date: w.date, timeSlot: w.timeSlot })),
  });
}
