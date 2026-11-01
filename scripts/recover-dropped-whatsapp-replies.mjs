// Recovers customer WhatsApp replies that were never delivered to anyone.
//
// The sender had no inbound webhook and the app had no handler, so every
// message a customer sent back stopped at Twilio. Among them: "i need to pick
// up by Sunday please confirm", "can you drop off tonight", and a stain
// complaint with a photo. None of it was ever seen.
//
// /api/twilio/inbound now catches these as they arrive. This pulls the
// historical ones out of Twilio and files them in contact_submissions, the
// table behind the admin's Messages tab.
//
//   node scripts/recover-dropped-whatsapp-replies.mjs          # list them
//   node scripts/recover-dropped-whatsapp-replies.mjs --apply  # file them
//
// Re-running is safe: a message already filed (matched on its Twilio SID) is
// skipped. Filed messages are marked "new" so they show as unread — these are
// genuinely unanswered, some of them for weeks.

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
const ACCOUNT = process.env.TWILIO_ACCOUNT_SID;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const twAuth = "Basic " + Buffer.from(
  `${process.env.TWILIO_API_KEY_SID || ACCOUNT}:${process.env.TWILIO_API_KEY_SECRET || process.env.TWILIO_AUTH_TOKEN}`
).toString("base64");

if (!ACCOUNT || !SB_URL || !SB_KEY) {
  console.error("Missing Twilio or Supabase credentials.");
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

// ── Everything the customers sent us ────────────────────────────────────────
let url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT}/Messages.json?PageSize=1000`;
const all = [];
while (url) {
  const page = await fetch(url, { headers: { Authorization: twAuth } }).then(r => r.json());
  if (page.code) { console.error(`Twilio error ${page.code}: ${page.message}`); process.exit(1); }
  all.push(...(page.messages ?? []));
  url = page.next_page_uri ? `https://api.twilio.com${page.next_page_uri}` : null;
}

const inbound = all
  .filter(m => m.direction === "inbound" && (m.from ?? "").startsWith("whatsapp:"))
  .sort((a, b) => new Date(a.date_created) - new Date(b.date_created));

// Messages from the business's own numbers are the owner testing, not a
// customer waiting on an answer.
const OWN = new Set(["+14376077251", "+15554794905", "+14155238886"]);

// ── Who sent them ───────────────────────────────────────────────────────────
const orders = await sb("orders?select=code,customer_name,email,phone,status,created_at&order=created_at.desc&limit=500")
  .then(r => r.json());
const byLast10 = new Map();
for (const o of orders ?? []) {
  const k = (o.phone ?? "").replace(/\D/g, "").slice(-10);
  if (k && !byLast10.has(k)) byLast10.set(k, o);
}

const existing = await sb("contact_submissions?select=message").then(r => r.json());
const alreadyFiled = (existing ?? []).map(r => r.message ?? "").join("\n");

const toFile = [];
console.log(`${inbound.length} inbound WhatsApp messages in Twilio.\n`);

for (const m of inbound) {
  const from = m.from.replace("whatsapp:", "");
  if (OWN.has(from)) { console.log(`SKIP  ${from} — our own number (a test).`); continue; }
  if (alreadyFiled.includes(m.sid)) { console.log(`SKIP  ${m.sid} — already filed.`); continue; }

  const match = byLast10.get(from.replace(/\D/g, "").slice(-10));
  const name = match?.customer_name || from;
  const when = new Date(m.date_created).toISOString().slice(0, 10);

  toFile.push({ m, from, match, name });
  console.log(`FILE  ${when}  ${name.padEnd(18)} ${from.padEnd(14)} ${match ? match.code : "no order"}`);
  console.log(`      "${(m.body ?? "").replace(/\n/g, " ").slice(0, 110)}"`);
}

console.log(`\n${toFile.length} to recover.`);

if (toFile.length && APPLY) {
  const rows = toFile.map(({ m, from, match, name }) => ({
    name,
    email: match?.email ?? "",
    phone: from,
    subject: match
      ? `WhatsApp reply (never seen) — order ${match.code}`
      : "WhatsApp message (never seen)",
    message:
      `${m.body || "(no text)"}` +
      (Number(m.num_media ?? 0) > 0 ? `\n\n[${m.num_media} attachment(s) — view in Twilio]` : "") +
      `\n\n— sent from WhatsApp ${from} on ${new Date(m.date_created).toUTCString()}` +
      (match ? ` · order ${match.code}` : " · no matching order") +
      `\n[recovered — this reply was never delivered to anyone]` +
      `\n[${m.sid}]`,
    status: "new",
    created_at: new Date(m.date_created).toISOString(),
  }));

  const res = await sb("contact_submissions", { method: "POST", body: JSON.stringify(rows) });
  if (res.ok) console.log(`Filed ${rows.length} into the admin Messages tab, marked unread.`);
  else console.error(`Failed: ${res.status} ${await res.text()}`);
} else if (toFile.length) {
  console.log("Dry run. Re-run with --apply to file these.");
}
