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
      // Record the payment outcome as a status_history event without changing
      // the order's actual status — a failed pre-auth shouldn't silently move
      // an order to a different fulfillment state, that's a human decision.
      const supabaseAdmin = getSupabaseAdmin();
      const { data: order } = await supabaseAdmin.from("orders").select("status, status_history").eq("id", orderId).single();
      if (order) {
        const history = order.status_history ?? [];
        await supabaseAdmin
          .from("orders")
          .update({ status_history: [...history, { status: order.status, note, time: new Date().toISOString() }] })
          .eq("id", orderId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
