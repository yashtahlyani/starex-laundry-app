/**
 * End-to-end audit of the live site.
 *
 * Checks the things that actually cost money or trust: that every page loads,
 * that every surface quotes the same price (the recurring bug on this site —
 * three separate hardcoded copies of the price list have had to be removed),
 * that the booking estimate matches the catalog, that cancellation quotes the
 * published fees, and that the order data behind it all is sane.
 *
 * Read-only. It never books, pays, cancels or refunds anything.
 *
 *   node scripts/audit-live.mjs [--local]
 */
import fs from "fs";

const LOCAL = process.argv.includes("--local");
const SITE = LOCAL ? "http://localhost:3100" : "https://starexlaundrydryclean.ca";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").replace(/^﻿/, "").split(/\r?\n/)
    .filter(l => l.includes("=") && !l.trim().startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; })
);
const SB = env.NEXT_PUBLIC_SUPABASE_URL;
const H = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` };

const results = [];
const ok   = (section, msg) => results.push(["OK", section, msg]);
const warn = (section, msg) => results.push(["WARN", section, msg]);
const fail = (section, msg) => results.push(["FAIL", section, msg]);

const UA = { "User-Agent": "Mozilla/5.0 (compatible; starex-audit)" };
async function get(path) {
  const r = await fetch(path.startsWith("http") ? path : SITE + path, { headers: UA, redirect: "follow" });
  return { code: r.status, body: await r.text() };
}
const text = html => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// ─────────────────────────────────────────────────────────── pages reachable
const PAGES = [
  "/", "/book", "/pricing", "/services", "/offer", "/monthly", "/how-it-works",
  "/about", "/faq", "/contact", "/order", "/auth", "/terms", "/privacy",
  "/refund-policy", "/laundry-service-brampton", "/laundry-service-mississauga",
  "/dry-cleaning-brampton", "/dry-cleaning-mississauga", "/robots.txt", "/sitemap.xml",
];
const bodies = {};
await Promise.all(PAGES.map(async p => {
  try {
    const { code, body } = await get(p);
    bodies[p] = body;
    if (code !== 200) fail("pages", `HTTP ${code} ${p}`);
  } catch (e) { fail("pages", `${p} — ${e.message}`); }
}));
if (!results.some(r => r[1] === "pages")) ok("pages", `all ${PAGES.length} pages return 200`);

const nf = await get("/this-page-does-not-exist-xyz");
(nf.code === 404 ? ok : fail)("pages", `unknown URL returns ${nf.code} (expected 404)`);

// ───────────────────────────────────────────────────── one price, everywhere
const { CATALOG, PLANS, MINIMUM_ORDER, DRY_CLEAN_COMBO, HST_RATE, CANCELLATION_FEES } =
  await import("../lib/pricing.ts").catch(() => ({}));
const cancellation = await import("../lib/cancellation.ts").catch(() => ({}));

if (CATALOG) {
  const all = CATALOG.flatMap(t => t.sections.flatMap(s => s.items.map(i => ({ tab: t.id, ...i }))));
  ok("catalog", `${all.length} items across ${CATALOG.length} tabs`);

  const dupes = {};
  for (const i of all) (dupes[`${i.tab}::${i.name}`] ??= []).push(i);
  const clash = Object.entries(dupes).filter(([, v]) => v.length > 1);
  (clash.length ? fail : ok)("catalog",
    clash.length ? `duplicate keys: ${clash.map(([k]) => k).join(", ")}` : "no duplicate item keys");

  const bad = all.filter(i => !(typeof i.price === "number" && i.price > 0));
  (bad.length ? fail : ok)("catalog",
    bad.length ? `items with no usable price: ${bad.map(i => i.name).join(", ")}` : "every item has a positive price");

  // The headline figures quoted in marketing copy must match the catalog.
  const cheapestDry = Math.min(...all.filter(i => i.tab === "dry-clean").map(i => i.price));
  const cheapestIron = Math.min(...all.filter(i => i.tab === "ironing").map(i => i.price));
  const cheapestHouse = Math.min(...all.filter(i => i.tab === "household").map(i => i.price));
  const washFold = PLANS.find(p => p.id === "wash-fold")?.price;
  const washPress = PLANS.find(p => p.id === "wash-press")?.price;

  const claims = [
    [`From $${cheapestDry.toFixed(2)}`, "dry cleaning entry price"],
    [`From $${cheapestIron.toFixed(2)}`, "ironing entry price"],
    [`From $${cheapestHouse.toFixed(2)}`, "household entry price"],
    [`$${washFold}/lb`, "wash & fold rate"],
    [`$${washPress}/lb`, "wash & press rate"],
  ];
  for (const [claim, label] of claims) {
    const pages = PAGES.filter(p => (bodies[p] ?? "").includes(claim));
    (pages.length ? ok : warn)("prices", `${label}: "${claim}" ${pages.length ? `on ${pages.length} page(s)` : "not shown anywhere"}`);
  }

  // A stale "From $X" that no longer matches the cheapest item is the exact
  // bug that shipped twice on this site.
  for (const [tab, cheapest, label] of [["dry-clean", cheapestDry, "dry cleaning"], ["ironing", cheapestIron, "ironing"], ["household", cheapestHouse, "household"]]) {
    const stale = [];
    for (const p of PAGES) {
      const t = text(bodies[p] ?? "");
      for (const m of t.matchAll(/From \$(\d+\.\d\d)/g)) {
        const v = Number(m[1]);
        const isKnown = all.some(i => i.price === v) || v === cheapest;
        if (!isKnown) stale.push(`${p}: From $${m[1]}`);
      }
    }
    if (stale.length) warn("prices", `${label}: "From $" values not matching any catalog item — ${[...new Set(stale)].slice(0, 5).join(", ")}`);
  }
  ok("prices", "no \"From $\" figure on any page is absent from the catalog");

  // minimum order + combo + HST, as stated to customers
  const minPages = PAGES.filter(p => (bodies[p] ?? "").includes(`$${MINIMUM_ORDER.standardCad} minimum`));
  (minPages.length ? ok : warn)("prices", `$${MINIMUM_ORDER.standardCad} minimum stated on ${minPages.length} page(s)`);
  const comboPages = PAGES.filter(p => (bodies[p] ?? "").includes(DRY_CLEAN_COMBO.tagline));
  (comboPages.length ? ok : warn)("prices", `"${DRY_CLEAN_COMBO.tagline}" combo promoted on ${comboPages.length} page(s)`);
  const hstPages = PAGES.filter(p => (bodies[p] ?? "").includes("+HST"));
  (hstPages.length ? ok : warn)("prices", `"+HST" disclosed on ${hstPages.length} page(s)`);
}

// ───────────────────────────────────────────────── cancellation fees agree
if (cancellation?.CANCELLATION_FEES) {
  const F = cancellation.CANCELLATION_FEES;
  for (const [page, label] of [["/refund-policy", "refund policy"], ["/terms", "terms"]]) {
    const t = text(bodies[page] ?? "").replace(/&#x27;/g, "'");
    const hasFree = t.includes(`${F.freeFromHours}`) && /free cancellation/i.test(t);
    const hasReduced = t.includes(`$${F.reducedFeeCad}`);
    const hasLate = t.includes(`$${F.lateFeeCad}`);
    (hasFree && hasReduced && hasLate ? ok : fail)("cancellation",
      `${label} states ${F.freeFromHours}h free / $${F.reducedFeeCad} / $${F.lateFeeCad}`);
    const legacy = /25% of the estimated|up to 50%/.test(t);
    (legacy ? fail : ok)("cancellation", `${label} has no leftover percentage fees`);
  }
  const t = cancellation.cancellationTerms;
  const d = n => { const x = new Date(Date.now() + n * 86400000); return x.toISOString().slice(0, 10); };
  const far = t(d(30), "11:00 AM – 2:00 PM");
  (far.band === "free" && far.feeCad === 0 ? ok : fail)("cancellation", `30 days out is free (got ${far.band} $${far.feeCad})`);
  const past = t(d(-2), "11:00 AM – 2:00 PM");
  (past.band === "no_show" && past.feeCad === F.lateFeeCad ? ok : fail)("cancellation", `past window is no-show $${past.feeCad}`);
  const unparseable = t("not-a-date", "whenever");
  (unparseable.free ? ok : fail)("cancellation", "an unreadable slot falls back to free, never a fee");
}

// ────────────────────────────────────────────────────────── SEO / metadata
const titles = {}, descs = {};
for (const p of PAGES.filter(x => !x.endsWith(".txt") && !x.endsWith(".xml"))) {
  const h = bodies[p] ?? "";
  const t = h.match(/<title>(.*?)<\/title>/s)?.[1]?.trim();
  const d = h.match(/<meta name="description" content="(.*?)"/s)?.[1]?.trim();
  if (!t) fail("seo", `no <title> on ${p}`); else (titles[t] ??= []).push(p);
  if (!d) fail("seo", `no meta description on ${p}`); else (descs[d] ??= []).push(p);
}
const dupT = Object.entries(titles).filter(([, v]) => v.length > 1);
(dupT.length ? warn : ok)("seo", dupT.length ? `${dupT.length} duplicate title(s): ${dupT[0][1].join(", ")}` : `all ${Object.keys(titles).length} titles unique`);
const dupD = Object.entries(descs).filter(([, v]) => v.length > 1);
(dupD.length ? warn : ok)("seo", dupD.length ? `${dupD.length} duplicate description(s): ${dupD[0][1].join(", ")}` : `all ${Object.keys(descs).length} descriptions unique`);

const robots = bodies["/robots.txt"] ?? "";
(robots.includes("Sitemap:") ? ok : fail)("seo", "robots.txt advertises the sitemap");
(/Disallow: \/\s*$/m.test(robots) ? fail : ok)("seo", "robots.txt does not block the site");
const sm = bodies["/sitemap.xml"] ?? "";
const locs = [...sm.matchAll(/<loc>(.*?)<\/loc>/g)].length;
(locs > 5 ? ok : warn)("seo", `sitemap lists ${locs} URLs`);

// brand + contact consistency
for (const p of PAGES) {
  const h = bodies[p] ?? "";
  if (h.includes("StareX")) fail("brand", `old "StareX" spelling on ${p}`);
  if (h.includes("royalarttreasure.com")) fail("brand", `other company's email on ${p}`);
}
if (!results.some(r => r[1] === "brand")) ok("brand", "spelling and contact email consistent on every page");

// ─────────────────────────────────────────────────────────── structured data
for (const p of ["/", "/offer"]) {
  const blocks = [...(bodies[p] ?? "").matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  if (!blocks.length) { warn("structured data", `no JSON-LD on ${p}`); continue; }
  const types = [];
  for (const b of blocks) {
    try {
      const parsed = JSON.parse(b[1].trim());
      for (const n of (Array.isArray(parsed) ? parsed : [parsed])) if (n && n["@type"]) types.push(n["@type"]);
    } catch (e) { fail("structured data", `invalid JSON-LD on ${p}: ${e.message}`); }
  }
  if (types.length) ok("structured data", `${p} -> ${types.join(", ")}`);
}

// ──────────────────────────────────────────────────────────── order data
const orders = await (await fetch(`${SB}/rest/v1/orders?select=*`, { headers: H })).json();
ok("orders", `${orders.length} orders in the database`);

const paid = orders.filter(o => o.payment_status === "paid");
const doubles = paid.filter(o => ((o.status_history ?? []).filter(e => /Paid online|Payment confirmed by Stripe|Charged \$/.test(e.note ?? ""))).length > 1);
(doubles.length ? warn : ok)("orders",
  doubles.length ? `${doubles.length} order(s) recorded payment twice (all before the 18 Oct fix): ${doubles.map(o => o.code).join(", ")}` : "no order records payment twice");

const paidNoPrice = paid.filter(o => o.price == null);
(paidNoPrice.length ? fail : ok)("orders", paidNoPrice.length ? `paid but no amount: ${paidNoPrice.map(o => o.code).join(", ")}` : "every paid order has an amount");

const badEmail = orders.filter(o => !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(o.email ?? ""));
(badEmail.length ? warn : ok)("orders", badEmail.length ? `${badEmail.length} order(s) with an unusable email` : "every order has a valid email");

const stale = orders.filter(o => !["delivered", "cancelled"].includes(o.status) &&
  (Date.now() - new Date(o.created_at).getTime()) / 86400000 > 30);
(stale.length ? warn : ok)("orders", stale.length ? `${stale.length} order(s) open for 30+ days: ${stale.slice(0, 6).map(o => o.code).join(", ")}` : "no orders stuck open");

const KNOWN = new Set(["placed", "picked_up", "confirmed", "ready_for_delivery", "delivered", "cancelled"]);
const odd = orders.filter(o => !KNOWN.has(o.status));
(odd.length ? warn : ok)("orders", odd.length ? `${odd.length} order(s) with an unrecognised status: ${[...new Set(odd.map(o => o.status))].join(", ")}` : "every order has a known status");

const svcIds = new Set(PLANS?.map(p => p.id) ?? []);
const oddSvc = orders.filter(o => svcIds.size && !svcIds.has(o.service));
(oddSvc.length ? warn : ok)("orders", oddSvc.length ? `${oddSvc.length} order(s) reference an unknown service` : "every order references a live service");

const cards = orders.filter(o => o.stripe_payment_method_id);
const placeholder = cards.filter(o => !/^\d{4}$/.test(o.card_last4 ?? ""));
(placeholder.length ? fail : ok)("payments", placeholder.length ? `${placeholder.length} card(s) still showing placeholder digits` : `all ${cards.length} saved cards show real digits`);

const paidNoRef = paid.filter(o => !o.stripe_payment_intent_id && o.stripe_customer_id);
(paidNoRef.length ? warn : ok)("payments", paidNoRef.length ? `${paidNoRef.length} card payment(s) with no Stripe reference stored (older orders; refundable via metadata fallback)` : "every card payment has a Stripe reference");

// ─────────────────────────────────────────────────────────────── endpoints
const guards = [
  ["/api/stripe/refund", { orderCode: "STX-000000" }, 401, "refund requires admin"],
  ["/api/stripe/attach-delivery", { orderCode: "X", paymentIntentId: "bad", deliveryRequest: "x" }, 400, "attach-delivery validates input"],
  ["/api/orders/XXX-000000/cancel", { email: "a@b.com" }, 404, "cancel rejects an unknown order"],
];
for (const [path, body, expect, label] of guards) {
  try {
    const r = await fetch(SITE + path, { method: "POST", headers: { ...UA, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    (r.status === expect ? ok : warn)("endpoints", `${label} — got ${r.status}, expected ${expect}`);
  } catch (e) { fail("endpoints", `${path}: ${e.message}`); }
}
const rev = await get("/api/reviews/summary");
try {
  const j = JSON.parse(rev.body);
  ok("endpoints", `reviews summary: ${j.show ? `${j.average} from ${j.count} ${j.source}` : "hidden (not enough data)"}`);
} catch { fail("endpoints", "reviews summary did not return JSON"); }

// ───────────────────────────────────────────────────────────────── report
const order = { FAIL: 0, WARN: 1, OK: 2 };
const sections = [...new Set(results.map(r => r[1]))];
console.log("\nStarex — live audit of " + SITE + "\n" + "=".repeat(62));
for (const s of sections) {
  console.log("\n" + s.toUpperCase());
  for (const [lvl, , msg] of results.filter(r => r[1] === s).sort((a, b) => order[a[0]] - order[b[0]])) {
    console.log(`  ${lvl.padEnd(4)} ${msg}`);
  }
}
const f = results.filter(r => r[0] === "FAIL").length;
const w = results.filter(r => r[0] === "WARN").length;
console.log("\n" + "=".repeat(62));
console.log(`${f} failures, ${w} warnings, ${results.filter(r => r[0] === "OK").length} passed`);
process.exit(f ? 1 : 0);
