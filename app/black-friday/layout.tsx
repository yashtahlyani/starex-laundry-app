import type { Metadata } from "next";
import { SERVICE_AREA } from "@/lib/pricing";

/**
 * Metadata for the delivery-notice page.
 *
 * It advertised 50% off until 2026-11-23, when the owner said the website
 * covers the delivery time only and the discount is claimed over WhatsApp.
 * The discount is therefore out of the title, the description and the link
 * preview — those are the parts that travel furthest, into chats and search
 * results, and they are the last place a figure he does not want published
 * should survive.
 *
 * noindex, because a dated notice is not something Google should be ranking
 * or still showing in December. The page stays reachable for anyone holding
 * the link.
 */
export const metadata: Metadata = {
  title: "Black Friday delivery times",
  description:
    `Delivery times at Starex during Black Friday week in ${SERVICE_AREA}. `
    + `Regular orders are still back in 24 to 48 hours.`,
  alternates: { canonical: "/black-friday" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName: "Starex",
    locale: "en_CA",
    url: "/black-friday",
    title: "Black Friday delivery times | Starex",
    description:
      `Delivery is taking about a week during Black Friday. Regular orders are still `
      + `back in 24 to 48 hours, with free pickup and delivery across ${SERVICE_AREA}.`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
