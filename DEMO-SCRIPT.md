# StareX — Client Demo Script

Live site: **https://starex-laundry-app-v2.vercel.app**

Everything below is tested and working in production as of the last update
(2026-07-23).

---

## Before the client arrives (2 min)

- [ ] Open the live site once in your browser to **warm it up** (first load
      after idle can take a second — you don't want that during the demo).
- [ ] Have the **owner login ready**: `owner@starex.ca` + your password, at
      `/auth`. Log in once beforehand so you land on `/admin` instantly later.
- [ ] Open the site on your **phone** too — you'll show it's fully mobile.
- [ ] Have your **Gmail open** (owner alerts land there) for the wow moment.
- [ ] Optional: open `/admin` in one tab and the public site in another so you
      can switch without typing.

---

## The walkthrough (~10 min)

### 1. The customer experience (public site)
Start on the **homepage**. Talking points:
- "Premium, modern brand — built to convert visitors into bookings."
- Scroll through: services, transparent pricing, how-it-works, the comparison
  table vs a laundromat. Point out it's **fast and fully mobile** (show phone).
- Show the **Offer page** (`/offer`) — the "5 for $50" dry-clean combo with a
  real savings example priced off the actual catalog, not made-up numbers.

### 2. Book a pickup — live (the core flow)
Go to **Book** → walk the 4 steps: pick *Dry Cleaning* → date & time → fill in
name / email / phone / address → **Confirm**.
- "60-second booking, no account required — guests can book instantly."
- Point out the **item price list sitting right in the sidebar** the whole
  time — customers see exact prices without ever leaving the booking flow.
- On the confirmation screen, **copy the order code**. Dry-clean orders get a
  `DTX-` code, Wash & Fold gets `STX-` — different colors everywhere too, so
  the two queues are easy to tell apart at a glance.

### 3. The wow moment — it's already in the system
- Switch to your **Gmail**: the **owner alert email** for that booking is
  already there. "The moment a customer books, the owner is notified."
- Switch to **/admin**: the new order is at the top of the console, marked new.
  "Real-time operations dashboard — every order, customer, and message here."

### 4. Track the order (customer side)
Go to **Track Order**, paste the code. Show the live **status timeline** and
activity log. "Customers always know exactly where their laundry is."
- Point out **Report an issue** — built-in customer support / complaints.

### 5. Run the operation (admin side) — this is the part that saves them time
Back in **/admin**:
- Show the **Wash & Fold / Dry Clean toggle** on the Orders tab — "you work
  one queue at a time instead of scanning a mixed list."
- Show the **search bar** and **Export CSV** button — "every order's full
  history, one click, opens straight in Excel — for your own records or your
  accountant."
- Open an order, **advance its status**: Confirmed → Picked Up → Ready for
  Delivery → Delivered. Mention it's now a **4-click pipeline** (down from 6)
  — no more separate "In Process" or "Payment Pending" clicks eating time.
- Show **payment tracking**: the Paid/Unpaid badge on every order, and the
  three ways to collect — Charge a saved card, Mark Paid for cash/e-transfer,
  or **save the amount and let the customer pay online themselves** from
  their tracking page. "Whichever way payment comes in, it shows up here
  automatically — you don't have to update anything by hand."
- Show the **stats** (orders today/week/month, active orders, status
  breakdown).
- Show the **Issues** and **Contact messages** tabs.
- Mention **item-count reconciliation** (count in at pickup vs out at
  delivery) — "catches a lost sock before the customer even notices."

---

## Talking points that land (the "why this is solid" pitch)

- **Scalable & production-grade:** Next.js + Supabase on Vercel — the same
  stack used by companies serving millions. Auto-scales, global CDN.
- **Fast:** images and payloads optimized; pages load near-instantly.
- **Secure:** rate-limited APIs, protected admin, security headers, and
  database-level access rules — built to handle real traffic and abuse.
- **Payments built the way real laundry apps do it** (CleanCloud, Turns, etc.)
  — card saved at booking, charged after the order is weighed, or the
  customer pays themselves online. Fully built and wired to Stripe; **just
  needs a real Stripe account connected** to go live (currently dormant with
  test/empty keys, so nothing charges by accident before that's done).

---

## If something glitches (stay calm)

- **A page feels slow for a second:** it's a serverless cold start, not a bug —
  it's instant on the next click. (Warming up beforehand avoids this.)
- **A customer confirmation email doesn't arrive:** expected — customer emails
  need the domain verified in Resend (a 10-min DNS step, see HANDOFF.md). Owner
  alerts already work. Don't promise customer emails live until that's done.
- **The online payment section doesn't show up:** expected — it only appears
  once real Stripe keys are connected. Everything else (Charge Card / Mark
  Paid from the admin side) still works without it.
- **Rate-limit message ("too many requests"):** only appears after ~30 rapid
  repeats — just wait a minute. Won't happen at normal demo pace.

---

## Two things to do before the demo for the full effect

1. Verify the sending domain in Resend so **customer** confirmation emails
   work live too (right now only owner alerts do). Steps are in
   **HANDOFF.md → Email**. Not required to impress — the owner-alert flow is
   already the wow moment — but it makes the customer side complete.
2. If you want to demo **real online payment end-to-end**, connect a Stripe
   account and drop the keys into `.env.local` beforehand — otherwise skip
   that part of the payment demo and just describe it (still true and still
   impressive, just not clickable yet).
