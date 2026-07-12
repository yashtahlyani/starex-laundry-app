import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with StareX. We reply within 1 business hour — questions, feedback, or partnership inquiries welcome.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
