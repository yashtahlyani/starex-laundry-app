import { getSupabaseAdmin } from "./supabaseAdmin";
import { PHONE } from "./pricing";

/**
 * The two owner-controlled gates on booking (per client, 2026-11-19):
 * blocked customers, and closed dates or pickup windows ("holiday mode").
 *
 * Both are read on every public booking, so both are written to fail in the
 * direction that costs least. A blocked customer getting through is a bad
 * debt the owner already knows how to chase; a working customer wrongly
 * refused is a booking lost forever and a phone call to explain it. So when
 * the lookup itself breaks, the booking proceeds — and says so in the logs
 * rather than silently.
 *
 * The one thing that must never happen is quiet enforcement of a list we
 * could not actually read.
 */

/** Same normalisation the booking form and admin both use, so "(416) 555-1234",
 *  "416-555-1234" and "+1 416 555 1234" are recognised as one person. */
export function phoneLast10(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
}

export function normaliseEmail(email: string | null | undefined): string | null {
  const e = (email ?? "").trim().toLowerCase();
  return e || null;
}

export type BlockCheck = { blocked: boolean; reason?: string | null; degraded?: boolean };

/**
 * Is this person on the blocklist?
 *
 * Matches either identifier: someone refused by email will otherwise rebook
 * with the same phone and a new address five minutes later.
 */
export async function isCustomerBlocked(
  email: string | null | undefined,
  phone: string | null | undefined
): Promise<BlockCheck> {
  const e = normaliseEmail(email);
  const p = phoneLast10(phone);
  if (!e && !p) return { blocked: false };

  try {
    const db = getSupabaseAdmin();
    const ors: string[] = [];
    if (e) ors.push(`email.ilike.${e}`);
    if (p) ors.push(`phone_last10.eq.${p}`);

    const { data, error } = await db
      .from("blocked_customers")
      .select("reason")
      .or(ors.join(","))
      .limit(1);

    // Table not created yet, or the read failed. Let the booking through
    // rather than refusing a paying customer over our own outage.
    if (error) {
      console.warn("[availability] blocklist unreadable, allowing booking:", error.message);
      return { blocked: false, degraded: true };
    }
    if (data?.length) return { blocked: true, reason: data[0].reason ?? null };
    return { blocked: false };
  } catch (err) {
    console.warn("[availability] blocklist check threw, allowing booking:", err);
    return { blocked: false, degraded: true };
  }
}

export type ClosedWindow = { date: string; timeSlot: string | null; reason?: string | null };

/**
 * Dates and windows closed from today onward. Past closures are not returned:
 * nothing can be booked into the past anyway, and the owner should not have to
 * scroll last Christmas to find next week.
 */
export async function getClosedWindows(): Promise<{ windows: ClosedWindow[]; degraded: boolean }> {
  try {
    const db = getSupabaseAdmin();
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());

    const { data, error } = await db
      .from("blocked_dates")
      .select("date, time_slot, reason")
      .gte("date", today)
      .order("date", { ascending: true });

    if (error) {
      console.warn("[availability] closed dates unreadable:", error.message);
      return { windows: [], degraded: true };
    }
    return {
      windows: (data ?? []).map(r => ({ date: r.date, timeSlot: r.time_slot ?? null, reason: r.reason ?? null })),
      degraded: false,
    };
  } catch (err) {
    console.warn("[availability] closed dates threw:", err);
    return { windows: [], degraded: true };
  }
}

/** Is this specific date+window closed? A whole-day closure (time_slot null)
 *  covers every window on that date. */
export function isWindowClosed(windows: ClosedWindow[], date: string, timeSlot: string): boolean {
  return windows.some(w => w.date === date && (w.timeSlot === null || w.timeSlot === timeSlot));
}

/** Every date on which every bookable window is closed, so the booking form
 *  can grey the date out entirely rather than letting someone pick it and
 *  then find nothing available. */
export function fullyClosedDates(windows: ClosedWindow[], allSlots: string[]): string[] {
  const byDate = new Map<string, Set<string>>();
  for (const w of windows) {
    if (w.timeSlot === null) { byDate.set(w.date, new Set(allSlots)); continue; }
    if (!byDate.has(w.date)) byDate.set(w.date, new Set());
    byDate.get(w.date)!.add(w.timeSlot);
  }
  return [...byDate.entries()]
    .filter(([, slots]) => allSlots.every(s => slots.has(s)))
    .map(([date]) => date);
}

/** What a refused customer is told. Deliberately gives no reason and no hint
 *  that they are on a list — that is a conversation for the owner to have, in
 *  his own words, not a web form's. It points at the phone so a genuine
 *  mistake can be sorted out by a human. */
export const BLOCKED_CUSTOMER_MESSAGE =
  `We can't complete this booking online. Please call us on ${PHONE} and we'll help you directly.`;

export const CLOSED_WINDOW_MESSAGE =
  "We're not accepting pickups in that window. Please choose another date or time.";
