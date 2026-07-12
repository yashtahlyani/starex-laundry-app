import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the most common questions about StareX laundry and dry cleaning pickup and delivery service.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
