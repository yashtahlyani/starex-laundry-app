-- Run once in Supabase -> SQL Editor.
-- Adds the columns the new Stripe card-on-file flow needs: a customer books
-- with a card on file (SetupIntent, no charge yet), and once staff weigh the
-- order and confirm the final price, the admin console charges that saved
-- card via /api/stripe/charge. All columns are nullable and additive only —
-- existing orders and the booking flow are unaffected until Stripe keys are
-- actually set in .env.local (see lib/stripe.ts / isStripeConfigured()).

alter table public.orders
  add column if not exists stripe_customer_id       text,
  add column if not exists stripe_payment_method_id  text,
  add column if not exists stripe_payment_intent_id  text,
  add column if not exists card_brand                text,
  add column if not exists card_last4                text;
