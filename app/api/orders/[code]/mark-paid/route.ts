import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { sendPaymentReceived } from "@/lib/notifications";
import { calculateHst } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// Admin-only: confirms payment collected outside Stripe (cash, e-transfer,
// etc.) — used whenever there's no card on file to charge. Only records
// payment; delivery is a separate action staff take explicitly.
//
// amountCad is the pre-tax subtotal, same as everywhere else — staff collect
// that amount plus 13% HST from the customer in person.
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { amountCad?: number };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const amountCad = body.amountCad;
  if (amountCad != null && (typeof amountCad !== "number" || !Number.isFinite(amountCad) || amountCad <= 0)) {
    return NextResponse.json({ error: "amountCad must be a positive number" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const orders = new OrderRepository(db);
  const { data: order } = await db
    .from("orders")
    .select("id, code, customer_name, email, phone")
    .eq("code", params.code.trim().toUpperCase())
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    const breakdown = amountCad != null ? calculateHst(amountCad) : null;
    const note = breakdown ? `Payment received (manual) — $${breakdown.total.toFixed(2)} CAD incl. HST` : "Payment received (manual)";
    await orders.markPaid(order.id, note, amountCad);
    if (breakdown) {
      await sendPaymentReceived(order.id, order.code, order.customer_name, order.email, order.phone, breakdown).catch(() => {});
    }

    return NextResponse.json({ success: true, status: "paid" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Could not mark order paid" }, { status: 500 });
  }
}
