import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Monthly Plan",
  description: "StareX Monthly Plan: one flat rate, regular pickups, no per-order thinking. Laundry on autopilot for Brampton & Mississauga.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
