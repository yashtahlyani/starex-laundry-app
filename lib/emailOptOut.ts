import crypto from "crypto";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { SITE_ORIGIN } from "./site";

/**
 * Unsubscribe handling for marketing email.
 *
 * Canada's anti-spam law requires a working unsubscribe in every commercial
 * message, and requires it to be honoured. The owner asked for it directly:
 * "the laws are very strict about any marketing/unwanted calls/message/
 * emails."
 *
 * Two decisions worth stating.
 *
 * The link carries a signed token rather than a plain email address. A plain
 * address in a URL means anyone can unsubscribe anyone by editing it, and
 * means the address leaks into server logs, browser history and any referrer
 * header the page emits. The token is an HMAC, so it proves we issued it
 * without being guessable.
 *
 * Unsubscribing takes one click and asks nothing. No sign-in, no "are you
 * sure", no survey. A hard unsubscribe is a legal obligation, and an
 * unsubscribe someone has to fight is how a business earns a complaint
 * instead of a quiet exit.
 */

/** Signing key for unsubscribe tokens. A dedicated secret if one is set,
 *  otherwise derived from the service role key, which is always present
 *  server-side and never leaves it. Deriving rather than using it directly
 *  means a token can never be reversed into the key. */
function signingKey(): string {
  const explicit = process.env.UNSUBSCRIBE_SECRET;
  if (explicit) return explicit;
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return crypto.createHash("sha256").update(`unsubscribe:${fallback}`).digest("hex");
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** base64url of the email plus a short HMAC over it. Self-contained, so
 *  unsubscribing needs no database lookup and works even if the campaign
 *  record is long gone. */
export function unsubscribeToken(email: string): string {
  const e = normaliseEmail(email);
  const mac = crypto.createHmac("sha256", signingKey()).update(e).digest("base64url").slice(0, 24);
  return `${Buffer.from(e).toString("base64url")}.${mac}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const [payload, mac] = (token ?? "").split(".");
  if (!payload || !mac) return null;
  let email: string;
  try {
    email = Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = crypto.createHmac("sha256", signingKey()).update(email).digest("base64url").slice(0, 24);
  // Length-checked before the constant-time compare, which throws on a
  // length mismatch.
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return email;
}

export function unsubscribeUrl(email: string): string {
  return `${SITE_ORIGIN}/api/unsubscribe?t=${encodeURIComponent(unsubscribeToken(email))}`;
}

/** Records the opt-out. Idempotent: clicking twice is not an error, and a
 *  second click must not look like a failure to someone trying to leave. */
export async function recordOptOut(email: string, source?: string): Promise<boolean> {
  const e = normaliseEmail(email);
  if (!e) return false;
  try {
    const { error } = await getSupabaseAdmin()
      .from("email_optouts")
      .upsert({ email: e, source: source ?? null }, { onConflict: "email" });
    if (error) {
      console.error("[unsubscribe] could not record opt-out:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[unsubscribe] opt-out threw:", err);
    return false;
  }
}

/**
 * Everyone who has opted out, lowercased.
 *
 * Throws rather than returning an empty set when the lookup fails. A
 * campaign that cannot read the suppression list must not send: treating a
 * failed read as "nobody has unsubscribed" is exactly how a business emails
 * the people who asked it not to.
 */
export async function getOptOuts(): Promise<Set<string>> {
  const { data, error } = await getSupabaseAdmin().from("email_optouts").select("email");
  if (error) {
    throw new Error(
      `Cannot read the unsubscribe list (${error.message}). Refusing to send: `
      + `without it there is no way to tell who has opted out.`
    );
  }
  return new Set((data ?? []).map(r => normaliseEmail(r.email)));
}
