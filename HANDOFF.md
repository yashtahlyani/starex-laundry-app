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
| `RESEND_API_KEY` | ✅ configured | No emails send without it |
| `RESEND_FROM_EMAIL` | ⚠️ see "Email" below | Sender address; must be a verified domain to reach customers |
| `ADMIN_NOTIFICATION_EMAIL` | ✅ configured | Owner gets no alert on new booking/contact/issue |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | ✅ configured | Rate limiting + admin-stats cache switch off without them |
| `TWILIO_*` | optional | WhatsApp updates are skipped |
| `STRIPE_*` | not yet | Payments are dormant (see below) |

## One-time database task

✅ **Done** — the unique index on `orders.code`
([supabase/2026-07-21-orders-code-unique.sql](supabase/2026-07-21-orders-code-unique.sql))
has already been applied to the live database. Kept here for reference / fresh
environments.

The live database schema is **`freshdrop/supabase/schema.sql`**
(plus the issues / contact_submissions sections at the bottom of
`supabase/schema.sql`). The orders/customers sections at the top of
`supabase/schema.sql` are an old design draft — don't run them.

## Email (Resend)

**Working now:** owner alerts (new booking / contact message / issue report)
are delivered via Resend to the address in `ADMIN_NOTIFICATION_EMAIL`.

**Not yet — needs a verified domain:** customer-facing emails (booking
confirmation, status updates). The Resend account is on the test tier, so it
currently sends from `onboarding@resend.dev`, which can only deliver to the
Resend account owner. To send to real customers:

1. In Resend → **Domains**, add `starexlaundry.ca` (or a subdomain like
   `mail.starexlaundry.ca`) and add the SPF/DKIM DNS records it gives you.
2. Once it shows **Verified**, set `RESEND_FROM_EMAIL` in Vercel to an address
   on that domain, e.g. `bookings@starexlaundry.ca`, and redeploy.
3. Point `ADMIN_NOTIFICATION_EMAIL` at the real business inbox (it's currently
   the developer's address for testing).

No code change is needed — the sender is fully env-driven.

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
- **Notification worker** — notifications currently send inline (best-effort,
  no retries). For durable, retried delivery, add a native `REDIS_URL`
  (`rediss://…` TCP endpoint) and run `npm run worker:notification` as a
  separate process. Note: the Upstash **REST** credentials power rate limiting
  and caching but can't drive BullMQ, which needs a TCP connection.

## Deploying

Pushes to `master` on GitHub auto-deploy via Vercel (or run `npx vercel --prod`).

When the real domain is attached: add it in Vercel → Domains, then update
`NEXT_PUBLIC_SITE_URL` to the new `https://` origin — the sitemap, robots.txt,
OG tags, and email links all follow it automatically.
