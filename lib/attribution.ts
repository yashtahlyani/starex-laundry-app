// Where a booking actually came from.
//
// The business is paying for Facebook ads (2.5K reach, 107 landing-page views,
// $24.88 spent in the first week) and has no way to tell whether any booking
// came from them — there is no analytics or ad pixel on the site at all. This
// records the traffic source on the visitor's first page view and attaches it
// to whatever they eventually book, so "did the ad produce anything?" becomes a
// question with an answer.
//
// First-touch, deliberately: someone who arrives from an ad, leaves, and comes
// back the next day by typing the address still gets credited to the ad, which
// is the honest reading of what caused the booking.
//
// No third-party script, no cookies, no personal data — just the referrer and
// any UTM tags, kept in sessionStorage for the length of the visit.

const KEY = "starex_source";

export type Attribution = {
  source: string;       // "facebook", "google", "direct", …
  medium?: string;
  campaign?: string;
  landedOn: string;     // first page of the visit
  at: string;           // ISO timestamp of first touch
};

// Turns a referrer URL into something a human reading an email understands.
function sourceFromReferrer(referrer: string): string {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("facebook") || host === "fb.com" || host.includes("fbclid")) return "facebook";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("google")) return "google";
    if (host.includes("bing")) return "bing";
    if (host.includes("whatsapp") || host.includes("wa.me")) return "whatsapp";
    if (host.endsWith("starexlaundrydryclean.ca")) return "internal";
    return host;
  } catch {
    return "direct";
  }
}

/** Records the first touch of this visit. Safe to call on every page view. */
export function captureSource(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return; // first touch wins

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    // Facebook appends fbclid even when the ad has no UTM tags on it, which is
    // the common case for a boosted post — treat it as proof of a Facebook click.
    const hasFbclid = params.has("fbclid");
    const referrerSource = sourceFromReferrer(document.referrer);

    const attribution: Attribution = {
      source: utmSource || (hasFbclid ? "facebook" : referrerSource),
      medium: params.get("utm_medium") || (hasFbclid ? "paid" : undefined) || undefined,
      campaign: params.get("utm_campaign") || undefined,
      landedOn: window.location.pathname,
      at: new Date().toISOString(),
    };
    // An internal referrer on the first page of a visit just means a stale
    // referrer header; it says nothing useful, so record it as direct.
    if (attribution.source === "internal") attribution.source = "direct";

    sessionStorage.setItem(KEY, JSON.stringify(attribution));
  } catch {
    // Private browsing can throw on sessionStorage. Attribution is a nice-to-
    // have; it must never break a booking.
  }
}

/** Reads the stored first touch, for sending along with a booking. */
export function getSource(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/** One-line summary for the owner's booking email. */
export function describeSource(a: Attribution | null | undefined): string {
  if (!a) return "unknown";
  const parts = [a.source];
  if (a.medium) parts.push(a.medium);
  if (a.campaign) parts.push(a.campaign);
  const where = a.landedOn && a.landedOn !== "/" ? ` · landed on ${a.landedOn}` : "";
  return parts.join(" / ") + where;
}
