# Starex — Laundry Booking Platform (Starter Scaffold)

This is the first working slice of the build described in `Laundry_Website_Build_Plan.docx`:
a Next.js + Tailwind booking flow (service → address/slot → details → confirm), the Supabase
schema for orders/customers/lockers, and the full Starex service catalog and branding.

## What's already built

- Home, Services, Book, Order Tracking, and Admin pages (`app/`), branded as **Starex**
- A working 4-step booking flow UI (`components/BookingFlow.tsx`) — currently submits to a
  mock delay and returns a demo order ID; wire it to `/api/bookings` once Supabase + Stripe
  are connected
- Database schema for the full order lifecycle, plus the Phase 2 locker tables, ready to run
  in Supabase (`supabase/schema.sql`)
- The full service catalog in `lib/pricing.ts` — Wash & Fold, Household, Dry Cleaning, Ironing,
  and Alteration, each item priced. **This is WeDoLaundry's public pricing with $1 taken off
  every line, as a temporary placeholder per Yash's instruction — confirm real numbers with the
  client before launch.** Search `TODO(pricing)` in that file for the couple of edge cases
  (e.g. the $0.99 promo) that need a real decision rather than a straight $1 cut.

## What's NOT built yet (needs real accounts/credentials first)

- Supabase read/write wiring (booking submission, order tracking, admin dashboard data)
- Stripe payment step
- Email + WhatsApp notification pipeline
- Sanity CMS content model for marketing/city pages
- CleanCloud + locker vendor integrations (Phase 2+)

## Accounts to create (free tiers are fine to start)

| Service | Sign up | Used for |
|---|---|---|
| Supabase | supabase.com | Database, auth, realtime admin dashboard |
| Stripe | stripe.com | Payments (needs a Canadian business account for payouts) |
| Resend or Postmark | resend.com / postmarkapp.com | Transactional email |
| Twilio | twilio.com | WhatsApp Business API messaging |
| Sanity | sanity.io | Editable marketing/city/pricing content |
| Vercel | vercel.com | Hosting/deployment |
| GitHub | github.com | Source control, connects to Vercel for auto-deploys |

Create each account, then copy `.env.example` to `.env.local` and paste in the keys as you get them —
share them with me (in this chat or a secure note) and I'll wire each integration in as it arrives.
We don't need all of them at once — Supabase + Stripe first gets the real booking flow working end to end.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in keys as you get them
npm run dev
```

## Next steps (in order)

1. Confirm real logo/brand colors, final pricing (see the pricing note above), and service area
   (postal codes) — update `tailwind.config.ts` brand colors and `lib/pricing.ts`.
2. Create the Supabase project, run `supabase/schema.sql`, drop the URL/keys into `.env.local`.
3. Wire `BookingFlow.tsx` to a real `/api/bookings` route that writes to Supabase.
4. Add Stripe pre-authorization on booking confirm.
5. Add the email (Resend/Postmark) + WhatsApp (Twilio) notification pipeline on order status changes.
6. Deploy to Vercel, connect the domain.
7. Sanity CMS for marketing/city pages once the booking flow is solid.
8. CleanCloud + locker integrations — Phase 2, once client is ready.
