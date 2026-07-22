import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Our Services",
  description: "Wash & Fold at $2/lb, Dry Cleaning, Same-Day Express, Ironing, Household items, and Car & Sofa Detailing. Professional laundry pickup and delivery in Brampton & Mississauga.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
