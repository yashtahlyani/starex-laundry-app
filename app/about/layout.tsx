import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "About StareX",
  description: "Learn about StareX — Canada's premium laundry and dry cleaning pickup and delivery service, built for busy Canadians.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
