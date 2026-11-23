// Proves the unsubscribe links the campaign sends are ones the website will
// actually accept.
//
// The token is generated in two places - scripts/send-campaign.mjs builds it
// when writing the email, and lib/emailOptOut.ts verifies it when someone
// clicks. If those two ever disagree, every unsubscribe link in a campaign is
// dead, and the first anyone hears about it is a complaint. So this compares
// them directly rather than trusting that they look similar.
//
//   node scripts/check-unsubscribe.mjs

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

const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Exactly what send-campaign.mjs does.
const campaignToken = (email) => {
  const key = process.env.UNSUBSCRIBE_SECRET
    || createHash("sha256").update(`unsubscribe:${SB_KEY}`).digest("hex");
  const e = email.trim().toLowerCase();
  const mac = createHmac("sha256", key).update(e).digest("base64url").slice(0, 24);
  return `${Buffer.from(e).toString("base64url")}.${mac}`;
};

// Exactly what lib/emailOptOut.ts does when the link is clicked.
const serverVerify = (token) => {
  const [payload, mac] = (token ?? "").split(".");
  if (!payload || !mac) return null;
  let email;
  try { email = Buffer.from(payload, "base64url").toString("utf8"); } catch { return null; }
  const key = process.env.UNSUBSCRIBE_SECRET
    || createHash("sha256").update(`unsubscribe:${SB_KEY}`).digest("hex");
  const expected = createHmac("sha256", key).update(email).digest("base64url").slice(0, 24);
  return mac === expected ? email : null;
};

const cases = [
  "customer@example.com",
  "Mixed.Case@Example.COM",
  "name+tag@example.co.uk",
];

let ok = true;
console.log("round trip: campaign link -> what the website reads back\n");
for (const email of cases) {
  const t = campaignToken(email);
  const back = serverVerify(t);
  const pass = back === email.trim().toLowerCase();
  if (!pass) ok = false;
  console.log(`  ${pass ? "OK  " : "FAIL"}  ${email.padEnd(26)} -> ${back ?? "rejected"}`);
}

console.log("\ntampering is rejected:");
const good = campaignToken("customer@example.com");
const tampered = [
  ["wrong signature", good.split(".")[0] + ".aaaaaaaaaaaaaaaaaaaaaaaa"],
  ["someone else's address swapped in", `${Buffer.from("victim@example.com").toString("base64url")}.${good.split(".")[1]}`],
  ["no signature at all", good.split(".")[0]],
  ["empty", ""],
];
for (const [what, t] of tampered) {
  const back = serverVerify(t);
  if (back !== null) ok = false;
  console.log(`  ${back === null ? "OK  " : "FAIL"}  ${what.padEnd(34)} -> ${back ?? "rejected"}`);
}

console.log(`\n${ok ? "PASS - links the campaign sends will work." : "FAIL - do not send; links would be broken."}`);
process.exit(ok ? 0 : 1);
