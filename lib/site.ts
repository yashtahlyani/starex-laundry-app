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
export const CONTACT = {
  email: "sushil.starex@gmail.com",
  phone: "437-607-7251",
  phoneHref: "+14376077251",
  cities: ["Brampton, ON", "Mississauga, ON"],
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
  reviewCount: 17,
};
