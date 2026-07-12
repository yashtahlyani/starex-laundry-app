import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "How It Works",
  description: "Book online, we pick up your laundry, clean it professionally, and deliver it back — usually in 24 hours.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
