import type { Metadata } from "next";
import "./globals.css";
import { BUSINESS_NAME } from "@/lib/pricing";
import PageLoader from "@/components/PageLoader";
import ScrollProgress from "@/components/ScrollProgress";
import LayoutShell from "@/components/LayoutShell";

const PROD_URL = "https://starex-laundry-app-v2.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(PROD_URL),
  title: {
    default: `${BUSINESS_NAME} — Laundry & Dry Cleaning Pickup & Delivery`,
    template: `%s | ${BUSINESS_NAME}`,
  },
  description: "Laundry at $2.29/lb with free pickup & delivery on 15 lbs+. Dry cleaning, ironing, household items, and car & sofa detailing. Serving Brampton & Mississauga with 24–48h turnaround.",
  keywords: "laundry pickup delivery, dry cleaning, wash fold, Brampton, Mississauga, Canada, car detailing, sofa cleaning",
  openGraph: {
    type: "website",
    siteName: BUSINESS_NAME,
    title: `${BUSINESS_NAME} — Laundry & Dry Cleaning Pickup & Delivery`,
    description: "Laundry at $2.29/lb with free pickup & delivery on 15 lbs+. Serving Brampton & Mississauga with 24–48h turnaround.",
    url: PROD_URL,
    locale: "en_CA",
    images: [{ url: "/images/starex-hero-banner.png", width: 1717, height: 916, alt: BUSINESS_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_NAME} — Laundry & Dry Cleaning Pickup & Delivery`,
    description: "Laundry at $2.29/lb with free pickup & delivery on 15 lbs+. Serving Brampton & Mississauga.",
    images: ["/images/starex-hero-banner.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FFFFFF] text-[#161616] antialiased font-body">
        <ScrollProgress />
        <PageLoader />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
