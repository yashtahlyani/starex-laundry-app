/**
 * Backfill card brand / last4 on orders that stored the placeholders.
 *
 * stripe.confirmCardSetup() hands the browser a payment-method id, not an
 * expanded object, so the booking flow never had the card details and wrote
 * the literal strings "card" and "····" instead. Every order with a card on
 * file carries those placeholders, which is why the owner console shows
 * "CARD ending in ····" and can't tell one customer's card from another's.
 *
 * This reads each payment method back from Stripe and writes the real values.
 *
 * READ-ONLY against Stripe: paymentMethods.retrieve cannot move money. The
 * only writes are card_brand / card_last4 on orders that currently hold a
 * placeholder — it never touches an order that already has real digits, and
 * never touches anything else on the row.
 *
 * Dry run by default. Pass --apply to write.
 */
import fs from "fs";
import Stripe from "stripe";

const APPLY = process.argv.includes("--apply");

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").replace(/^﻿/, "").split(/\r?\n/)
    .filter(l => l.includes("=") && !l.trim().startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; })
);

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const SB = env.NEXT_PUBLIC_SUPABASE_URL;
const H = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

const isReal = v => typeof v === "string" && /^\d{4}$/.test(v);

const rows = await (await fetch(
  `${SB}/rest/v1/orders?select=id,code,customer_name,card_brand,card_last4,stripe_payment_method_id&stripe_payment_method_id=not.is.null`,
  { headers: H }
)).json();

console.log(`${rows.length} orders have a payment method on file`);
const needing = rows.filter(r => !isReal(r.card_last4));
console.log(`${needing.length} still hold a placeholder\n`);

let fixed = 0, failed = 0;
for (const r of needing) {
  let pm;
  try {
    pm = await stripe.paymentMethods.retrieve(r.stripe_payment_method_id);
  } catch (e) {
    console.log(`  !! ${r.code}  could not read from Stripe: ${e.message.slice(0, 80)}`);
    failed++;
    continue;
  }
  const brand = pm.card?.brand ?? null;
  const last4 = pm.card?.last4 ?? null;
  if (!isReal(last4)) {
    console.log(`  -- ${r.code}  Stripe returned no card details (type: ${pm.type})`);
    failed++;
    continue;
  }
  console.log(`  ${APPLY ? "fixed" : "would fix"}  ${r.code.padEnd(11)} ${(r.customer_name ?? "").padEnd(18)} -> ${brand} ****${last4}`);
  if (APPLY) {
    const res = await fetch(`${SB}/rest/v1/orders?id=eq.${r.id}`, {
      method: "PATCH", headers: H,
      body: JSON.stringify({ card_brand: brand, card_last4: last4 }),
    });
    if (!res.ok) { console.log(`     write failed: ${res.status} ${(await res.text()).slice(0, 120)}`); failed++; continue; }
  }
  fixed++;
}

console.log(`\n${APPLY ? "updated" : "would update"}: ${fixed}   could not resolve: ${failed}`);
if (!APPLY) console.log("(DRY RUN — pass --apply to write)");
