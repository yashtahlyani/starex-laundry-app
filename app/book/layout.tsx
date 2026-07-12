import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Book Laundry Pickup",
  description: "Schedule a laundry or dry cleaning pickup in under 2 minutes. Choose your service, date, and time — we handle the rest.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
