import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { enqueueStatusUpdate } from "@/lib/queue/notification.queue";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// ── Activation contract ──────────────────────────────────────────────────
// This route is dormant until STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are
// set (see lib/stripe.ts) and a real checkout/save-card flow exists to
// create the PaymentIntents this listens for. Whoever builds that flow
// MUST set `metadata: { order_id: <orders.id> }` on every PaymentIntent —
// every handler below keys off that field, and events without it are
// silently ignored rather than erroring, since Stripe can send events for
// PaymentIntents unrelated to this app (e.g. test-mode noise).
// ──────────────────────────────────────────────────────────────────────────

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

  const PAYMENT_NOTES: Partial<Record<Stripe.Event["type"], (obj: any) => string | null>> = {
    "payment_intent.succeeded":      () => "Payment pre-authorized",
    "payment_intent.payment_failed": (intent: Stripe.PaymentIntent) => `Payment failed: ${intent.last_payment_error?.message ?? "unknown reason"}`,
    "payment_intent.canceled":       () => "Payment authorization canceled",
    "charge.refunded":               (charge: Stripe.Charge) => `Refunded ${(charge.amount_refunded / 100).toFixed(2)} ${charge.currency.toUpperCase()}`,
  };

  const buildNote = PAYMENT_NOTES[event.type];
  if (buildNote) {
    const obj = event.data.object as Stripe.PaymentIntent | Stripe.Charge;
    // Stripe copies a PaymentIntent's metadata onto the Charge it produces,
    // so charge.refunded carries order_id here too as long as the checkout
    // flow set it on the PaymentIntent — no separate metadata write needed.
    const orderId = obj.metadata?.order_id;
    const note = buildNote(obj);

    if (orderId && note) {
      const supabaseAdmin = getSupabaseAdmin();
      const { data: order } = await supabaseAdmin.from("orders").select("code, status, status_history, payment_status, customer_name, email, phone").eq("id", orderId).single();
      if (order) {
        // A successful charge that the admin charge route hasn't already
        // recorded (payment_status still unpaid) marks the order paid here —
        // covers any future async payment path. Auto-advances to Delivered
        // if the order's already Ready for Delivery, same as the direct
        // charge route. Everything else (failures, cancellations, refunds)
        // is logged as a status_history note without touching fulfillment
        // status — that stays a human decision from the admin console.
        if (event.type === "payment_intent.succeeded" && order.payment_status !== "paid") {
          const amount = (obj as Stripe.PaymentIntent).amount;
          const result = await new OrderRepository(supabaseAdmin).markPaid(orderId, note, amount != null ? amount / 100 : undefined);
          if (result.status === "delivered") {
            enqueueStatusUpdate({
              orderId, orderCode: order.code, customerName: order.customer_name,
              customerEmail: order.email, customerPhone: order.phone, newStatus: "delivered",
            }).catch(() => {});
          }
        } else {
          const history = order.status_history ?? [];
          await supabaseAdmin
            .from("orders")
            .update({ status_history: [...history, { status: order.status, note, time: new Date().toISOString() }] })
            .eq("id", orderId);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
