import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent pricing with no hidden fees. Wash & Fold at $2/lb, $40 minimum order value. View all StareX service plans, item prices, and the Monthly Plan.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
