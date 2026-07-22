"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, Sparkles } from "lucide-react";
import { DRY_CLEAN_COMBO, HST_LABEL } from "@/lib/pricing";

const ease = [0.25, 0.4, 0.25, 1] as const;

function AnimatedContent({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay, ease }} style={style}>
      {children}
    </motion.div>
  );
}

const eligible = [
  "Suits, shirts, dresses & bottoms",
  "Sweaters, hoodies & silk blouses",
  "Coats, jackets & sarees",
  "1 blanket or quilt (can be one of your 5)",
];

const excluded = ["Wedding dresses", "Leather items"];

export default function OfferPage() {
  return (
    <div style={{ background: "#FFFFFF" }}>

      {/* Hero */}
      <section style={{
        paddingTop: 120, paddingBottom: 72, textAlign: "center", position: "relative", overflow: "hidden",
        backgroundColor: "var(--brand)",
        backgroundImage: "url(/images/starex/rack-clothes.webp)",
        backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", minHeight: 500,
      }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(184,50,79,0.62)" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 20 }}
          >
            <Sparkles size={12} /> Limited-Time Offer
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(2.75rem,6vw,4.5rem)", letterSpacing: "-0.025em", lineHeight: 1.05, color: "#ffffff", marginBottom: 16 }}
          >
            {DRY_CLEAN_COMBO.tagline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.125rem", lineHeight: 1.75, fontFamily: "Kodchasan, sans-serif", marginBottom: 32 }}
          >
            {DRY_CLEAN_COMBO.description} {DRY_CLEAN_COMBO.title} — dry cleaning that doesn&apos;t cost you a small fortune.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <a href="/book?service=dry-clean" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "15px 34px", textDecoration: "none", background: "#FFFFFF", color: "var(--brand)", fontFamily: "Poppins, sans-serif", fontWeight: 700, borderRadius: 120 }}>
              Book This Combo <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* What's included / excluded */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="eyebrow" style={{ color: "#8F2740" }}>How It Works</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3.5vw,2.5rem)", letterSpacing: "-0.022em", color: "#161616", marginBottom: 8 }}>
              Any {DRY_CLEAN_COMBO.itemCount} pieces, <em className="display-accent" style={{ display: "inline" }}>one flat price.</em>
            </h2>
            <p style={{ color: "#6B6B6B", fontFamily: "Kodchasan, sans-serif", maxWidth: "52ch", margin: "0 auto" }}>
              Mix and match any {DRY_CLEAN_COMBO.itemCount} regular garments or pieces — pay ${DRY_CLEAN_COMBO.priceCad} flat, {HST_LABEL}.
            </p>
          </AnimatedContent>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="offer-grid">
            <AnimatedContent>
              <div style={{ background: "#F2F2F2", borderRadius: 20, padding: "32px", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <CheckCircle size={20} color="#8F2740" />
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.05rem", color: "#161616" }}>What&apos;s included</h3>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {eligible.map(e => (
                    <li key={e} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <CheckCircle size={14} color="#8F2740" style={{ flexShrink: 0, marginTop: 3 }} />
                      <span style={{ color: "#4A4A4A", fontSize: "0.9rem", fontFamily: "Kodchasan, sans-serif" }}>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContent>

            <AnimatedContent delay={0.08}>
              <div style={{ background: "#F2F2F2", borderRadius: 20, padding: "32px", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <XCircle size={20} color="#8C8C8C" />
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.05rem", color: "#161616" }}>Not included</h3>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {excluded.map(e => (
                    <li key={e} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <XCircle size={14} color="#8C8C8C" style={{ flexShrink: 0, marginTop: 3 }} />
                      <span style={{ color: "#4A4A4A", fontSize: "0.9rem", fontFamily: "Kodchasan, sans-serif" }}>{e}</span>
                    </li>
                  ))}
                </ul>
                <p style={{ color: "#8C8C8C", fontSize: "0.8rem", marginTop: 18, fontFamily: "Kodchasan, sans-serif" }}>
                  Priced separately at standard dry-clean rates — see the <a href="/pricing" style={{ color: "#8F2740", textDecoration: "underline" }}>full price list</a>.
                </p>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Price callout */}
      <section style={{ padding: "0 0 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent>
            <div style={{ background: "var(--brand)", borderRadius: 28, padding: "48px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <span className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }}>{DRY_CLEAN_COMBO.title}</span>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(3rem,6vw,4.5rem)", color: "#ffffff", letterSpacing: "-0.03em", margin: "12px 0 8px", lineHeight: 1 }}>
                ${DRY_CLEAN_COMBO.priceCad}<span style={{ fontSize: "1.25rem", fontWeight: 400, color: "rgba(255,255,255,0.75)" }}> {HST_LABEL}</span>
              </p>
              <p style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Kodchasan, sans-serif", marginBottom: 28 }}>
                {DRY_CLEAN_COMBO.exclusions}
              </p>
              <a href="/book?service=dry-clean" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#FFFFFF", color: "var(--brand)", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9375rem", padding: "13px 28px", borderRadius: 120 }}>
                Book This Combo <ArrowRight size={14} />
              </a>
            </div>
          </AnimatedContent>
        </div>
      </section>

      <style>{`
        @media (max-width: 700px) {
          .offer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
