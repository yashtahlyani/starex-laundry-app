import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Our Services",
  description: "Wash and Fold, Dry Cleaning, Express Same-Day, Ironing, and more. Professional laundry pickup and delivery across the GTA.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
