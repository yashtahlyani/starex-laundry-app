import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { normaliseEmail, phoneLast10 } from "@/lib/availability";

export const dynamic = "force-dynamic";

/**
 * The blocklist: customers who may no longer book online (per client,
 * 2026-11-19, "who are not good pay masters").
 *
 * Admin only, in every direction. Nothing here is reachable from a customer's
 * browser — a list of people the business refuses to serve is not something
 * to hand out, and it is written only through the service role.
 */

const TABLE_MISSING =
  "The blocklist table doesn't exist yet. Run supabase/2026-11-19-blocklist-and-holiday-mode.sql in the Supabase SQL editor.";

export async function GET() {
  const staff = await getAdminUser();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("blocked_customers")
    .select("id, email, phone_last10, name, reason, blocked_by, created_at")
    .order("created_at", { ascending: false });

  // Says so plainly rather than returning an empty list, which would look
  // like "nobody is blocked" and quietly let everyone through.
  if (error) return NextResponse.json({ error: TABLE_MISSING, setupNeeded: true }, { status: 503 });
  return NextResponse.json({ blocked: data ?? [] });
}

export async function POST(req: NextRequest) {
  const staff = await getAdminUser();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { email?: string; phone?: string; name?: string; reason?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const email = normaliseEmail(body.email);
  const phone = phoneLast10(body.phone);
  if (!email && !phone) {
    return NextResponse.json({ error: "Enter an email address or a phone number." }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().from("blocked_customers").insert({
    email, phone_last10: phone,
    name: body.name?.trim() || null,
    reason: body.reason?.trim() || null,
    blocked_by: staff.email ?? "admin",
  });

  if (error) {
    // 23505 is a unique violation: already blocked, which is a success as far
    // as the owner is concerned.
    if ((error as any).code === "23505") return NextResponse.json({ ok: true, alreadyBlocked: true });
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

  const { error } = await getSupabaseAdmin().from("blocked_customers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
