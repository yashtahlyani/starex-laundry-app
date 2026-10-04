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
  email: "info@royalarttreasure.com",
  phone: "437-607-7251",
  phoneHref: "+14376077251",
  cities: ["Brampton, ON", "Mississauga, ON"],
};

export const SOCIAL_LINKS: { instagram: string; twitter: string; facebook: string } = {
  instagram: "",
  twitter: "",
  facebook: "",
};
