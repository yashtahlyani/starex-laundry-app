import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notifyOwnerOfNewContact } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * Incoming WhatsApp messages from customers.
 *
 * Until now there was no handler and no webhook on the sender, so every reply
 * a customer sent went to Twilio and stopped there. Fourteen of them did,
 * including "i need to pick up by Sunday please confirm", "can you drop off
 * tonight" and a stain complaint with a photo. Nobody ever saw any of it.
 *
 * Rather than build a second inbox, these land in contact_submissions — the
 * table behind the admin's Messages tab, which already shows an unread count.
 * A message the owner has to go looking for is a message that gets missed.
 */

// Twilio sends a WhatsApp number as "whatsapp:+1416...".
const stripChannel = (v: string) => v.replace(/^whatsapp:/, "").trim();

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);

  const from = stripChannel(params.get("From") ?? "");
  const body = (params.get("Body") ?? "").trim();
  const profileName = (params.get("ProfileName") ?? "").trim();
  const messageSid = params.get("MessageSid") ?? "";
  const numMedia = Number(params.get("NumMedia") ?? "0");

  if (!from || !messageSid) {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  // Same approach as the status callback: verify when the Auth Token is
  // available, since the API key this project uses cannot sign callbacks.
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (token) {
    const signature = req.headers.get("x-twilio-signature") ?? "";
    const url = process.env.TWILIO_INBOUND_CALLBACK_URL
      ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/twilio/inbound`;
    const sorted = [...params.keys()].sort().map(k => k + params.get(k)).join("");
    const expected = crypto.createHmac("sha1", token).update(url + sorted).digest("base64");
    const ok = signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 403 });
  }

  try {
    const db = getSupabaseAdmin();

    // Twilio retries a webhook it thinks failed, so the same message can
    // arrive twice. The SID is in the stored text, which makes it checkable
    // without a new column.
    const { data: seen } = await db
      .from("contact_submissions")
      .select("id")
      .ilike("message", `%${messageSid}%`)
      .limit(1);
    if (seen?.length) return new Response("<Response/>", { headers: { "Content-Type": "text/xml" } });

    // Match the sender to a customer so the owner sees a name and an order,
    // not a bare phone number. Phones are stored as the customer typed them,
    // so compare on the last 10 digits.
    const last10 = from.replace(/\D/g, "").slice(-10);
    const { data: orders } = await db
      .from("orders")
      .select("code, customer_name, email, phone, status")
      .order("created_at", { ascending: false })
      .limit(400);
    const match = (orders ?? []).find(o => (o.phone ?? "").replace(/\D/g, "").slice(-10) === last10);

    const name = match?.customer_name || profileName || from;
    const subject = match
      ? `WhatsApp reply — order ${match.code} (${match.status})`
      : "WhatsApp message";
    const message =
      `${body || "(no text)"}` +
      (numMedia > 0 ? `\n\n[${numMedia} attachment${numMedia > 1 ? "s" : ""} — view in Twilio]` : "") +
      `\n\n— sent from WhatsApp ${from}` +
      (match ? ` · order ${match.code}` : " · no matching order") +
      `\n[${messageSid}]`;

    await db.from("contact_submissions").insert({
      name,
      email: match?.email ?? "",
      phone: from,
      subject,
      message,
      status: "new",
    });

    // Email the owner too. A WhatsApp reply is usually time-sensitive —
    // "can you drop off tonight" is worthless if it is read tomorrow.
    await notifyOwnerOfNewContact({ name, email: match?.email ?? from, subject, message });

    // Empty TwiML: received, no auto-reply.
    return new Response("<Response/>", { headers: { "Content-Type": "text/xml" } });
  } catch {
    // Never make Twilio retry over a storage failure.
    return new Response("<Response/>", { headers: { "Content-Type": "text/xml" } });
  }
}
