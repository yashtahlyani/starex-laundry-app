import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Reads back the brand and last 4 digits of a just-saved card.
 *
 * stripe.confirmCardSetup() resolves with setupIntent.payment_method as a
 * plain id string, not an expanded object — so the browser never actually had
 * the card details, and the booking flow was falling back to the placeholders
 * "card" and "····". Those placeholders were then stored on every order with
 * a card, which is why the owner console showed "CARD ending in ····" instead
 * of identifying the card (found 2026-10-16: 18 of 18 affected).
 *
 * Only the brand and last four are returned — both are safe to show and are
 * what Stripe itself displays. Nothing here can move money.
 */
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
  }

  const allowed = await checkRateLimit(`rate:pm:${clientIp(req)}`, 30, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { paymentMethodId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const id = body.paymentMethodId;
  // Shape-checked before it reaches Stripe so this can't be used to probe the
  // API with arbitrary identifiers.
  if (!id || typeof id !== "string" || !/^pm_[A-Za-z0-9_]{8,64}$/.test(id)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  try {
    const pm = await stripe.paymentMethods.retrieve(id);
    return NextResponse.json({
      cardBrand: pm.card?.brand ?? null,
      cardLast4: pm.card?.last4 ?? null,
    });
  } catch {
    // The card is already saved at this point; failing to read its label back
    // must never block the booking, so this degrades to "unknown".
    return NextResponse.json({ cardBrand: null, cardLast4: null });
  }
}
