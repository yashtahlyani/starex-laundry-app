import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { enqueueStatusUpdate } from "@/lib/queue/notification.queue";

export const dynamic = "force-dynamic";

// Admin-only: confirms payment collected outside Stripe (cash, e-transfer,
// etc.) — used whenever there's no card on file to charge. Auto-advances the
// order to Delivered if it's already Ready for Delivery, same as a
// successful card charge does, so this is the one action the owner takes
// for a manually-paid order instead of a separate status click.
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
    const note = amountCad != null ? `Payment received (manual) — $${amountCad.toFixed(2)} CAD` : "Payment received (manual)";
    const result = await orders.markPaid(order.id, note, amountCad);

    if (result.status === "delivered") {
      enqueueStatusUpdate({
        orderId: order.id,
        orderCode: order.code,
        customerName: order.customer_name,
        customerEmail: order.email,
        customerPhone: order.phone,
        newStatus: "delivered",
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, status: result.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Could not mark order paid" }, { status: 500 });
  }
}
