"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/components/Logo";

// Brief branded splash shown once per hard page load (this component lives
// in the root layout, so client-side route transitions never remount it —
// only a fresh visit or full refresh triggers it), matching the "before
// loading site the logo is appearing" treatment on the India site.
const HOLD_MS = 550;

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), HOLD_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "#FFFFFF",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <Logo color="#161616" fontSize="6.5rem" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
