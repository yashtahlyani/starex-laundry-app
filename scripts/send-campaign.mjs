// Sends one marketing email to past customers.
//
// The owner approved this with the condition he raised himself: "we can put
// choose to unsubscribe button to avoid any litigations. Here the laws are
// very strict about any marketing/unwanted calls/message/emails." He is
// right, and this script is built so a non-compliant send is not possible
// rather than merely discouraged.
//
// Canada's anti-spam law (CASL) needs four things in a commercial email, and
// each is checked before anything is sent:
//
//   1. Consent. Only people who have actually ordered are emailed, which is
//      implied consent from an existing business relationship. Nobody is
//      emailed because they once filled in a contact form.
//   2. Who it is from. The business name, as it trades and legally.
//   3. A mailing address. There is no way around this one, and the site does
//      not publish one ("available on request"), so CAMPAIGN_MAILING_ADDRESS
//      must be supplied or the script refuses to run.
//   4. A working unsubscribe. Every message carries a signed one-click link
//      plus List-Unsubscribe headers, and the suppression list is read
//      before the first send - if it cannot be read, nothing goes out.
//
//   node scripts/send-campaign.mjs            # who would be emailed, and the email
//   node scripts/send-campaign.mjs --apply    # actually send
//   node scripts/send-campaign.mjs --only me@example.com --apply   # one test send
//
// Sends one at a time with a pause. A sudden burst from a domain that has
// only ever sent receipts is what gets a sender put in spam folders, which
// would cost far more than this campaign is worth.

import { readFileSync } from "fs";
import { createHmac, createHash } from "crypto";

for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const APPLY = process.argv.includes("--apply");
const ONLY = (() => {
  const i = process.argv.indexOf("--only");
  return i >= 0 ? (process.argv[i + 1] ?? "").toLowerCase() : null;
})();

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL;
// NOT read from NEXT_PUBLIC_SITE_URL. That is http://localhost:3000 in the
// local env file, and a dry run on 2026-11-23 showed it would have sent 49
// customers a booking link and an unsubscribe link pointing at a machine in
// another country. A dead unsubscribe link is the exact CASL failure this
// script exists to prevent, so the live origin is written here and checked
// below rather than inherited from whatever shell the script runs in.
const SITE = process.env.CAMPAIGN_SITE_URL || "https://starexlaundrydryclean.ca";

// Replies go to the address the owner reads, which he confirmed on
// 2026-11-23. Deliberately not ADMIN_NOTIFICATION_EMAIL: that is
// info@royalarttreasure.com, the address the site sends FROM, not one he
// watches for customer replies.
const REPLY_TO = process.env.CAMPAIGN_REPLY_TO || "sushil.starex@gmail.com";

// CASL requires a physical mailing address in the message itself. Set it in
// .env.local as CAMPAIGN_MAILING_ADDRESS once the owner confirms it.
const MAILING_ADDRESS = process.env.CAMPAIGN_MAILING_ADDRESS;

const BUSINESS = "Starex";
const LEGAL = "Royal Art Treasure Inc.";
const PHONE = "437-607-7251";

const fail = (msg) => { console.error(`\nREFUSING TO SEND: ${msg}\n`); process.exit(1); };

if (!SB_URL || !SB_KEY) fail("Supabase credentials are missing.");
if (APPLY && !RESEND) fail("RESEND_API_KEY is not set.");

// Every link in the email is built from SITE. If it is not the live site,
// the unsubscribe link does not work, and an unsubscribe link that does not
// work is worse than no campaign at all.
if (!/^https:\/\/[^/]+\.[a-z]{2,}/i.test(SITE) || /localhost|127\.0\.0\.1/i.test(SITE)) {
  fail(`Links would point at "${SITE}", which is not the live site. Nothing sent.`);
}
if (APPLY && !MAILING_ADDRESS) {
  fail(
    "CAMPAIGN_MAILING_ADDRESS is not set.\n"
    + "  Canadian anti-spam law requires a physical mailing address inside every\n"
    + "  marketing email. The website does not publish one, so it has to be given\n"
    + "  here. Ask the owner for the business address and set it in .env.local:\n\n"
    + '    CAMPAIGN_MAILING_ADDRESS="123 Example Rd, Brampton, ON L6Y 0A1"\n'
  );
}

const sb = (path) =>
  fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  }).then(r => r.json());

// ── Who may be emailed ──────────────────────────────────────────────────────
// Only people who have placed an order: implied consent from an existing
// business relationship. CASL gives that two years from the transaction, so
// anyone older than that is left out rather than argued about.
const TWO_YEARS_AGO = new Date(Date.now() - 730 * 864e5).toISOString();

const orders = await sb(
  `orders?select=email,customer_name,created_at&created_at=gte.${TWO_YEARS_AGO}`
  + `&order=created_at.desc&limit=5000`
);
if (!Array.isArray(orders)) fail(`Could not read orders: ${JSON.stringify(orders).slice(0, 200)}`);

const optOutRows = await sb("email_optouts?select=email");
if (!Array.isArray(optOutRows)) {
  fail(
    `Could not read the unsubscribe list: ${JSON.stringify(optOutRows).slice(0, 160)}\n`
    + "  Run supabase/2026-11-23-email-optouts.sql first. Sending without it would\n"
    + "  mean emailing people who have already asked us not to."
  );
}
const optOuts = new Set(optOutRows.map(r => (r.email ?? "").trim().toLowerCase()));

/**
 * What to call someone in the greeting.
 *
 * Taking the first word of the stored name is wrong for anyone who typed a
 * title into the name box. A dry run on 2026-11-25 found two: "Ms. Jagdeep
 * kaur" and "Ms Arora" would have been greeted "Hi Ms.," and "Hi Ms,". That
 * is the first line of the email, and it reads like a mail merge that went
 * wrong - which is exactly what it would have been.
 *
 * Titles are skipped, and anything left that is not a usable name falls back
 * to "there". "Hi there" is plain; "Hi Ms.," is embarrassing.
 */
const TITLES = new Set(["mr", "mrs", "ms", "miss", "dr", "prof", "sir", "madam"]);
function greetingName(raw) {
  const parts = (raw ?? "").trim().split(/\s+/).filter(Boolean);
  for (const part of parts) {
    const word = part.replace(/[.,]/g, "");
    if (!word || TITLES.has(word.toLowerCase())) continue;
    if (word.length < 2 || /[0-9@]/.test(word)) continue;
    return word;
  }
  return "there";
}

// One message per person, addressed by the name they last gave us.
const people = new Map();
for (const o of orders) {
  const email = (o.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) continue;
  if (email.endsWith("starex-internal.test")) continue;   // our own test identities
  if (optOuts.has(email)) continue;
  if (!people.has(email)) people.set(email, { email, name: greetingName(o.customer_name) });
}

let recipients = [...people.values()];
if (ONLY) recipients = recipients.filter(r => r.email === ONLY);

// ── The message ─────────────────────────────────────────────────────────────
// Short, honest, one thing to do. The delivery warning is included because
// these are the customers most likely to book, and finding out about a
// week-long wait afterwards is how a regular becomes a former regular.
const token = (email) => {
  // Must match lib/emailOptOut.ts exactly, or every unsubscribe link we send
  // is dead on arrival. scripts/check-unsubscribe.mjs proves the two agree.
  const key = process.env.UNSUBSCRIBE_SECRET
    || createHash("sha256").update(`unsubscribe:${SB_KEY}`).digest("hex");
  const e = email.trim().toLowerCase();
  const mac = createHmac("sha256", key).update(e).digest("base64url").slice(0, 24);
  return `${Buffer.from(e).toString("base64url")}.${mac}`;
};
const unsubUrl = (email) => `${SITE}/api/unsubscribe?t=${encodeURIComponent(token(email))}`;

const SUBJECT = "Black Friday at Starex - 50% off dry cleaning this week";

function html({ name, email }) {
  const unsub = unsubUrl(email);
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f6f7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f7;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
  <tr><td style="background:#161616;padding:22px 26px;">
    <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">${BUSINESS}</div>
    <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:2px;">Laundry &amp; Dry Cleaning &middot; Brampton &amp; Mississauga</div>
  </td></tr>
  <tr><td style="padding:28px 26px 8px;">
    <p style="margin:0 0 14px;font-size:15px;color:#161616;">Hi ${name},</p>
    <p style="margin:0 0 14px;font-size:15px;color:#4A4A4A;line-height:1.65;">
      It's Black Friday week, and we're taking <strong style="color:#161616;">50% off dry cleaning</strong>
      until Sunday 29 November. Coats, suits, sarees, dresses - half price.
      Leather, suede, wedding dresses and the 5 for $50 combo aren't included.
    </p>
    <p style="margin:0 0 18px;font-size:15px;color:#4A4A4A;line-height:1.65;">
      One thing worth knowing before you book: we're busy, so
      <strong style="color:#161616;">Black Friday orders are taking about a week</strong> to come back.
      Regular orders are still 24 to 48 hours as usual.
    </p>
    <p style="margin:0 0 22px;font-size:15px;color:#4A4A4A;line-height:1.65;">
      Pickup and delivery are free, as always. Just reply to this email, message us on
      WhatsApp, or call <a href="tel:+14376077251" style="color:#B30F14;">${PHONE}</a> to claim it.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#ED1D24;">
      <a href="${SITE}/book" style="display:inline-block;padding:13px 26px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">Book a pickup</a>
    </td></tr></table>
    <p style="margin:22px 0 0;font-size:14px;color:#6B6B6B;line-height:1.6;">Thanks for being a customer.<br>Sushil, ${BUSINESS}</p>
  </td></tr>
  <tr><td style="padding:22px 26px 24px;border-top:1px solid #eeeeee;">
    <p style="margin:0 0 6px;font-size:11px;color:#8C8C8C;line-height:1.6;">
      You're getting this because you've ordered from ${BUSINESS} before.
    </p>
    <p style="margin:0 0 6px;font-size:11px;color:#8C8C8C;line-height:1.6;">
      ${LEGAL}, operating as ${BUSINESS}<br>${MAILING_ADDRESS ?? "[mailing address required]"}<br>
      ${REPLY_TO} &middot; ${PHONE}
    </p>
    <p style="margin:0;font-size:11px;color:#8C8C8C;line-height:1.6;">
      <a href="${unsub}" style="color:#6B6B6B;">Unsubscribe from marketing emails</a> -
      one click, and you'll still get updates about any order you place.
    </p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function text({ name, email }) {
  return [
    `Hi ${name},`,
    ``,
    `It's Black Friday week, and we're taking 50% off dry cleaning until Sunday 29 November.`,
    `Coats, suits, sarees, dresses - half price.`,
    `Leather, suede, wedding dresses and the 5 for $50 combo aren't included.`,
    ``,
    `One thing worth knowing: Black Friday orders are taking about a week to come back.`,
    `Regular orders are still 24 to 48 hours.`,
    ``,
    `Pickup and delivery are free. Reply to this email, message us on WhatsApp, or call ${PHONE}.`,
    ``,
    `Book: ${SITE}/book`,
    ``,
    `Thanks for being a customer.`,
    `Sushil, ${BUSINESS}`,
    ``,
    `---`,
    `You're getting this because you've ordered from ${BUSINESS} before.`,
    `${LEGAL}, operating as ${BUSINESS}`,
    `${MAILING_ADDRESS ?? "[mailing address required]"}`,
    `${REPLY_TO} | ${PHONE}`,
    `Unsubscribe: ${unsubUrl(email)}`,
  ].join("\n");
}

// ── Report, then send ───────────────────────────────────────────────────────
console.log(`past customers in the last 2 years : ${people.size + optOuts.size} seen`);
console.log(`already unsubscribed               : ${optOuts.size}`);
console.log(`will be emailed                    : ${recipients.length}`);
if (ONLY) console.log(`(--only ${ONLY})`);

if (!APPLY) {
  console.log(`\nsubject: ${SUBJECT}\n`);
  console.log(text(recipients[0] ?? { name: "there", email: "example@example.com" }));
  console.log(`\nmailing address set: ${MAILING_ADDRESS ? "yes" : "NO - required before sending"}`);
  console.log(`\nDry run. Nothing sent. Re-run with --apply.`);
  process.exit(0);
}

if (!recipients.length) { console.log("\nNobody to email."); process.exit(0); }

let sent = 0, failed = 0;
for (const r of recipients) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${BUSINESS} <${FROM}>`,
        to: r.email,
        reply_to: REPLY_TO,
        subject: SUBJECT,
        html: html(r),
        text: text(r),
        // Lets a mail client show its own unsubscribe button, which is both
        // kinder to the reader and better for our sending reputation than
        // making them hunt for the link.
        headers: {
          "List-Unsubscribe": `<${unsubUrl(r.email)}>, <mailto:${REPLY_TO}?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.id) { sent++; console.log(`  sent  ${r.email}`); }
    else { failed++; console.error(`  FAIL  ${r.email}: ${JSON.stringify(d).slice(0, 140)}`); }
  } catch (e) {
    failed++;
    console.error(`  FAIL  ${r.email}: ${e instanceof Error ? e.message : e}`);
  }
  // Paced on purpose - see the note at the top of this file.
  await new Promise(res => setTimeout(res, 700));
}

console.log(`\nsent ${sent}, failed ${failed}`);
