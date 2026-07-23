import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Laundry Pickup & Delivery in Brampton, ON | StareX",
  description: "Wash & fold laundry pickup & delivery in Brampton, Ontario at $2/lb, $40 minimum. Same-day express available. Serving Bramalea, Downtown Brampton, Mount Pleasant & Springdale.",
  alternates: { canonical: "/laundry-service-brampton" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
