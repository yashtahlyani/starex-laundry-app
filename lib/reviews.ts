// Customer reviews shown on the site.
//
// Client, 23 Oct: "update our Google reviews to our website to create trust
// and can choose some reviews (word to word) no editing and show our
// customers what people say about Us".
//
// Two rules this file exists to enforce:
//
//  1. NOTHING HERE IS WRITTEN BY US. Every word of a review is the
//     customer's. Google blocks automated reads of a Business Profile, so
//     reviews arrive either from the Places API (below) or by being pasted in
//     verbatim. Inventing a plausible-sounding review would be fabricating a
//     testimonial — illegal under the Competition Act s.74.01 as a false
//     representation, and the fastest way to lose a Business Profile.
//
//  2. The section renders NOTHING until real reviews exist. No placeholders,
//     no "coming soon", no sample quotes that someone later forgets to swap.

export type Review = {
  /** exactly as the reviewer wrote it — never edited, trimmed or tidied */
  text: string;
  /** reviewer's display name as Google shows it */
  author: string;
  rating: number;
  /** e.g. "2 weeks ago" — Google's own wording */
  relativeTime?: string;
  /** reviewer's Google profile photo, if the API supplied one */
  photoUrl?: string;
  /** link to the review on Google, so anyone can check it is real */
  url?: string;
};

/**
 * Reviews pasted in by hand, word for word.
 *
 * Used when there's no Places API key. To add one, copy the review text from
 * the Google Business Profile EXACTLY — including typos, capitalisation and
 * punctuation. Do not fix spelling. Do not shorten. If a review is too long
 * for the layout, leave it long; the layout handles it.
 *
 * Deliberately empty: no review has been supplied yet, and a made-up one is
 * not a placeholder, it is a lie.
 */
export const MANUAL_REVIEWS: Review[] = [];

/**
 * Google Places API.
 *
 * Setting GOOGLE_PLACES_API_KEY makes the reviews section fill itself from
 * the live Business Profile and stay current, which also removes the
 * hand-maintained rating in lib/site.ts. Without a key the section falls back
 * to MANUAL_REVIEWS above.
 *
 * NOTE, tested 24 Oct 2026 with a live key: rating and userRatingCount come
 * back fine, but `reviews` returns empty with HTTP 200 and no error. That is
 * what you get when the Cloud project has no billing account — review TEXT
 * sits in the "Place Details Enterprise + Atmosphere" SKU, which requires
 * billing enabled (Google's free monthly Maps credit then covers this
 * volume). Rating and count work without it, which is why the badge updates
 * itself today and the reviews section is still waiting.
 *
 * Google's terms require the reviewer's name to be shown with their review
 * and prohibit storing review content long-term, so this is fetched live and
 * only briefly cached, never written to the database.
 */
export const PLACES_TEXT_QUERY = "Starex Laundry Dryclean Brampton Ontario";

/**
 * The Business Profile's Place ID, resolved from the owner's own profile on
 * 24 Oct 2026 and confirmed against it: "Starex - Laundry / Dryclean",
 * 25 Grendon Cres, Brampton ON L6X 5N4, 5.0 from 19 reviews.
 *
 * A Place ID is a public identifier, not a secret — it is safe in the repo,
 * and hardcoding it skips a lookup call on every cold start. The API KEY is
 * not here and must never be: it lives only in GOOGLE_PLACES_API_KEY.
 */
export const GOOGLE_PLACE_ID = "ChIJMRrq8S0VK4gR9LZIyAL8v34";

export const REVIEWS_SECTION = {
  eyebrow: "What Our Customers Say",
  heading: "Reviewed by the people who use us.",
  /** shown under the heading; no claim about the count, which varies */
  blurb: "Every review below is from our Google Business Profile, word for word.",
};
