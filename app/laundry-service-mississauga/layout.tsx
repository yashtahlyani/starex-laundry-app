import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Laundry Pickup & Delivery in Mississauga, ON | StareX",
  description: "Wash & fold laundry pickup & delivery in Mississauga, Ontario at $2/lb, $40 minimum. Same-day express available. Serving Port Credit, Cooksville, Streetsville, Erin Mills & Meadowvale.",
  alternates: { canonical: "/laundry-service-mississauga" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
