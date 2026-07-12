import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Enter your StareX order code to see real-time status updates from pickup to delivery.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
