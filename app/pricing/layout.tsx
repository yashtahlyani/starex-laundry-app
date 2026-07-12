import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent, per-pound pricing with no hidden fees. Wash and Fold from $1.25/lb. View all StareX service plans.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
