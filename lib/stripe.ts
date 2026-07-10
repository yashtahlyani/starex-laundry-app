import Stripe from "stripe";

// Server-only Stripe client. Undefined until STRIPE_SECRET_KEY is set in .env.local —
// callers must check `isStripeConfigured()` before using it, since payments are optional
// until the client's Stripe account is wired in (see app/api/bookings/route.ts).
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : null;

export function isStripeConfigured() {
  return stripe !== null;
}
