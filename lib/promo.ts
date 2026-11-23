/**
 * The Black Friday notice on the homepage and the booking page.
 *
 * What this is NOT: an advert for the discount. The owner was explicit
 * (2026-11-23): "This is only about the delivery time - please do NOT change
 * any prices for Black Friday. The 50% off is claimed by WhatsApp, not on
 * the website."
 *
 * An earlier version of this file carried the 50% and a /black-friday
 * landing page sold it. That was built on his message of the 22nd and is
 * wrong under this one, so the figure is gone from the site entirely. The
 * website's job here is to warn people about the delivery time before they
 * book; WhatsApp's job is the offer. Both messages still have to be true, and
 * the one that costs us if it is missing is the delay.
 *
 * The dates are the point of this file. A Black Friday notice still up in
 * December warns about a delay the shop is no longer suffering, so the window
 * is declared once and everything built on it removes itself. Nobody has to
 * remember to take it down.
 *
 * `endDate` is inclusive: the notice runs to the end of 29 November.
 */
export const PROMO = {
  id: "black-friday-2026",
  /** Inclusive, in Toronto time - the clock the vans and the shop run on. */
  startDate: "2026-11-22",
  endDate: "2026-11-29",

  /** The owner's own sentence, used verbatim wherever the notice appears.
   *  Kept as one string so the homepage, the booking page and the booking
   *  step cannot drift into three slightly different promises. */
  notice:
    "Black Friday offer (Nov 22–29): delivery in about 1 week due to high demand. "
    + "Regular orders still back in 24–48 hours.",

  label: "Black Friday",
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
