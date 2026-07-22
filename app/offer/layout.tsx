import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "5 for $50 Dry Clean Combo",
  description: "Dry clean any 5 regular garments or pieces, including 1 blanket or quilt, for a flat $50. StareX's limited-time dry cleaning combo — Brampton & Mississauga.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
