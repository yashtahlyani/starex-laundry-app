import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

// Creates (or reuses) a Stripe Customer for this email and issues a
// SetupIntent — this saves a card for later off-session use without
// charging anything now, since the real order total isn't known until staff
// weigh the laundry at pickup. The booking flow calls this right before
// showing the card form; the resulting client secret is only ever used
// client-side to confirm the card with Stripe.js, never touches our server.
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are not enabled yet" }, { status: 400 });
  }

  const allowed = await checkRateLimit(`rate:stripe-setup:${clientIp(req)}`, 15, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many requests — please try again later" }, { status: 429 });

  let body: { email?: string; name?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const email = (body.email ?? "").trim();
  const name = (body.name ?? "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  try {
    const existing = await stripe!.customers.list({ email, limit: 1 });
    const customer = existing.data[0] ?? await stripe!.customers.create({ email, name: name || undefined });

    const setupIntent = await stripe!.setupIntents.create({
      customer: customer.id,
      payment_method_types: ["card"],
      usage: "off_session",
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret, customerId: customer.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Could not start card setup" }, { status: 500 });
  }
}
