"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function MobileBookingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > window.innerHeight * 0.75);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
        >
          <div className="bg-white/80 backdrop-blur-xl border-t border-gray-100 px-4 pt-3 pb-safe-area-inset-bottom">
            <a
              href="/book"
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-brand py-4 text-base font-bold text-white shadow-glow active:scale-[0.98] transition-transform"
            >
              Book a Pickup <ArrowRight size={18} />
            </a>
            <p className="text-center text-xs text-gray-400 mt-2 pb-2">
              Free pickup &amp; delivery 28+ lbs · 24-hr turnaround
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
