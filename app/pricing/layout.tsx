import type { Metadata } from "next";
import { BUSINESS_JSON_LD } from "@/lib/schema";
export const metadata: Metadata = {
  // Owner's wording, 26 Nov 2026. `absolute` for the same reason as /faq --
  // with " | Starex" appended this would run to 63 characters and Google would
  // cut it mid-phrase.
  title: { absolute: "Dry Cleaning & Laundry Prices — Brampton & Mississauga" },
  description: "Transparent pricing with no hidden fees. Wash & Fold at $2/lb, $40 minimum order value. View all Starex service plans, item prices, and the Monthly Plan.",
  alternates: { canonical: "/pricing" },
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
