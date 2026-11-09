// Removes a customer's saved card at their request.
//
// A customer who has paid and received their order is entitled to have their
// card details taken off the system, and under PIPEDA we should not keep them
// once the purpose they were collected for is finished. Ian Smith asked for
// exactly this on 7 Nov 2026 for DTX-677729.
//
// Detaches the payment method in Stripe and clears the card columns on the
// order. Deliberately keeps:
//   - stripe_payment_intent_id, so a refund is still possible. A refund is
//     issued against the PaymentIntent, not the card, so removing the card
//     costs nothing here.
//   - stripe_customer_id and the order's payment record, which are the
//     business's accounting records of a real transaction.
// What is removed is the stored instrument — the thing that could be charged
// again — which is what the customer is actually asking about.
//
//   node scripts/delete-saved-card.mjs DTX-677729           # show what it would do
//   node scripts/delete-saved-card.mjs DTX-677729 --apply   # do it

import { readFileSync } from "fs";

for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const CODE = process.argv.find(a => /^[A-Z]{3}-\d+$/.test(a));
const APPLY = process.argv.includes("--apply");

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SK = process.env.STRIPE_SECRET_KEY;

if (!CODE) { console.error("Usage: node scripts/delete-saved-card.mjs <ORDER-CODE> [--apply]"); process.exit(1); }
if (!SB_URL || !SB_KEY || !SK) { console.error("Missing Supabase or Stripe credentials."); process.exit(1); }

const sb = (path, init = {}) =>
  fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json", Prefer: "return=representation",
      ...init.headers,
    },
  });

const rows = await sb(`orders?code=eq.${encodeURIComponent(CODE)}&select=id,code,customer_name,email,status,payment_status,stripe_customer_id,stripe_payment_method_id,stripe_payment_intent_id,card_brand,card_last4`)
  .then(r => r.json());

if (!rows?.length) { console.error(`No order ${CODE}.`); process.exit(1); }
const o = rows[0];

console.log(`${o.code} — ${o.customer_name} <${o.email}>`);
console.log(`  status          : ${o.status} / ${o.payment_status}`);
console.log(`  saved card      : ${o.card_brand ?? "-"} ending ${o.card_last4 ?? "-"}`);
console.log(`  payment method  : ${o.stripe_payment_method_id ?? "(none stored)"}`);
console.log(`  payment intent  : ${o.stripe_payment_intent_id ?? "(none)"}  <- kept, refunds still possible`);

if (!o.stripe_payment_method_id) {
  console.log("\nNo saved card on this order. Nothing to remove.");
  process.exit(0);
}

// Any other order still relying on this card? Removing it would affect those too.
const shared = await sb(`orders?stripe_payment_method_id=eq.${o.stripe_payment_method_id}&select=code,status,payment_status`)
  .then(r => r.json());
const others = (shared ?? []).filter(r => r.code !== o.code);
if (others.length) {
  console.log(`\nAlso attached to: ${others.map(r => `${r.code} (${r.status}/${r.payment_status})`).join(", ")}`);
  const unpaid = others.filter(r => r.payment_status !== "paid");
  if (unpaid.length) {
    console.error(`REFUSING: ${unpaid.map(r => r.code).join(", ")} still unpaid and would lose the card it expects to be charged.`);
    process.exit(1);
  }
}

if (!APPLY) { console.log("\nDry run. Re-run with --apply to remove the card."); process.exit(0); }

// 1. Detach in Stripe — this is what actually deletes the card.
const res = await fetch(`https://api.stripe.com/v1/payment_methods/${o.stripe_payment_method_id}/detach`, {
  method: "POST",
  headers: { Authorization: `Bearer ${SK}`, "Content-Type": "application/x-www-form-urlencoded" },
});
const body = await res.json();

if (!res.ok) {
  // Already detached is a success for our purposes: the card is gone.
  const already = body?.error?.code === "payment_method_unattached"
    || /not attached|already been detached/i.test(body?.error?.message ?? "");
  if (!already) { console.error(`Stripe detach failed: ${JSON.stringify(body?.error ?? body)}`); process.exit(1); }
  console.log("Stripe: already detached.");
} else {
  console.log(`Stripe: detached ${body.id} (${body.card?.brand} ${body.card?.last4}).`);
}

// 2. Clear our copy, so nothing in the admin can offer to charge it again.
const upd = await sb(`orders?id=eq.${o.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    stripe_payment_method_id: null, card_brand: null, card_last4: null,
    updated_at: new Date().toISOString(),
  }),
});
console.log(upd.ok ? "Database: card details cleared." : `Database update failed: ${upd.status} ${await upd.text()}`);

const after = await sb(`orders?code=eq.${encodeURIComponent(CODE)}&select=card_brand,card_last4,stripe_payment_method_id,stripe_payment_intent_id,payment_status`)
  .then(r => r.json());
console.log(`\nVerified: ${JSON.stringify(after[0])}`);
