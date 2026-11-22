import type { Metadata } from "next";
import { PROMO } from "@/lib/promo";
import { SERVICE_AREA, MINIMUM_ORDER } from "@/lib/pricing";

/**
 * Metadata for the offer page.
 *
 * This matters more than anything on the page itself. An eight-day offer
 * will not rank in organic search — Google takes weeks to recrawl and
 * reconsider a page — so almost every visitor will arrive from a link the
 * owner shares on WhatsApp, Instagram or his Google Business Profile. What
 * those apps show is this block: the title, the description and the image.
 *
 * So the description reads as the advert, not as a summary, and the image is
 * one of the shots with the branding already on it, because a link preview
 * is the one place the creative is seen whole.
 */
export const metadata: Metadata = {
  title: "Black Friday: 50% Off Laundry & Dry Cleaning",
  description:
    `50% off laundry and dry cleaning in ${SERVICE_AREA}, ${PROMO.dates}. `
    + `Free pickup and delivery, $${MINIMUM_ORDER.standardCad} minimum. `
    + `Delivery takes about a week during the offer.`,
  alternates: { canonical: PROMO.landingPath },
  openGraph: {
    type: "website",
    siteName: "Starex",
    locale: "en_CA",
    url: PROMO.landingPath,
    title: `Black Friday: 50% Off | Starex Laundry & Dry Cleaning`,
    description:
      `${PROMO.dates} only. 50% off laundry and dry cleaning across ${SERVICE_AREA}, `
      + `with free pickup and delivery. Delivery takes about a week during the offer.`,
    images: [{
      url: "/images/starex/05_bags_with_copy.jpg",
      width: 1920, height: 1080,
      alt: "Starex laundry and dry cleaning - Black Friday, 50% off, free pickup and delivery in Brampton and Mississauga.",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Black Friday: 50% Off | Starex",
    description: `${PROMO.dates} only. 50% off laundry and dry cleaning, free pickup and delivery.`,
    images: ["/images/starex/05_bags_with_copy.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
