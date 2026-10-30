import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * Twilio delivery-status callback.
 *
 * Until now a WhatsApp message was logged "sent" the moment Twilio returned
 * 201 — but 201 only means Twilio ACCEPTED it for queueing. Delivery happens
 * afterwards, and when it fails Twilio never told us, so the console showed
 * 165 of 165 "sent" while Meta was rejecting almost all of them.
 *
 * That is how this went unnoticed from 24 Aug to 30 Oct: the owner had to
 * discover it by customers not replying, and we had a log that said
 * everything was fine.
 *
 * Twilio calls this once per status change. We record the real outcome
 * against the message id we stored when sending.
 */

// Terminal states worth keeping; "queued"/"sending" are noise.
const INTERESTING = new Set(["sent", "delivered", "read", "undelivered", "failed"]);

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);
  const messageSid = params.get("MessageSid") ?? params.get("SmsSid") ?? "";
  const status = (params.get("MessageStatus") ?? params.get("SmsStatus") ?? "").toLowerCase();
  const errorCode = params.get("ErrorCode");

  if (!/^[A-Za-z0-9]{32,34}$/.test(messageSid) || !status) {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  // Signature check when the Auth Token is available. The project currently
  // authenticates with an API key, which cannot sign callbacks — so when the
  // token is absent we fall back to requiring that the MessageSid already
  // exists in our own log. An attacker would have to know a real Twilio SID
  // we issued, and the worst they could do is mislabel one row.
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (token) {
    const signature = req.headers.get("x-twilio-signature") ?? "";
    const url = process.env.TWILIO_STATUS_CALLBACK_URL
      ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/twilio/status`;
    const sorted = [...params.keys()].sort().map(k => k + params.get(k)).join("");
    const expected = crypto.createHmac("sha1", token).update(url + sorted).digest("base64");
    const ok = signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 403 });
  }

  if (!INTERESTING.has(status)) return NextResponse.json({ ok: true, ignored: status });

  try {
    const db = getSupabaseAdmin();
    const { data: rows } = await db
      .from("notification_log")
      .select("id")
      .eq("provider_message_id", messageSid)
      .limit(1);

    // Unknown SID: either not ours, or the send row never got written. Either
    // way there is nothing to update, and we do not create a row from an
    // unauthenticated callback.
    if (!rows?.length) return NextResponse.json({ ok: true, unknown: true });

    await db
      .from("notification_log")
      .update({ status: errorCode ? `${status} (${errorCode})` : status })
      .eq("id", rows[0].id);

    return NextResponse.json({ ok: true, status });
  } catch {
    // Twilio retries on a non-2xx; a logging failure is not worth a retry storm.
    return NextResponse.json({ ok: true });
  }
}
