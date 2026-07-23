import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { enqueueStatusUpdate } from "@/lib/queue/notification.queue";

export const dynamic = "force-dynamic";

// Admin-only: charges the card saved at booking time for the final,
// staff-confirmed amount. Uses OrderRepository.markPaid, which also
// auto-advances the order straight to Delivered if it's already Ready for
// Delivery — the owner doesn't need a separate "mark delivered" click once
// the charge succeeds.
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are not enabled yet" }, { status: 400 });
  }

  let body: { orderCode?: string; amountCad?: number };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const orderCode = (body.orderCode ?? "").trim().toUpperCase();
  const amountCad = body.amountCad;
  if (!orderCode) return NextResponse.json({ error: "orderCode is required" }, { status: 400 });
  if (typeof amountCad !== "number" || !Number.isFinite(amountCad) || amountCad <= 0) {
    return NextResponse.json({ error: "amountCad must be a positive number" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: order, error } = await db
    .from("orders")
    .select("id, code, customer_name, email, phone, stripe_customer_id, stripe_payment_method_id")
    .eq("code", orderCode)
    .maybeSingle();
  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!order.stripe_customer_id || !order.stripe_payment_method_id) {
    return NextResponse.json({ error: "No card on file for this order — collect payment manually" }, { status: 400 });
  }

  try {
    const intent = await stripe!.paymentIntents.create({
      amount: Math.round(amountCad * 100),
      currency: "cad",
      customer: order.stripe_customer_id,
      payment_method: order.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      metadata: { order_id: order.id },
    });

    const orders = new OrderRepository(db);
    const result = await orders.markPaid(order.id, `Charged $${amountCad.toFixed(2)} CAD (card ending in the customer's card on file)`, amountCad);
    await db.from("orders").update({ stripe_payment_intent_id: intent.id }).eq("id", order.id);

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

    return NextResponse.json({ success: true, paymentIntentId: intent.id, status: result.status });
  } catch (err: any) {
    // Card declines etc. land here — surface Stripe's message so the admin
    // knows to fall back to a manual payment method instead of retrying blind.
    return NextResponse.json({ error: err.message ?? "Charge failed" }, { status: 402 });
  }
}
