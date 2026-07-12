"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCTA from "./FloatingCTA";

const APP_PATHS = ["/dashboard", "/account", "/order", "/book"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isAuthOrAdmin = path === "/auth" || path.startsWith("/admin");
  const isAppPage     = APP_PATHS.some(p => path.startsWith(p));
  return (
    <>
      {!isAuthOrAdmin && <Navbar />}
      <main>{children}</main>
      {!isAuthOrAdmin && <Footer />}
      {!isAuthOrAdmin && !isAppPage && <FloatingCTA />}
    </>
  );
}
