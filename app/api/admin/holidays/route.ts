import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { PICKUP_WINDOWS, DETAILING_WINDOWS } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/**
 * Holiday mode: dates and pickup windows closed to new bookings (per client,
 * 2026-11-19, "for when we want anyone can't book any order in specific
 * window/date").
 *
 * A row with no time_slot closes the whole day. A row with one closes just
 * that window, so a half day off does not cost a full day of bookings.
 */

const TABLE_MISSING =
  "The holiday table doesn't exist yet. Run supabase/2026-11-19-blocklist-and-holiday-mode.sql in the Supabase SQL editor.";

const VALID_SLOTS = new Set<string>([
  ...PICKUP_WINDOWS.map(w => w.label),
  ...DETAILING_WINDOWS.map(w => w.label),
]);

export async function GET() {
  const staff = await getAdminUser();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Today onward, in Toronto — a closure that has already passed is clutter.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

  const { data, error } = await getSupabaseAdmin()
    .from("blocked_dates")
    .select("id, date, time_slot, reason, created_by, created_at")
    .gte("date", today)
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: TABLE_MISSING, setupNeeded: true }, { status: 503 });
  return NextResponse.json({ closed: data ?? [] });
}

export async function POST(req: NextRequest) {
  const staff = await getAdminUser();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { date?: string; timeSlot?: string | null; reason?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const date = (body.date ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
    return NextResponse.json({ error: "Choose a valid date." }, { status: 400 });
  }

  // Empty string from a <select> means "whole day".
  const slot = body.timeSlot?.trim() ? body.timeSlot.trim() : null;
  if (slot && !VALID_SLOTS.has(slot)) {
    return NextResponse.json({ error: "That isn't one of our pickup windows." }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().from("blocked_dates").insert({
    date, time_slot: slot,
    reason: body.reason?.trim() || null,
    created_by: staff.email ?? "admin",
  });

  if (error) {
    if ((error as any).code === "23505") return NextResponse.json({ ok: true, alreadyClosed: true });
    if (/does not exist/i.test(error.message)) {
      return NextResponse.json({ error: TABLE_MISSING, setupNeeded: true }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const staff = await getAdminUser();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await getSupabaseAdmin().from("blocked_dates").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
