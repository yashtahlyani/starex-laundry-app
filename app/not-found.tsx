"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease = [0.25, 0.4, 0.25, 1] as const;

export default function NotFound() {
  return (
    <div style={{ background: "#1F1B1B", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {/* Ghost 404 */}
      <p aria-hidden="true" style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
        fontFamily: "Poppins, sans-serif", fontWeight: 700,
        fontSize: "clamp(8rem,25vw,20rem)", letterSpacing: "-0.04em", lineHeight: 0.85,
        color: "rgba(255,255,255,0.03)", userSelect: "none", pointerEvents: "none", whiteSpace: "nowrap",
      }}>404</p>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        style={{ textAlign: "center", padding: "0 24px", position: "relative", zIndex: 1 }}
      >
        <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Page Not Found</span>

        <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "-0.022em", lineHeight: 1.1, color: "#ffffff", marginBottom: 16 }}>
          This page got{" "}
          <em className="display-accent" style={{ display: "inline" }}>lost</em>{" "}
          in the wash.
        </h1>

        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1.0625rem", lineHeight: 1.75, maxWidth: "42ch", margin: "0 auto 36px", fontFamily: "Kodchasan, sans-serif" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <a href="/" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "14px 28px" }}>
          Back to Home <ArrowRight size={16} />
        </a>
      </motion.div>
    </div>
  );
}
