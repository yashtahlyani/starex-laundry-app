/**
 * Time-limited promotion notice, shown on the homepage, the booking page and
 * its own page at /black-friday.
 *
 * Black Friday 2026, per the owner (2026-11-22, terms confirmed 2026-11-23):
 * 50% off dry cleaning only, excluding leather, suede, wedding dresses and
 * the 5-for-$50 combo. Orders placed on the offer are delivered in about a
 * week; everything else keeps the usual schedule.
 *
 * The dates are the point of this file. A "Black Friday" banner still up in
 * December advertises a discount the shop is no longer giving and a delay it
 * is no longer suffering, so the window is declared once here and everything
 * built on it removes itself. Nobody has to remember to take it down.
 *
 * `endDate` is inclusive: the offer runs to the end of 29 November.
 */
export const PROMO = {
  id: "black-friday-2026",
  /** Inclusive, in Toronto time - the clock the vans and the shop run on. */
  startDate: "2026-11-22",
  endDate: "2026-11-29",
  headline: "Black Friday - 50% off dry cleaning",
  dates: "Nov 22 to Nov 29",

  /**
   * The delivery warning, which the owner asked twice to be made unmissable:
   * "make sure if a person books he/she should be aware of the fact that
   * their garments are coming in 7 days".
   *
   * It is the first thing after the discount everywhere it appears. An offer
   * that wins bookings by burying a week-long wait wins complaints a week
   * later, and those complaints land on the same Google profile the offer
   * was meant to grow.
   */
  detail:
    "Black Friday orders are delivered in about 7 days because of high demand. "
    + "Regular orders are still back in 24 to 48 hours.",

  /** Said plainly because the website still quotes normal prices: the
   *  discount is applied by staff when the final price is confirmed, after
   *  the items are counted. A customer who reads "50% off" and then sees a
   *  full-price estimate will assume the offer is not being honoured. */
  appliedNote: "Your 50% discount is applied when we confirm your final price.",

  /** Its own page, so there is one link to share on WhatsApp, Instagram,
   *  Google Business and anywhere else. A shared link that previews well is
   *  worth more than any amount of on-site copy for an eight-day offer. */
  landingPath: "/black-friday",

  /** What the discount covers, in the owner's own terms. Kept as data rather
   *  than prose so the page, the banner and the booking notice cannot drift
   *  into promising different things. */
  appliesTo: "dry cleaning",
  exclusions: ["leather", "suede", "wedding dresses", "the 5 for $50 combo"],

  terms: [
    "50% off dry cleaning only. Wash & fold, ironing and detailing are at their normal prices.",
    "Leather, suede, wedding dresses and the 5 for $50 combo are not included.",
    "Book between 22 and 29 November to get the offer.",
    "Black Friday orders are delivered in about 7 days. Regular orders keep the usual 24 to 48 hour schedule.",
    "Your discount is applied when we confirm your final price, after your items are counted.",
    "Free pickup and delivery, as always.",
  ],
} as const;

/** Today in Toronto, as YYYY-MM-DD. The site serves one city pair in one
 *  timezone; the server runs in UTC, which is a different day for five hours
 *  every evening. */
export function todayInToronto(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

/** ISO dates compare correctly as plain strings, so no Date objects and no
 *  off-by-one from parsing. */
export function isPromoActive(today: string = todayInToronto()): boolean {
  return today >= PROMO.startDate && today <= PROMO.endDate;
}

/** Whether this service is one the discount actually applies to. Used by the
 *  booking page so a wash & fold customer is not told about a dry cleaning
 *  discount they cannot have. */
export function promoAppliesToService(serviceId: string): boolean {
  return serviceId === "dry-clean";
}
