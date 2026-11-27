import type { Metadata } from "next";
export const metadata: Metadata = {
  // Owner's wording, 26 Nov 2026. `absolute` because the string he gave does
  // not include the brand, and the root layout's `%s | Starex` template would
  // otherwise push it to 60 characters. 51 as it stands.
  title: { absolute: "Dry Cleaning & Laundry FAQ — Brampton & Mississauga" },
  description: "Answers to the most common questions about Starex laundry and dry cleaning pickup and delivery service.",
  alternates: { canonical: "/faq" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
