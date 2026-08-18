import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Refund, Cancellation & Damage Policy",
  description: "How Starex handles order cancellations, rescheduling, refunds, and claims for damaged, lost, or unsatisfactory items.",
  alternates: { canonical: "/refund-policy" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
