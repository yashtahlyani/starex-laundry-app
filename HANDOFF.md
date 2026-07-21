# StareX Laundry — Handoff Guide

Customer-facing booking site + owner admin console for StareX Laundry
(Brampton & Mississauga). Live at **https://starex-laundry-app-v2.vercel.app**.

## Stack

- **Next.js 14** (App Router) on **Vercel**
- **Supabase** — database + customer/owner authentication
- **Resend** — transactional email (booking confirmations, owner alerts)
- **Twilio** — WhatsApp status updates (optional)
- **Redis** — rate limiting, admin-stats cache, notification queue (optional)
- **Stripe** — pre-authorization flow (dormant, see below)

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables.
`.env.example` documents every variable. The important ones:

| Variable | Required | What breaks without it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Everything |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Bookings, admin console, tracking |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Links in emails; SEO domain (set to `https://` + your real domain) |
| `ADMIN_EMAILS` | ✅ | Which accounts may open `/admin` (comma-separated) |
| `RESEND_API_KEY` | ⚠️ strongly recommended | **No emails at all** — customers get no booking confirmation |
| `ADMIN_NOTIFICATION_EMAIL` | ⚠️ strongly recommended | Owner gets no email when a booking/contact/issue arrives |
| `REDIS_URL` | recommended | Rate limiting and the notification queue silently switch off |
| `TWILIO_*` | optional | WhatsApp updates are skipped |
| `STRIPE_*` | not yet | Payments are dormant (see below) |

## One-time database task

Run [supabase/2026-07-21-orders-code-unique.sql](supabase/2026-07-21-orders-code-unique.sql)
once in Supabase → SQL Editor. It makes order codes database-enforced unique.

The live database schema is **`freshdrop/supabase/schema.sql`**
(plus the issues / contact_submissions sections at the bottom of
`supabase/schema.sql`). The orders/customers sections at the top of
`supabase/schema.sql` are an old design draft — don't run them.

## Admin console

- URL: `/admin` — requires signing in with an email listed in `ADMIN_EMAILS`
  (or the owner account, `owner@starex.ca` — defined in `lib/owner.ts`).
- Tabs: incoming orders, all orders (with item-count reconciliation at pickup
  vs delivery), issues, contact messages, stats.
- Order status changes trigger customer email/WhatsApp automatically.

## What's intentionally dormant

- **Stripe payments** — no card is collected today; bookings are pay-on-pickup.
  The webhook (`app/api/stripe/webhook`) is ready: to activate, build a
  PaymentIntent flow that sets `metadata.order_id`, then add the `STRIPE_*`
  env vars. See the comment block at the top of the webhook route.
- **Service-area postal code check** — `SERVICE_AREA_POSTAL_PREFIXES` in
  `lib/pricing.ts` is empty (all addresses accepted) until the serviceable
  prefixes are confirmed.
- **Notification worker** — with `REDIS_URL` set, run
  `npm run worker:notification` as a separate process for queued, retried
  notification delivery. Without Redis, notifications send inline
  (best-effort, no retries).

## Deploying

Pushes to `master` on GitHub auto-deploy via Vercel (or run `npx vercel --prod`).

When the real domain is attached: add it in Vercel → Domains, then update
`NEXT_PUBLIC_SITE_URL` to the new `https://` origin — the sitemap, robots.txt,
OG tags, and email links all follow it automatically.
