"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCTA from "./FloatingCTA";

const APP_PATHS = ["/dashboard", "/account", "/order", "/book"];
// The Offer page has its own dedicated, combo-aware sticky CTA bar — the
// generic floating "Book Pickup" pill was rendering on top of it (both
// fixed to the bottom, same z-index), colliding on mobile.
const OWN_STICKY_CTA_PATHS = ["/offer"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isAuthOrAdmin = path === "/auth" || path.startsWith("/admin");
  const isAppPage     = APP_PATHS.some(p => path.startsWith(p));
  const hasOwnStickyCta = OWN_STICKY_CTA_PATHS.some(p => path.startsWith(p));
  return (
    <>
      {!isAuthOrAdmin && <Navbar />}
      <main>{children}</main>
      {!isAuthOrAdmin && <Footer />}
      {!isAuthOrAdmin && !isAppPage && !hasOwnStickyCta && <FloatingCTA />}
    </>
  );
}
