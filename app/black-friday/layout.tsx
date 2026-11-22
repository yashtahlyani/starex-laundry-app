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
  title: "Black Friday: 50% Off Dry Cleaning",
  description:
    `50% off dry cleaning in ${SERVICE_AREA}, ${PROMO.dates}. Free pickup and delivery `
    + `on orders over $${MINIMUM_ORDER.standardCad}. Black Friday orders are delivered `
    + `in about 7 days.`,
  alternates: { canonical: PROMO.landingPath },
  openGraph: {
    type: "website",
    siteName: "Starex",
    locale: "en_CA",
    url: PROMO.landingPath,
    title: `Black Friday: 50% Off Dry Cleaning | Starex`,
    description:
      `${PROMO.dates} only. Your coat, suit, saree or dress at half price across `
      + `${SERVICE_AREA}, with free pickup and delivery. Black Friday orders come back `
      + `in about 7 days.`,
    images: [{
      url: "/images/starex/05_bags_with_copy.jpg",
      width: 1920, height: 1080,
      alt: "Starex - Black Friday, 50% off dry cleaning, free pickup and delivery in Brampton and Mississauga.",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Black Friday: 50% Off Dry Cleaning | Starex",
    description: `${PROMO.dates} only. Half price dry cleaning, free pickup and delivery. Orders come back in about 7 days.`,
    images: ["/images/starex/05_bags_with_copy.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
