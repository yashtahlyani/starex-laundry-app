// Order cancellation — the notice bands published in the Refund, Cancellation
// & Damage Policy (app/refund-policy/page.tsx, "Cancellations & Rescheduling").
//
// Added 2026-10-18. The policy already told customers "You may cancel or
// reschedule an Order through your account or by contacting us", but there
// was no way to do it on the site — a customer emailed to say so. This closes
// that gap, and the bands here are read straight off the published policy so
// the two can't say different things.
//
// Nothing here charges anything. The policy says a fee "may apply", which is
// the owner's call on the facts — so the UI tells the customer which band
// they're in and the order records it, and any fee is applied by staff.
//
// Fee set by the client on 18 Oct 2026: a flat $10 under 3 hours' notice,
// replacing the old
// percentage bands (25% / 50% / up to the $40 minimum). Both published
// documents were updated in the same change — app/refund-policy and
// app/terms — because a policy quoting percentages while the cancel screen
// quotes $10 is a contradiction in a consumer contract, and under Ontario's
// CPA an ambiguity like that is read against the business.
//
// This is a REDUCTION on every band, so it can take effect immediately;
// raising a fee would need notice to existing bookings.

/** Flat cancellation fee. One constant — the UI, the policy copy and the
 *  recorded note all read it from here. */
export const CANCELLATION_FEE_CAD = 10;

/** Cancel with at least this much notice and there is no fee at all.
 *  Set to 3 by the client on 18 Oct 2026 ("under 3 hours is 10$, before that
 *  no") — so the fee only bites on a genuinely last-minute cancellation,
 *  once the run is effectively committed. */
export const FREE_CANCELLATION_HOURS = 3;

/** Only an order that hasn't been collected yet can be cancelled by the
 *  customer. Once it's "picked_up" the garments are physically with Starex,
 *  which is a return conversation, not a cancellation — those go to staff. */
export const CUSTOMER_CANCELLABLE_STATUSES = ["placed"];

export type NoticeBand = "free" | "late" | "no_show";

export type CancellationTerms = {
  band: NoticeBand;
  hoursNotice: number;
  /** headline the customer sees before confirming */
  headline: string;
  /** the exact wording from the policy for this band */
  detail: string;
  /** true when no fee is contemplated at all */
  free: boolean;
};

// Pickup windows as published in the booking flow. The start of the window is
// the commitment — a 2–5 PM slot is "2 PM" for notice purposes.
const SLOT_START_HOUR: Record<string, number> = {
  "8:00 AM": 8,
  "11:00 AM": 11,
  "1:00 PM": 13,   // detailing's afternoon half-day
  "2:00 PM": 14,
  "5:00 PM": 17,
};

export function slotStartHour(timeSlot: string | null | undefined): number | null {
  if (!timeSlot) return null;
  const start = timeSlot.split("–")[0]?.trim() ?? timeSlot.split("-")[0]?.trim();
  return SLOT_START_HOUR[start] ?? null;
}

/** Current wall-clock time in Toronto, where the vans actually drive. */
export function nowInToronto(): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find(p => p.type === t)!.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

/**
 * Hours between now and the start of the pickup window, both read as Toronto
 * wall-clock time — which is how a customer counts it ("it's 10am, pickup is
 * 2pm, that's 4 hours"). Comparing wall clocks can be out by an hour across
 * the one weekend a year the clocks change; that is accepted here rather than
 * pulling in a timezone library for a notice band whose fees are
 * discretionary anyway.
 *
 * Returns null when the slot can't be parsed, so callers fall back to the
 * safest reading rather than inventing a number.
 */
export function hoursUntilPickup(dateStr: string, timeSlot: string | null | undefined): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr ?? "")) return null;
  const hour = slotStartHour(timeSlot);
  if (hour == null) return null;

  const [y, m, d] = dateStr.split("-").map(Number);
  const pickup = Date.UTC(y, m - 1, d, hour, 0);
  const n = nowInToronto();
  const now = Date.UTC(n.year, n.month - 1, n.day, n.hour, n.minute);
  return (pickup - now) / 3_600_000;
}

export function cancellationTerms(dateStr: string, timeSlot: string | null | undefined): CancellationTerms {
  const h = hoursUntilPickup(dateStr, timeSlot);

  // Unparseable slot: treat it as the free band rather than quoting a fee we
  // can't justify. Erring toward charging a customer on a number we aren't
  // sure of is the wrong way round.
  if (h == null) {
    return {
      band: "free", hoursNotice: 0, free: true,
      headline: "Free cancellation",
      detail: "No cancellation fee applies.",
    };
  }

  if (h >= FREE_CANCELLATION_HOURS) {
    return {
      band: "free", hoursNotice: h, free: true,
      headline: "Free cancellation — no charge",
      detail: `You're giving ${FREE_CANCELLATION_HOURS}+ hours' notice, so there's no cancellation fee.`,
    };
  }
  if (h >= 0) {
    return {
      band: "late", hoursNotice: h, free: false,
      headline: `A $${CANCELLATION_FEE_CAD} cancellation fee may apply`,
      detail: `You're giving less than ${FREE_CANCELLATION_HOURS} hours' notice, so a flat $${CANCELLATION_FEE_CAD} fee may apply — the driver and the slot are already reserved. We'll contact you if we charge it.`,
    };
  }
  return {
    band: "no_show", hoursNotice: h, free: false,
    headline: "This pickup window has already started",
    detail: `The pickup window has passed, so a flat $${CANCELLATION_FEE_CAD} fee may apply. Please cancel anyway and we'll be in touch — if our driver hasn't come out yet there's usually nothing to pay.`,
  };
}

/** Plain-language summary recorded on the order, so staff can see on what
 *  terms it was cancelled without recomputing anything later. */
export function cancellationNote(terms: CancellationTerms, reason: string | null, by: "customer" | "staff"): string {
  const who = by === "customer" ? "Cancelled by the customer online" : "Cancelled by staff";
  const notice = terms.hoursNotice <= 0
    ? "after the pickup window had started"
    : terms.hoursNotice >= 48
      ? `${Math.round(terms.hoursNotice / 24)} days before the pickup window`
      : `${terms.hoursNotice.toFixed(1)}h before the pickup window`;
  const band = {
    free: `no fee (${FREE_CANCELLATION_HOURS}+ hours' notice)`,
    late: `$${CANCELLATION_FEE_CAD} fee may apply (under ${FREE_CANCELLATION_HOURS} hours' notice)`,
    no_show: `$${CANCELLATION_FEE_CAD} fee may apply (pickup window had started)`,
  }[terms.band];
  const why = reason?.trim() ? ` Reason: ${reason.trim().slice(0, 300)}` : "";
  return `${who}, ${notice} — ${band}.${why}`;
}
