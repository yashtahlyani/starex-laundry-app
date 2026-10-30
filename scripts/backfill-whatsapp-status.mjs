// Corrects notification_log against what Twilio actually did.
//
// Every WhatsApp row was logged "sent" the moment Twilio accepted it, so the
// log claims 165 of 165 delivered while Twilio's own records show most were
// rejected by Meta. New sends now get the truth from the status callback
// (app/api/twilio/status/route.ts); this fixes the history.
//
// Read-mostly: it only writes rows whose recorded status disagrees with
// Twilio, and only ever to notification_log.
//
//   node scripts/backfill-whatsapp-status.mjs          # report only
//   node scripts/backfill-whatsapp-status.mjs --apply  # write corrections

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

const {
  TWILIO_ACCOUNT_SID: ACCOUNT,
  TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_AUTH_TOKEN,
  NEXT_PUBLIC_SUPABASE_URL: SB_URL, SUPABASE_SERVICE_ROLE_KEY: SB_KEY,
} = process.env;

const twAuth = "Basic " + Buffer.from(
  `${TWILIO_API_KEY_SID || ACCOUNT}:${TWILIO_API_KEY_SECRET || TWILIO_AUTH_TOKEN}`
).toString("base64");

if (!ACCOUNT || !SB_URL || !SB_KEY) {
  console.error("Missing Twilio or Supabase credentials in the environment.");
  process.exit(1);
}

const sb = (path, init = {}) =>
  fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json", Prefer: "return=minimal",
      ...init.headers,
    },
  });

// ── What our log believes ───────────────────────────────────────────────────
const logged = await sb(
  "notification_log?channel=eq.whatsapp&provider_message_id=not.is.null" +
  "&select=id,status,event_type,provider_message_id,created_at"
).then(r => r.json());

console.log(`notification_log: ${logged.length} WhatsApp rows with a Twilio SID`);

// ── What Twilio knows ───────────────────────────────────────────────────────
// Paging the message list is far cheaper than one request per SID.
const twilio = new Map();
let url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT}/Messages.json?PageSize=1000`;
while (url) {
  const page = await fetch(url, { headers: { Authorization: twAuth } }).then(r => r.json());
  if (page.code) { console.error(`Twilio error ${page.code}: ${page.message}`); process.exit(1); }
  for (const m of page.messages ?? []) {
    twilio.set(m.sid, { status: m.status, errorCode: m.error_code });
  }
  url = page.next_page_uri ? `https://api.twilio.com${page.next_page_uri}` : null;
}
console.log(`Twilio: ${twilio.size} messages on the account\n`);

// ── Compare ─────────────────────────────────────────────────────────────────
const SUCCESS = new Set(["sent", "delivered", "read"]);
const corrections = [];
const tally = {};
let missing = 0;

for (const row of logged) {
  const real = twilio.get(row.provider_message_id);
  // Twilio only retains messages for a limited period; an older SID it no
  // longer lists tells us nothing, so leave that row alone.
  if (!real) { missing++; continue; }

  const truth = real.errorCode ? `${real.status} (${real.errorCode})` : real.status;
  tally[truth] = (tally[truth] ?? 0) + 1;
  if (row.status !== truth) corrections.push({ id: row.id, from: row.status, to: truth });
}

console.log("What Twilio actually did with these messages:");
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  const bad = !SUCCESS.has(k.replace(/\s*\(.*\)$/, ""));
  console.log(`  ${bad ? "✗" : "✓"} ${k.padEnd(24)} ${v}`);
}
if (missing) console.log(`  (${missing} rows older than Twilio's retention — left unchanged)`);

console.log(`\n${corrections.length} rows are recorded wrong.`);
if (!corrections.length) process.exit(0);

if (!APPLY) {
  for (const c of corrections.slice(0, 10)) console.log(`  ${c.id}: "${c.from}" -> "${c.to}"`);
  if (corrections.length > 10) console.log(`  ... and ${corrections.length - 10} more`);
  console.log("\nDry run. Re-run with --apply to write these.");
  process.exit(0);
}

let done = 0;
for (const c of corrections) {
  const res = await sb(`notification_log?id=eq.${c.id}`, {
    method: "PATCH", body: JSON.stringify({ status: c.to }),
  });
  if (res.ok) done++;
  else console.error(`  failed to update ${c.id}: ${res.status} ${await res.text()}`);
}
console.log(`Corrected ${done} of ${corrections.length} rows.`);
