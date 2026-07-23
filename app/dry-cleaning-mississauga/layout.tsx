import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dry Cleaning in Mississauga, ON — Free Pickup & Delivery | StareX",
  description: "Professional dry cleaning pickup & delivery in Mississauga, Ontario. Suits, sarees, gowns, coats & more from $4.99/item. Try the 5-for-$50 combo. Serving Port Credit, Cooksville, Streetsville, Erin Mills & Meadowvale.",
  alternates: { canonical: "/dry-cleaning-mississauga" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
