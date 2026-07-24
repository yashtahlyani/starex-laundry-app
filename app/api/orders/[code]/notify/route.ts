import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { sendCustomerNote } from "@/lib/notifications";

export const dynamic = "force-dynamic";

// Admin-only: sends the customer an ad-hoc note about their order (garment
// discrepancy, damage, anything staff need to flag before or instead of
// processing) and logs it into status_history so it shows up in the
// Activity Log on both the admin drawer and the customer's own tracking
// page — independent of any status change.
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { message?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const message = (body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "Enter a message" }, { status: 400 });
  if (message.length > 1000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, code, status, status_history, customer_name, email, phone")
    .eq("code", params.code.trim().toUpperCase())
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    const history = order.status_history ?? [];
    const now = new Date().toISOString();
    await db.from("orders").update({
      status_history: [...history, { status: order.status, note: message, time: now }],
      updated_at: now,
    }).eq("id", order.id);

    sendCustomerNote(order.id, order.code, order.customer_name, order.email, order.phone, message).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Could not send note" }, { status: 500 });
  }
}
