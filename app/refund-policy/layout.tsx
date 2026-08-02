import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Refund, Cancellation & Damage Policy — Starex",
  description: "How Starex handles order cancellations, rescheduling, refunds, and claims for damaged, lost, or unsatisfactory items.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
