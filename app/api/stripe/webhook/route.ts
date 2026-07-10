import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Stripe needs the raw body to verify the webhook signature — Next.js route handlers
// get this by default (no bodyParser to disable, unlike the old pages/api style).
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe!.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.order_id;
    if (orderId) {
      const note =
        event.type === "payment_intent.succeeded"
          ? "Payment pre-authorized"
          : `Payment failed: ${intent.last_payment_error?.message ?? "unknown reason"}`;
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.from("order_status_events").insert({
        order_id: orderId,
        status: "scheduled",
        note,
        created_by: "stripe_webhook",
      });
    }
  }

  return NextResponse.json({ received: true });
}
