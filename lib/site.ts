// Public origin used in SEO surfaces (sitemap, robots, OG/metadata).
// Follows NEXT_PUBLIC_SITE_URL when it's a real https origin — so once the
// client attaches their custom domain and updates that env var, every SEO
// surface moves with it. Falls back to the Vercel URL otherwise (e.g. local
// dev, where NEXT_PUBLIC_SITE_URL is http://localhost).
// The custom domain is live and permanent, so it's the safe default. The old
// fallback was the Vercel preview URL, which meant any environment missing
// NEXT_PUBLIC_SITE_URL would quietly publish canonical tags, sitemap entries
// and structured data pointing at a hostname customers never see.
const FALLBACK = "https://starexlaundrydryclean.ca";
const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;

export const SITE_ORIGIN =
  fromEnv && fromEnv.startsWith("https://") ? fromEnv.replace(/\/+$/, "") : FALLBACK;

// Single source of truth for public contact details and social profiles.
// Update these in one place. Social URLs are empty until the business creates
// the profiles — the footer renders the icon but doesn't link anywhere while a
// URL is blank, so there are no dead "#" links that jump the page to the top.
/**
 * Street address, added at the owner's request on 26 Nov 2026 so Google has a
 * real postal address for the business instead of two city names.
 *
 * This is the single copy. The footer, the homepage/book/pricing structured
 * data and lib/schema.ts all read it from here, so there is no second
 * hand-typed address to go stale -- the defect this codebase keeps relearning.
 *
 * NAP CONSISTENCY: for local ranking this must match the Google Business
 * Profile character for character, including whether the street is written
 * "Cres", "Cresc" or "Crescent". If the Business Profile says something
 * different, change the Business Profile or change this -- but make them the
 * same. The marketing-email footer carries the same address via
 * CAMPAIGN_MAILING_ADDRESS in .env.local; keep that in step too.
 */
export const BUSINESS_ADDRESS = {
  street: "25 Grendon Cres",
  city: "Brampton",
  region: "ON",
  regionName: "Ontario",
  postalCode: "L6X 5N4",
  country: "CA",
};

/** One-line form for the footer and anywhere else prose needs it. */
export const BUSINESS_ADDRESS_LINE =
  `${BUSINESS_ADDRESS.street}, ${BUSINESS_ADDRESS.city}, ${BUSINESS_ADDRESS.region} ${BUSINESS_ADDRESS.postalCode}`;

/**
 * Opening hours, corrected from 7am-8pm to 8am-9pm on 26 Nov 2026 (owner).
 * Read by the structured data on every page that carries business details, so
 * the hours Google sees can only ever be wrong in one place.
 */
export const OPENING_HOURS = { opens: "08:00", closes: "21:00" };

export const CONTACT = {
  email: "sushil.starex@gmail.com",
  phone: "437-607-7251",
  phoneHref: "+14376077251",
  cities: ["Brampton, ON", "Mississauga, ON"],
};

/**
 * Interac e-Transfer, offered alongside card at payment time (per client,
 * 2026-11-07). Customers send the money themselves from their own bank, so
 * this address is the only thing standing between a customer and their money
 * going to the wrong place — it lives here, in one place, rather than being
 * typed into a page.
 *
 * Nothing about an e-Transfer is automatic: the customer tells us they have
 * sent it, and staff mark the order paid only once it actually lands.
 *
 * The address was first given as info@royalarttreasure.ca, which the owner
 * confirmed on 10 Nov was a typo. Info@royalarttreasure.com is real but is
 * the Royal Art Treasure sending address, not where transfers should land;
 * asked which to use for money, he confirmed his own address below. Worth
 * recording, because the three are one letter and one word apart and the
 * wrong one sends a customer's money somewhere nobody is watching.
 */
export const ETRANSFER = {
  enabled: true,
  email: CONTACT.email,
  /** Shown to the customer so the payment can be matched to their order. */
  memoHint: "Please put your order number in the message box.",
};

export const SOCIAL_LINKS: { instagram: string; twitter: string; facebook: string } = {
  instagram: "",
  twitter: "",
  facebook: "",
};

// Google Business Profile. Empty until the owner sends the real profile link —
// the trust badge then switches from showing Starex's own verified order
// ratings to showing the Google rating, and links to the profile so anyone can
// check it.
//
// These stay blank rather than being filled with a plausible-looking number:
// a rating nobody can verify is worth less than no rating, and a wrong one on
// a review badge is the kind of thing that gets a Business Profile actioned.
// There is an unrelated "Starex Drycleaners" trading elsewhere — its rating is
// not this business's and must never be used here.
// kgmid is the stable Google identifier for this business, taken from the
// Business Profile link the owner sent on 16 Oct. It survives name and
// address edits, unlike a maps.google URL with coordinates in it.
//
// ratingValue / reviewCount are reported by the owner from their own Business
// Profile (16 Oct 2026: 5.0 from 17 reviews). Google blocks automated reads of
// the knowledge panel, so these cannot be fetched or checked from here.
//
// THEY ARE A SNAPSHOT AND WILL GO STALE. Every new review moves the real
// figure, and a rating on the site that no longer matches the profile is
// worse than none — update both numbers whenever the profile changes. To stop
// maintaining them by hand, add a Google Places API key and fetch
// rating/user_ratings_total live in /api/reviews/summary.
//
// (There is an unrelated "Starex Drycleaners" trading elsewhere — its rating
// is not this business's and must never be used here.)
export const GOOGLE_REVIEWS: {
  profileUrl: string;
  writeReviewUrl: string;
  ratingValue: number | null;
  reviewCount: number | null;
} = {
  profileUrl: "https://www.google.com/search?kgmid=/g/11z90pm234",
  // Needs the Place ID (not the kgmid), which isn't in the link supplied —
  // left blank rather than built into a URL that would 404.
  writeReviewUrl: "",
  ratingValue: 5,
  // 19 as of 24 Oct 2026, read off the owner's own Business Profile panel.
  // It was 17 six days earlier — which is exactly why a hand-typed count is
  // the wrong long-term answer. A Google Cloud key with the Places API
  // enabled makes this update itself; see lib/reviews.ts.
  reviewCount: 19,
};
