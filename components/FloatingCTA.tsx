"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href="/book"
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            position: "fixed",
            bottom: 28,
            right: 24,
            zIndex: 400,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(180deg,#DA6178 0%,#CB3E5E 100%)",
            color: "#FFFFFF",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "0.9375rem",
            padding: "13px 24px",
            borderRadius: 120,
            textDecoration: "none",
            boxShadow: "0 8px 32px rgba(203,62,94,0.4), 0 2px 8px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          Book Pickup <ArrowRight size={15} />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
