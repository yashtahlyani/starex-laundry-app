/**
 * Link paid orders back to the Stripe payment that paid them.
 *
 * Only the admin charge route ever stored stripe_payment_intent_id. Orders
 * the customer paid themselves had no reference at all, so a refund had to
 * find the charge by searching Stripe metadata first — which works, but
 * depends on the customer record still being there and on the charge being
 * within the last 50 for that customer.
 *
 * Both payment paths record it going forward (18 Oct). This backfills the
 * ones from before.
 *
 * READ-ONLY against Stripe — paymentIntents.list cannot move money. The only
 * write is stripe_payment_intent_id on orders that currently have none, and
 * only when the PaymentIntent's own metadata names that exact order.
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

const rows = await (await fetch(
  `${SB}/rest/v1/orders?select=id,code,customer_name,price,stripe_customer_id,stripe_payment_intent_id&payment_status=eq.paid&stripe_payment_intent_id=is.null&stripe_customer_id=not.is.null`,
  { headers: H }
)).json();

console.log(`${rows.length} paid order(s) with a Stripe customer but no payment reference\n`);

let linked = 0, unresolved = 0;
for (const r of rows) {
  let list;
  try {
    list = await stripe.paymentIntents.list({ customer: r.stripe_customer_id, limit: 50 });
  } catch (e) {
    console.log(`  !! ${r.code}  Stripe read failed: ${e.message.slice(0, 70)}`);
    unresolved++;
    continue;
  }
  // Matched on the order id Stripe carries in its own metadata — never on
  // amount or timing, which could match the wrong order for a customer who
  // placed two identical ones.
  const hit = list.data.find(pi => pi.metadata?.order_id === r.id && pi.status === "succeeded");
  if (!hit) {
    console.log(`  -- ${r.code.padEnd(12)} ${String(r.customer_name).slice(0, 18).padEnd(18)} no matching succeeded PaymentIntent`);
    unresolved++;
    continue;
  }
  console.log(`  ${APPLY ? "linked  " : "would link"} ${r.code.padEnd(12)} ${String(r.customer_name).slice(0, 18).padEnd(18)} $${(hit.amount / 100).toFixed(2)}  ${hit.id}`);
  if (APPLY) {
    const res = await fetch(`${SB}/rest/v1/orders?id=eq.${r.id}`, {
      method: "PATCH", headers: H,
      body: JSON.stringify({ stripe_payment_intent_id: hit.id }),
    });
    if (!res.ok) { console.log(`     write failed: ${res.status}`); unresolved++; continue; }
  }
  linked++;
}

console.log(`\n${APPLY ? "linked" : "would link"}: ${linked}   unresolved: ${unresolved}`);
if (!APPLY) console.log("(DRY RUN — pass --apply to write)");
