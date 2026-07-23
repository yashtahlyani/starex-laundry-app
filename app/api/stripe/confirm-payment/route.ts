import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";
import { enqueueStatusUpdate } from "@/lib/queue/notification.queue";

export const dynamic = "force-dynamic";

// Public — called right after the customer's browser gets a "succeeded"
// result from Stripe.js. Never trusts that client-side result on its own:
// re-fetches the PaymentIntent directly from Stripe (server-to-server) and
// only marks the order paid if Stripe itself confirms it succeeded and the
// PaymentIntent's metadata.order_id matches this order — otherwise a
// customer could call this endpoint directly and claim an unpaid order as
// paid. The Stripe webhook (app/api/stripe/webhook/route.ts) is a backstop
// for the same event in case the customer closes the tab before this call
// completes — both paths converge on the same idempotent markPaid().
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Online payment isn't enabled yet" }, { status: 400 });
  }

  const allowed = await checkRateLimit(`rate:pay-confirm:${clientIp(req)}`, 30, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many requests — please try again later" }, { status: 429 });

  let body: { orderCode?: string; paymentIntentId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const orderCode = (body.orderCode ?? "").trim().toUpperCase();
  const paymentIntentId = (body.paymentIntentId ?? "").trim();
  if (!orderCode || !paymentIntentId) {
    return NextResponse.json({ error: "orderCode and paymentIntentId are required" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, code, customer_name, email, phone, payment_status")
    .eq("code", orderCode)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.payment_status === "paid") {
    return NextResponse.json({ success: true, status: "already_paid" });
  }

  try {
    const intent = await stripe!.paymentIntents.retrieve(paymentIntentId);
    if (intent.metadata?.order_id !== order.id) {
      return NextResponse.json({ error: "Payment does not match this order" }, { status: 400 });
    }
    if (intent.status !== "succeeded") {
      return NextResponse.json({ error: `Payment not completed (${intent.status})` }, { status: 400 });
    }

    const result = await new OrderRepository(db).markPaid(order.id, "Paid online by customer", intent.amount / 100);

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
    return NextResponse.json({ error: err.message ?? "Could not confirm payment" }, { status: 500 });
  }
}
