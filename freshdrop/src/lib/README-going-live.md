# StareX — going live

Everything in the app is built and the code is **ready for the cloud**. What's
left are the steps that need *your* accounts/passwords (I can't create those
for you). Follow the checklist below — it's about 30–45 minutes total.

---

## How the app decides local vs. cloud
- **No `.env` keys →** runs in local (in-browser) mode. Great for demos.
- **`.env` has Supabase keys →** automatically uses the shared cloud database,
  with real accounts + real-time updates. No code changes needed; it flips
  based on the env vars. (See `src/lib/store.js`, `store.local.js`, `store.supabase.js`.)

---

## Part A — Cloud database (Supabase) — makes orders shared across all devices

1. Go to https://supabase.com → sign up (free) → **New project**. Pick a name
   and a database password (save it). Wait ~2 min for it to provision.
2. Open **SQL Editor** → New query → paste ALL of `supabase/schema.sql`
   (in this repo) → **Run**. This creates the tables, security rules, and
   real-time.
3. Open **Project Settings → API** and copy two values:
   - **Project URL**
   - **anon public** key
4. In the `freshdrop/` folder, copy `.env.example` to `.env` and paste them:
   ```
   VITE_SUPABASE_URL=...(Project URL)...
   VITE_SUPABASE_ANON_KEY=...(anon public key)...
   ```
5. Restart the dev server (`npx vite`) or rebuild. The app is now on the cloud.
6. Create your **owner account**: open the app → Sign up with the email you
   want as owner (e.g. `owner@starex.ca`). Then back in Supabase **SQL Editor**
   run:
   ```sql
   update public.profiles set role = 'owner' where email = 'owner@starex.ca';
   ```
   That one account can now see `/admin`. Everyone else is a customer.

> Note: in cloud mode Supabase emails a confirmation link on sign-up by default.
> To skip that during setup: Supabase → Authentication → Providers → Email →
> turn **Confirm email** off (turn it back on before real launch if you like).

---

## Part B — Put it on the internet (Vercel — free)

The repo already has `vercel.json` (so page refreshes work) and a `.gitignore`.

**Easiest (no terminal):**
1. Push this `freshdrop/` folder to a new GitHub repo.
2. Go to https://vercel.com → sign up → **Add New → Project** → import that repo.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
4. Add the two env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the
   Vercel project settings → **Deploy**.
5. You get a live URL like `starex.vercel.app`. Add your own domain in
   Vercel → Settings → Domains whenever you're ready.

**Or via terminal:** `npm i -g vercel` then `vercel` in the `freshdrop/` folder,
and add the env vars when prompted.

Netlify works the same way (build `npm run build`, publish `dist`, add the two
env vars; SPA redirects are handled by `vercel.json`'s equivalent — for Netlify
add a `_redirects` file with `/*  /index.html  200`).

---

## What I can finish for you
Once you've done **Part A steps 1–3** and paste me the Project URL + anon key
(the anon key is safe to expose — it's meant for the browser), I'll:
- wire the `.env`, run against your live database, and fix anything that
  behaves differently on the cloud vs. local,
- confirm the owner role + incoming-order realtime works end-to-end,
- then walk you through the Vercel deploy.

---

## Nice next steps (competitor parity: Rinse / Cleanly / Poplin)
- SMS/email on each status change (Twilio / Resend)
- Real card payment at delivery (Stripe)
- Weekly subscription plans
- Driver view (a simplified admin for pickups)
- Referral credits
