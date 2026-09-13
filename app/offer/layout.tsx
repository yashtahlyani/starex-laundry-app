import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "5 for $50 Dry Clean Combo",
  description: "Dry clean any 5 regular garments or pieces, including 1 blanket or quilt, for a flat $50. StareX's limited-time dry cleaning combo — Brampton & Mississauga.",
  alternates: { canonical: "/offer" },
  // The offer creative has its copy baked in, so it's used where it's shown
  // whole — as the link preview when this page is shared (mostly WhatsApp) —
  // never as an on-page background under live text.
  openGraph: {
    type: "website",
    siteName: "StareX",
    locale: "en_CA",
    url: "/offer",
    title: "5 for $50 Dry Clean Combo | StareX",
    description: "Dry clean any 5 regular garments or pieces, including 1 blanket or quilt, for a flat $50 +HST. Free pickup & delivery in Brampton & Mississauga.",
    images: [{ url: "/images/starex/10_offer_ivory_with_copy.jpg", width: 1920, height: 1080, alt: "Dry cleaning 5 for $50 +HST — look sharp, spend less. Free pickup & delivery." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "5 for $50 Dry Clean Combo | StareX",
    description: "Dry clean any 5 regular garments or pieces for a flat $50 +HST. Free pickup & delivery.",
    images: ["/images/starex/10_offer_ivory_with_copy.jpg"],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
