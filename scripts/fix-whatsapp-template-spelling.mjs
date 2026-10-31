// Three approved WhatsApp templates still say "StareX". The spelling was
// corrected site-wide on 14 Oct at the owner's request, but these bodies live
// in Meta-approved Twilio Content Templates, not in this repo — which is why
// customers kept seeing the old name after the site stopped using it.
//
// An approved WhatsApp template cannot be edited. The only route is a new
// template submitted for approval, so this creates corrected copies. The
// originals are left alone and keep working until the replacements clear
// review; nothing switches over until TWILIO_TEMPLATE_* is repointed, which
// this script deliberately does not do.
//
//   node scripts/fix-whatsapp-template-spelling.mjs          # show the diff
//   node scripts/fix-whatsapp-template-spelling.mjs --apply  # create + submit
//   node scripts/fix-whatsapp-template-spelling.mjs --status # has Meta approved them?
//
// Re-running is safe: a corrected copy that already exists is skipped.

import { readFileSync } from "fs";

for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const APPLY = process.argv.includes("--apply");
const STATUS = process.argv.includes("--status");
const ACCOUNT = process.env.TWILIO_ACCOUNT_SID;
const auth = "Basic " + Buffer.from(
  `${process.env.TWILIO_API_KEY_SID || ACCOUNT}:${process.env.TWILIO_API_KEY_SECRET || process.env.TWILIO_AUTH_TOKEN}`
).toString("base64");

if (!ACCOUNT) { console.error("TWILIO_ACCOUNT_SID missing."); process.exit(1); }

const api = (path, init = {}) =>
  fetch(`https://content.twilio.com/v1${path}`, {
    ...init,
    headers: { Authorization: auth, "Content-Type": "application/json", ...init.headers },
  });

const WRONG = /StareX/g;
const RIGHT = "Starex";

// ── --status: where the corrected copies stand with Meta ────────────────────
if (STATUS) {
  const page = await api("/Content?PageSize=100").then(r => r.json());
  const copies = (page.contents ?? []).filter(c => /_v2$/.test(c.friendly_name));
  if (!copies.length) { console.log("No corrected copies exist yet. Run with --apply first."); }
  let allApproved = copies.length > 0;
  for (const c of copies) {
    const a = await api(`/Content/${c.sid}/ApprovalRequests`).then(r => r.json());
    const w = a.whatsapp ?? {};
    if (w.status !== "approved") allApproved = false;
    console.log(`${c.friendly_name.padEnd(30)} ${String(w.status).padEnd(10)} ${w.rejection_reason || ""}`);
  }
  if (allApproved) {
    console.log("\nAll approved — safe to repoint these in Vercel now:");
    for (const c of copies) {
      const base = c.friendly_name.replace(/_v2$/, "").replace(/^starex_/, "").toUpperCase();
      console.log(`  TWILIO_TEMPLATE_${base}=${c.sid}`);
    }
  }
  process.exitCode = 0;
}

// ── Find every template whose body still carries the old spelling ───────────
const list = STATUS ? { contents: [] } : await api("/Content?PageSize=100").then(r => r.json());
if (list.status >= 400) { console.error("Twilio:", JSON.stringify(list)); process.exit(1); }

const all = list.contents ?? [];
const existingNames = new Set(all.map(c => c.friendly_name));
const needFixing = all.filter(c => WRONG.test(JSON.stringify(c.types ?? {})));

// Only templates the site actually sends are worth replacing.
const inUse = new Map(
  Object.entries(process.env)
    .filter(([k]) => k.startsWith("TWILIO_TEMPLATE_"))
    .map(([k, v]) => [v, k])
);

if (!STATUS) console.log(`${all.length} templates on the account, ${needFixing.length} still say "StareX".\n`);

const planned = [];
for (const c of needFixing) {
  const envVar = inUse.get(c.sid);
  if (!envVar) {
    console.log(`SKIP  ${c.friendly_name} — not used by the site.`);
    continue;
  }

  const newName = `${c.friendly_name}_v2`;
  if (existingNames.has(newName)) {
    const already = all.find(x => x.friendly_name === newName);
    console.log(`SKIP  ${newName} already exists (${already.sid}).`);
    continue;
  }

  // Rewrite every string in the type definition, so a body, header or button
  // label all get corrected without assuming the template's shape.
  const types = JSON.parse(JSON.stringify(c.types).replace(WRONG, RIGHT));

  planned.push({ from: c, newName, types, envVar });

  console.log(`FIX   ${c.friendly_name}  (${envVar})`);
  for (const [t, def] of Object.entries(c.types ?? {})) {
    const before = def.body ?? JSON.stringify(def);
    const after = (types[t].body ?? JSON.stringify(types[t]));
    if (before !== after) {
      console.log(`      - ${before.replace(/\n/g, "\\n").slice(0, 150)}`);
      console.log(`      + ${after.replace(/\n/g, "\\n").slice(0, 150)}`);
    }
  }
  console.log();
}

// ── Create the corrected copies and send them to Meta for review ────────────
const results = [];
for (const p of (!planned.length || !APPLY ? [] : planned)) {
  const created = await api("/Content", {
    method: "POST",
    body: JSON.stringify({
      friendly_name: p.newName,
      language: p.from.language || "en",
      variables: p.from.variables ?? {},
      types: p.types,
    }),
  }).then(r => r.json());

  if (!created.sid) {
    console.error(`FAILED to create ${p.newName}: ${JSON.stringify(created)}`);
    continue;
  }

  // Category must match the original or Meta reviews it as a new use case.
  const approval = await api(`/Content/${created.sid}/ApprovalRequests/whatsapp`, {
    method: "POST",
    body: JSON.stringify({
      name: p.newName,
      category: "UTILITY",
      allow_category_change: true,
    }),
  }).then(r => r.json());

  const state = approval?.status ?? approval?.whatsapp?.status ?? JSON.stringify(approval);
  console.log(`CREATED ${p.newName}  ${created.sid}  -> approval: ${state}`);
  results.push({ envVar: p.envVar, sid: created.sid, name: p.newName, was: p.from.sid });
}

if (STATUS) { /* already reported above */ }
else if (!planned.length) console.log("Nothing to do.");
else if (!APPLY) console.log(`Dry run — nothing created. Re-run with --apply to submit ${planned.length} for approval.`);

if (results.length) {
  console.log(`\nOnce Meta approves these, repoint the environment (Vercel + .env.local):\n`);
  for (const r of results) console.log(`  ${r.envVar}=${r.sid}   # ${r.name}, replaces ${r.was}`);
  console.log(`\nUntil then the old templates stay live, so nothing breaks in the meantime.`);
}
