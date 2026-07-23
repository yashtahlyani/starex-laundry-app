import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

// Public (order code is the bearer, same trust model as GET /api/orders/[code])
// — creates a PaymentIntent for the order's staff-confirmed total so the
// customer can pay it themselves from their tracking page. Nothing is
// charged by this call; the customer confirms the card client-side with
// Stripe.js, and /api/stripe/confirm-payment verifies + records it server-side.
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Online payment isn't enabled yet" }, { status: 400 });
  }

  const allowed = await checkRateLimit(`rate:pay-intent:${clientIp(req)}`, 20, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many requests — please try again later" }, { status: 429 });

  let body: { orderCode?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const orderCode = (body.orderCode ?? "").trim().toUpperCase();
  if (!orderCode) return NextResponse.json({ error: "orderCode is required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, price, payment_status, email, stripe_customer_id, status")
    .eq("code", orderCode)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status === "cancelled") return NextResponse.json({ error: "This order was cancelled" }, { status: 400 });
  if (order.payment_status === "paid") return NextResponse.json({ error: "This order is already paid" }, { status: 400 });
  if (order.price == null || order.price <= 0) return NextResponse.json({ error: "This order doesn't have a confirmed total yet" }, { status: 400 });

  try {
    // Reuse the Stripe Customer from booking if one exists (keeps everything
    // under one Stripe customer record); otherwise Stripe creates an
    // anonymous one for this PaymentIntent.
    const intent = await stripe!.paymentIntents.create({
      amount: Math.round(order.price * 100),
      currency: "cad",
      ...(order.stripe_customer_id ? { customer: order.stripe_customer_id } : {}),
      receipt_email: order.email || undefined,
      metadata: { order_id: order.id, order_code: orderCode },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: intent.client_secret, amountCad: order.price });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Could not start payment" }, { status: 500 });
  }
}
