# StareX — Laundry Pickup & Delivery

Production web app for StareX Laundry (Brampton & Mississauga): a customer-facing
marketing + booking site and an owner admin console.

**Live:** https://starex-laundry-app-v2.vercel.app

> **New here? Read [HANDOFF.md](HANDOFF.md) first** — it covers environment
> variables, the database, admin access, email, and deployment.
> For a live client walkthrough, see [DEMO-SCRIPT.md](DEMO-SCRIPT.md).

## Stack

Next.js 14 (App Router) · Supabase (Postgres + Auth) · Vercel · Resend (email) ·
Upstash Redis (rate limiting + cache) · Twilio WhatsApp & Stripe (scaffolded, optional).

## Features

- **Marketing site** — home, services, pricing, how-it-works, about, FAQ, contact,
  terms, privacy. SEO-ready (sitemap, robots, OpenGraph, `LaundryService` JSON-LD).
- **Booking** — 4-step guest booking flow (`app/book`), no account required.
- **Order tracking** — `app/order`, live status timeline + "report an issue".
- **Accounts** — optional customer sign-up/sign-in; personal dashboard of orders.
- **Admin console** — `app/admin` (owner-only): orders, item-count reconciliation,
  issues, contact messages, and live stats.
- **Notifications** — customer + owner email (Resend) and WhatsApp (Twilio) on
  booking and each status change.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values — see HANDOFF.md
npm run dev                  # http://localhost:3000
```

## Project layout

```
app/            routes (pages + /api route handlers)
components/     UI components
lib/            services, repositories, integrations (supabase, redis, stripe, notifications)
  repositories/ data-access layer
  services/     business logic (booking, order status transitions)
supabase/       SQL migrations — run in the Supabase SQL editor
workers/        BullMQ notification worker (optional, needs a native REDIS_URL)
```

## Database

The live schema lives in `supabase/` — run the migration files in the Supabase
SQL editor. The base schema is `freshdrop/supabase/schema.sql`; dated files
(`supabase/2026-07-*.sql`) are incremental migrations. See HANDOFF.md.

## Deploying

Pushes to `master` auto-deploy on Vercel, or run `npx vercel deploy --prod`.
