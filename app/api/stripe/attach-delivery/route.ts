import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Writes the customer's requested delivery window onto the PaymentIntent
 * BEFORE the card is confirmed.
 *
 * The delivery window is typed on the payment page and used to be sent only
 * to /api/stripe/confirm-payment, which runs after the charge. The Stripe
 * webhook races that route and sometimes wins — and when it did, it had no
 * idea a window had been given, so the owner's email said the customer
 * "didn't specify a delivery time" for a customer who had (reported
 * 2026-10-18; she'd asked for between 10 and noon).
 *
 * Stripe copies PaymentIntent metadata onto the resulting Charge, so putting
 * it here means every downstream path sees the same value regardless of which
 * one lands first.
 *
 * Writing it can never block the payment: the caller ignores failures, and
 * confirm-payment still sends the window directly as a fallback.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are not enabled" }, { status: 400 });
  }

  const allowed = await checkRateLimit(`rate:attach-delivery:${clientIp(req)}`, 30, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: { orderCode?: string; paymentIntentId?: string; deliveryRequest?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const orderCode = (body.orderCode ?? "").trim().toUpperCase();
  const paymentIntentId = (body.paymentIntentId ?? "").trim();
  // Same cap as confirm-payment — this lands in an email subject line.
  const deliveryRequest = (body.deliveryRequest ?? "").trim().slice(0, 300);

  if (!orderCode || !/^pi_[A-Za-z0-9_]{8,64}$/.test(paymentIntentId) || !deliveryRequest) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id")
    .eq("code", orderCode)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    const intent = await stripe!.paymentIntents.retrieve(paymentIntentId);
    // The PaymentIntent must belong to this order, or this endpoint could be
    // used to scribble on someone else's payment.
    if (intent.metadata?.order_id !== order.id) {
      return NextResponse.json({ error: "Payment does not match this order" }, { status: 400 });
    }
    await stripe!.paymentIntents.update(paymentIntentId, {
      metadata: { ...intent.metadata, delivery_request: deliveryRequest },
    });
    return NextResponse.json({ success: true });
  } catch {
    // Never surfaced to the customer — confirm-payment carries the window as
    // a fallback, and a failure here must not stop them paying.
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
