// Registers a real WhatsApp sender to replace the Meta test number.
//
// The site has been sending from +1 555 479 4905, a Meta test sender that can
// only deliver to about five phones listed in advance. Everyone else was
// rejected, which is why customers stopped hearing from us.
//
// This registers +1 579 995 6995 — a Twilio number the business already owns,
// labelled STAREX — as a proper WhatsApp sender. It is deliberately NOT the
// owner's 437-607-7251: registering that number would delete its WhatsApp
// account, lose the chat history and take WhatsApp off his phone for the
// number he uses with customers every day.
//
// Because the number is Twilio's, Meta's verification SMS arrives in the
// Twilio message log, so the whole registration can complete here.
//
//   node scripts/register-whatsapp-sender.mjs           # show what it will do
//   node scripts/register-whatsapp-sender.mjs --apply   # register + verify
//   node scripts/register-whatsapp-sender.mjs --status  # where it stands
//
// Reversible: the sender can be deleted, and nothing switches over until
// TWILIO_WHATSAPP_NUMBER is repointed.

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

const TARGET = process.env.NEW_WHATSAPP_NUMBER || "+15799956995";
const DISPLAY_NAME = "Starex";
const SITE = "https://starexlaundrydryclean.ca";

const ACCOUNT = process.env.TWILIO_ACCOUNT_SID;
const auth = "Basic " + Buffer.from(
  `${process.env.TWILIO_API_KEY_SID || ACCOUNT}:${process.env.TWILIO_API_KEY_SECRET || process.env.TWILIO_AUTH_TOKEN}`
).toString("base64");

if (!ACCOUNT) { console.error("TWILIO_ACCOUNT_SID missing."); process.exit(1); }

const msg = (p, init = {}) =>
  fetch(`https://messaging.twilio.com/v2${p}`, {
    ...init, headers: { Authorization: auth, "Content-Type": "application/json", ...init.headers },
  }).then(async r => ({ status: r.status, body: await r.json().catch(() => null) }));

const rest = (p) =>
  fetch(`https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT}${p}`, { headers: { Authorization: auth } })
    .then(r => r.json());

const sleep = ms => new Promise(r => setTimeout(r, ms));
const show = s =>
  `${s.sender_id}  status=${s.status}  name=${JSON.stringify(s.profile?.name ?? "")}  ` +
  `quality=${s.properties?.quality_rating}  limit=${s.properties?.messaging_limit}` +
  (s.offline_reasons?.length ? `\n      offline: ${JSON.stringify(s.offline_reasons)}` : "");

// ── Current state ───────────────────────────────────────────────────────────
const existing = await msg("/Channels/Senders?Channel=whatsapp");
const senders = existing.body?.senders ?? [];
const WABA = senders.find(s => s.configuration?.waba_id)?.configuration.waba_id;

console.log("WhatsApp senders on this account:");
for (const s of senders) console.log(`  ${show(s)}`);
console.log(`\nWABA: ${WABA}`);
console.log(`Site currently sends from: ${process.env.TWILIO_WHATSAPP_NUMBER}`);
console.log(`Target sender:             whatsapp:${TARGET}\n`);

const already = senders.find(s => s.sender_id === `whatsapp:${TARGET}`);

if (STATUS) {
  if (!already) console.log("Not registered yet. Run with --apply.");
  else {
    console.log(`Registered: ${show(already)}`);
    if (already.status === "ONLINE")
      console.log(`\nReady. Set TWILIO_WHATSAPP_NUMBER=whatsapp:${TARGET} in Vercel, then redeploy.`);
  }
  process.exitCode = 0;
}

if (!STATUS) {
  if (already) {
    console.log(`Already registered: ${show(already)}`);
  } else if (!APPLY) {
    console.log("Would create a WhatsApp sender:");
    console.log(`  sender_id    whatsapp:${TARGET}`);
    console.log(`  display name ${DISPLAY_NAME}   (needs Meta approval)`);
    console.log(`  waba_id      ${WABA}`);
    console.log(`  inbound      ${SITE}/api/twilio/inbound`);
    console.log(`  status       ${SITE}/api/twilio/status`);
    console.log(`  verify by    SMS, read back from this Twilio account's own message log`);
    console.log("\nDry run. Re-run with --apply.");
  } else {
    // ── Create ──────────────────────────────────────────────────────────────
    const before = Date.now();
    const created = await msg("/Channels/Senders", {
      method: "POST",
      body: JSON.stringify({
        sender_id: `whatsapp:${TARGET}`,
        configuration: { waba_id: WABA, verification_method: "sms" },
        profile: {
          name: DISPLAY_NAME,
          about: "Laundry & dry cleaning with free pickup and delivery.",
          websites: [{ website: SITE, label: "Website" }],
          vertical: "Other",
        },
        webhook: {
          callback_url: `${SITE}/api/twilio/inbound`, callback_method: "POST",
          status_callback_url: `${SITE}/api/twilio/status`, status_callback_method: "POST",
        },
      }),
    });

    if (!created.body?.sid) {
      console.error(`Create failed (HTTP ${created.status}): ${JSON.stringify(created.body)}`);
      process.exit(1);
    }
    const SID = created.body.sid;
    console.log(`Created ${SID} — status ${created.body.status}`);

    // ── Read the verification code out of our own inbox ─────────────────────
    console.log("Waiting for Meta's verification SMS...");
    let code = null;
    for (let i = 0; i < 20 && !code; i++) {
      await sleep(6000);
      const inbox = await rest(`/Messages.json?To=${encodeURIComponent(TARGET)}&PageSize=20`);
      for (const m of inbox.messages ?? []) {
        if (new Date(m.date_created).getTime() < before - 120000) continue;
        const hit = (m.body ?? "").match(/\b(\d{3}-?\d{3})\b|\b(\d{6})\b/);
        if (hit) { code = (hit[1] || hit[2]).replace("-", ""); console.log(`  code received: ${code}`); break; }
      }
      if (!code) process.stdout.write(`  .${i === 19 ? "\n" : ""}`);
    }

    if (!code) {
      console.error(`\nNo verification SMS arrived at ${TARGET}.`);
      console.error(`The sender exists (${SID}) but is unverified. Check the Twilio console,`);
      console.error(`or re-request a code there. Nothing on the live site has changed.`);
      process.exit(1);
    }

    // ── Submit it ───────────────────────────────────────────────────────────
    const verified = await msg(`/Channels/Senders/${SID}`, {
      method: "POST",
      body: JSON.stringify({ configuration: { verification_code: code } }),
    });
    console.log(`Verification submitted — status ${verified.body?.status ?? verified.status}`);

    // ── Settle ──────────────────────────────────────────────────────────────
    for (let i = 0; i < 20; i++) {
      await sleep(6000);
      const s = (await msg(`/Channels/Senders/${SID}`)).body;
      if (!s) continue;
      if (["ONLINE", "OFFLINE", "VERIFICATION_FAILED", "CREATION_FAILED"].includes(s.status)) {
        console.log(`\nFinal: ${show(s)}`);
        if (s.status === "ONLINE") {
          console.log(`\nRegistered and online. To switch the site over:`);
          console.log(`  TWILIO_WHATSAPP_NUMBER=whatsapp:${TARGET}`);
          console.log(`(set in Vercel, then redeploy — nothing changes until then)`);
        }
        break;
      }
      process.stdout.write(`  ${s.status}...`);
    }
  }
}
