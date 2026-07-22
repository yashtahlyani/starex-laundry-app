import { NextResponse } from "next/server";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// Public, safe to call unauthenticated — only ever returns the publishable
// key, never a secret. The booking flow calls this first to decide whether
// to render the card-on-file step at all; when Stripe isn't configured yet,
// `configured` is false and the booking flow behaves exactly as it did
// before this feature existed (no card step, nothing blocks a booking).
export async function GET() {
  return NextResponse.json({
    configured: isStripeConfigured(),
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
  });
}
