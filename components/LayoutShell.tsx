"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCTA from "./FloatingCTA";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const hideChrome = path === "/auth" || path.startsWith("/admin");
  return (
    <>
      {!hideChrome && <Navbar />}
      <main>{children}</main>
      {!hideChrome && <Footer />}
      {!hideChrome && <FloatingCTA />}
    </>
  );
}
