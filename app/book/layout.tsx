import type { Metadata } from "next";
import { BUSINESS_JSON_LD } from "@/lib/schema";
export const metadata: Metadata = {
  title: "Book Laundry Pickup",
  description: "Schedule a laundry or dry cleaning pickup in under 2 minutes. Choose your service, date, and time — we handle the rest.",
  alternates: { canonical: "/book" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Business details for Google. The owner asked for these on /book and
          /pricing as well as the homepage (26 Nov 2026) -- they are two of the
          three pages people actually land on, and carried none. Emitted from
          the layout rather than the page because the page is a client
          component; this way the markup is in the served HTML. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BUSINESS_JSON_LD) }} />
      {children}
    </>
  );
}
