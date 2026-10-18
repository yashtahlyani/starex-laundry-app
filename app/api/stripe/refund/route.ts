import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { calculateHst } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/**
 * Refunds a card payment from the owner console.
 *
 * Asked for on 2026-10-18 ("Can we return from the stripe account if found
 * double entry?"). Until now a refund meant logging into Stripe, and the
 * order in the console would still read "Paid" afterwards.
 *
 * Admin only. Amounts are in CAD and tax-inclusive — that's what the customer
 * was actually charged and what the owner reads off the order, so asking him
 * to work back to a pre-tax subtotal to refund would invite mistakes.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are not enabled" }, { status: 400 });
  }

  let body: { orderCode?: string; amountCad?: number; reason?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const orderCode = (body.orderCode ?? "").trim().toUpperCase();
  if (!orderCode) return NextResponse.json({ error: "orderCode is required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, code, status, status_history, price, payment_status, stripe_payment_intent_id, stripe_customer_id")
    .eq("code", orderCode)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.payment_status !== "paid") {
    return NextResponse.json({ error: "This order isn't marked as paid, so there's nothing to refund." }, { status: 400 });
  }

  try {
    // Older orders were paid before the PaymentIntent was recorded on the
    // row, so fall back to finding the charge by the order id Stripe carries
    // in its metadata rather than refusing to refund them.
    let paymentIntentId = order.stripe_payment_intent_id as string | null;
    if (!paymentIntentId && order.stripe_customer_id) {
      const list = await stripe!.paymentIntents.list({ customer: order.stripe_customer_id, limit: 50 });
      const hit = list.data.find(pi => pi.metadata?.order_id === order.id && pi.status === "succeeded");
      paymentIntentId = hit?.id ?? null;
      if (paymentIntentId) {
        await db.from("orders").update({ stripe_payment_intent_id: paymentIntentId }).eq("id", order.id);
      }
    }
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "No card payment found for this order — if it was paid in cash or by e-transfer, refund it the same way." },
        { status: 400 }
      );
    }

    const intent = await stripe!.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      return NextResponse.json({ error: `That payment is "${intent.status}", so it can't be refunded.` }, { status: 400 });
    }

    const chargedCents = intent.amount_received || intent.amount;
    // Already-refunded amount, so a second partial refund can't take the
    // total past what was charged.
    const chargeId = typeof intent.latest_charge === "string" ? intent.latest_charge : intent.latest_charge?.id;
    let refundedCents = 0;
    if (chargeId) {
      const charge = await stripe!.charges.retrieve(chargeId);
      refundedCents = charge.amount_refunded ?? 0;
    }
    const remainingCents = chargedCents - refundedCents;
    if (remainingCents <= 0) {
      return NextResponse.json({ error: "This payment has already been fully refunded." }, { status: 400 });
    }

    const requested = body.amountCad;
    const amountCents = requested == null
      ? remainingCents
      : Math.round(Number(requested) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ error: "Enter a refund amount greater than zero." }, { status: 400 });
    }
    if (amountCents > remainingCents) {
      return NextResponse.json(
        { error: `That's more than is left on this payment — at most $${(remainingCents / 100).toFixed(2)} can be refunded.` },
        { status: 400 }
      );
    }

    const refund = await stripe!.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents,
      metadata: { order_id: order.id, order_code: order.code },
    });

    const isFull = amountCents === remainingCents && refundedCents === 0;
    const reason = (body.reason ?? "").trim().slice(0, 200);
    const note = `Refunded $${(amountCents / 100).toFixed(2)} CAD to the customer's card${isFull ? " (full refund)" : " (partial refund)"}${reason ? ` — ${reason}` : ""}`;

    const history = order.status_history ?? [];
    const update: Record<string, unknown> = {
      status_history: [...history, { status: order.status, note, time: new Date().toISOString() }],
      updated_at: new Date().toISOString(),
    };
    // A fully refunded order is not money we hold, so it stops reading "Paid".
    // The note above is what tells staff it was refunded rather than never
    // paid — a separate "refunded" state would need a schema change.
    if (amountCents + refundedCents >= chargedCents) {
      update.payment_status = "unpaid";
      update.paid_at = null;
    }
    await db.from("orders").update(update).eq("id", order.id);

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      refundedCad: amountCents / 100,
      fullyRefunded: amountCents + refundedCents >= chargedCents,
      note,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Refund failed" }, { status: 500 });
  }
}
