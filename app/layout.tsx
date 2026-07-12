import type { Metadata } from "next";
import "./globals.css";
import { BUSINESS_NAME } from "@/lib/pricing";
import PageLoader from "@/components/PageLoader";
import ScrollProgress from "@/components/ScrollProgress";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: `${BUSINESS_NAME} — Laundry & Dry Cleaning Pickup & Delivery Canada`,
  description: "Book laundry and dry cleaning pickup online in minutes. Free pickup & delivery across Vancouver, Toronto, Calgary and Edmonton. 24-hour turnaround.",
  keywords: "laundry pickup delivery, dry cleaning, wash fold, Canada, Vancouver, Toronto, Calgary",
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
