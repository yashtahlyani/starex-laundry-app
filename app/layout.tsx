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
  description: "Book laundry and dry cleaning pickup online in minutes. Free pickup & delivery across the GTA. 24-hour turnaround.",
  keywords: "laundry pickup delivery, dry cleaning, wash fold, Canada, Toronto, GTA, Mississauga",
  openGraph: {
    type: "website",
    siteName: BUSINESS_NAME,
    title: `${BUSINESS_NAME} — Laundry & Dry Cleaning Pickup & Delivery`,
    description: "Book laundry and dry cleaning pickup online in minutes. Free pickup & delivery across the GTA. 24-hour turnaround.",
    url: PROD_URL,
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_NAME} — Laundry & Dry Cleaning Pickup & Delivery`,
    description: "Book laundry and dry cleaning pickup online in minutes. Free pickup & delivery across the GTA.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: PROD_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#111921] text-white antialiased font-body">
        <ScrollProgress />
        <PageLoader />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
