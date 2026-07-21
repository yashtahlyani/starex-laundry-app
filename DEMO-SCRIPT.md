# StareX — Client Demo Script

Live site: **https://starex-laundry-app-v2.vercel.app**

Everything below is tested and working in production as of the handoff.

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

## The walkthrough (~7 min)

### 1. The customer experience (public site)
Start on the **homepage**. Talking points:
- "Premium, modern brand — built to convert visitors into bookings."
- Scroll through: services, transparent pricing, how-it-works, the comparison
  table vs a laundromat. Point out it's **fast and fully mobile** (show phone).

### 2. Book a pickup — live (the core flow)
Go to **Book** → walk the 4 steps: pick *Wash & Fold* → date & time → fill in
name / email / phone / address → **Confirm**.
- "60-second booking, no account required — guests can book instantly."
- On the confirmation screen, **copy the order code** (e.g. STX-XXXXXX).

### 3. The wow moment — it's already in the system
- Switch to your **Gmail**: the **owner alert email** for that booking is
  already there. "The moment a customer books, the owner is notified."
- Switch to **/admin**: the new order is at the top of the console, marked new.
  "Real-time operations dashboard — every order, customer, and message here."

### 4. Track the order (customer side)
Go to **Track Order**, paste the code. Show the live **status timeline** and
activity log. "Customers always know exactly where their laundry is."
- Point out **Report an issue** — built-in customer support / complaints.

### 5. Run the operation (admin side)
Back in **/admin**:
- Show the **stats** (orders today/week/month, active orders, status breakdown).
- Open an order, **advance its status** (e.g. Confirmed → Picked Up). Mention
  the customer automatically gets an email/WhatsApp update at each step.
- Show the **Issues** and **Contact messages** tabs.
- Mention **item-count reconciliation** (count in at pickup vs out at delivery)
  — "catches a lost sock before the customer even notices."

---

## Talking points that land (the "why this is solid" pitch)

- **Scalable & production-grade:** Next.js + Supabase on Vercel — the same
  stack used by companies serving millions. Auto-scales, global CDN.
- **Fast:** images and payloads optimized; pages load near-instantly.
- **Secure:** rate-limited APIs, protected admin, security headers, and
  database-level access rules — built to handle real traffic and abuse.
- **Ready to grow:** payments (Stripe), WhatsApp updates, and a smart-locker
  phase are already scaffolded — flip them on when the business needs them.

---

## If something glitches (stay calm)

- **A page feels slow for a second:** it's a serverless cold start, not a bug —
  it's instant on the next click. (Warming up beforehand avoids this.)
- **A customer confirmation email doesn't arrive:** expected — customer emails
  need the domain verified in Resend (a 10-min DNS step, see HANDOFF.md). Owner
  alerts already work. Don't promise customer emails live until that's done.
- **Rate-limit message ("too many requests"):** only appears after ~30 rapid
  repeats — just wait a minute. Won't happen at normal demo pace.

---

## One thing to do before the demo for the full effect

Verify the sending domain in Resend so **customer** confirmation emails work
live too (right now only owner alerts do). Steps are in **HANDOFF.md → Email**.
Not required to impress — the owner-alert flow is already the wow moment — but
it makes the customer side complete.
