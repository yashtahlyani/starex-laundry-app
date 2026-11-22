/**
 * Time-limited promotion notice, shown on the homepage and the booking page.
 *
 * Black Friday 2026, per the owner (2026-11-22): 50% off, and an honest
 * warning that delivery slows to about a week while the offer runs, with
 * regular orders unaffected.
 *
 * The dates are the whole point of this file. A "Black Friday" banner still
 * up in December is worse than no banner — it advertises a discount the shop
 * is no longer giving and a delay it is no longer suffering — so the window
 * is declared once here and the banner removes itself. Nobody has to
 * remember to take it down.
 *
 * `endDate` is inclusive: the offer runs to the end of 29 November.
 */
export const PROMO = {
  id: "black-friday-2026",
  /** Inclusive, in Toronto time — the clock the vans and the shop run on. */
  startDate: "2026-11-22",
  endDate: "2026-11-29",
  headline: "Black Friday — 50% off",
  dates: "Nov 22 to Nov 29",
  /** The warning the owner specifically wanted customers to see up front. */
  detail:
    "Delivery is taking about 1 week during the offer because of high demand. "
    + "Regular orders are still back in 24 to 48 hours.",
  /** Said plainly because the website still quotes normal prices: the
   *  discount is applied by staff when the final price is confirmed, after
   *  the order is weighed or counted. A customer who sees "50% off" and then
   *  a full-price estimate will assume the offer is not being honoured. */
  appliedNote: "Your 50% discount is applied when we confirm your final price.",
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
