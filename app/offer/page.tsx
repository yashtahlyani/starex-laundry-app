"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, Sparkles, Shirt, Package, Zap, Home as HomeIcon } from "lucide-react";
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
  "Shirts, dresses & bottoms",
  "Sweaters, hoodies & silk blouses",
  "Coats, jackets & sarees",
  "1 blanket or quilt (can be one of your 5)",
];

const excluded = ["Wedding dresses", "Leather items"];

// Real example priced off StareX's own per-item dry-clean & household rates
// (lib/pricing.ts CATALOG) — an illustration of typical savings, not a
// guarantee for every combination of 5 items. Multi-piece garments (a 2-piece
// suit, etc.) count as separate pieces toward the 5, so this example sticks
// to 5 genuinely single pieces to keep the math unambiguous.
const exampleItems = [
  { name: "Shirt / T-Shirt",   price: 6.99,  Icon: Shirt },
  { name: "Dress Casual",      price: 22.99, Icon: Shirt },
  { name: "Coat / Jacket",     price: 22.99, Icon: Package },
  { name: "Sweater",           price: 12.99, Icon: Shirt },
  { name: "Queen Blanket",     price: 22.99, Icon: HomeIcon },
];
const exampleTotal = exampleItems.reduce((sum, i) => sum + i.price, 0);
const exampleSavings = exampleTotal - DRY_CLEAN_COMBO.priceCad;

const steps = [
  { n: "01", title: "Book the combo",       desc: "Choose Dry Cleaning at checkout — no separate combo code needed." },
  { n: "02", title: "We collect & itemize", desc: "Pick your 5 pieces (and your 1 blanket/quilt) at pickup." },
  { n: "03", title: "Cleaned & pressed",    desc: "Professional dry cleaning, ready in 24–48 hours." },
  { n: "04", title: "Delivered to your door", desc: "One flat $50, confirmed before we start." },
];

const faqs = [
  { q: "Does a 2-piece suit count as 1 item or 2?", a: "2. Multi-piece garments count per piece, not per set — a 2-piece suit uses 2 of your 5, a 3-piece suit uses 3." },
  { q: "Do all 5 items need to be dropped off at once?", a: "Yes — the combo applies to 5 items in the same pickup so we can confirm the flat rate upfront." },
  { q: "Can I mix garment types?", a: "Yes. Any 5 regular garments or pieces qualify, including 1 blanket or quilt." },
  { q: "What if I only have 3 or 4 items?", a: "Standard per-item dry-clean pricing applies below 5 items — see the full price list." },
  { q: "Is this on top of the $40 minimum order value?", a: "The combo price itself ($50) already clears the $40 minimum, so no extra minimum charge applies." },
];

export default function OfferPage() {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 640);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#FFFFFF" }}>

      {/* Hero */}
      <section style={{
        paddingTop: 120, paddingBottom: 88, textAlign: "center", position: "relative", overflow: "hidden",
        backgroundColor: "var(--brand)",
        backgroundImage: "url(/images/starex/rack-clothes.webp)",
        backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", minHeight: 560,
      }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(184,50,79,0.62)" }} />
        <div aria-hidden="true" style={{
          position: "absolute", bottom: "-40px", left: "50%", transform: "translateX(-50%)",
          fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(4rem,14vw,10rem)",
          color: "rgba(255,255,255,0.06)", letterSpacing: "-0.05em", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none",
        }}>
          5 FOR $50
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 20 }}
          >
            <Sparkles size={12} /> Limited-Time Offer
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(3rem,7vw,5.5rem)", letterSpacing: "-0.03em", lineHeight: 1, color: "#ffffff", marginBottom: 20 }}
          >
            {DRY_CLEAN_COMBO.tagline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: "rgba(255,255,255,0.92)", fontSize: "1.1875rem", lineHeight: 1.75, fontFamily: "Kodchasan, sans-serif", marginBottom: 8, maxWidth: "50ch", marginLeft: "auto", marginRight: "auto" }}
          >
            {DRY_CLEAN_COMBO.description}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.28 }}
            style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem", fontFamily: "Kodchasan, sans-serif", marginBottom: 36 }}
          >
            {DRY_CLEAN_COMBO.title} — dry cleaning that doesn&apos;t cost you a small fortune.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a href="/book?service=dry-clean" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "16px 36px", textDecoration: "none", background: "#FFFFFF", color: "var(--brand)", fontFamily: "Poppins, sans-serif", fontWeight: 700, borderRadius: 120, boxShadow: "0 12px 32px rgba(0,0,0,0.2)" }}>
              Book This Combo <ArrowRight size={16} />
            </a>
            <a href="#savings" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "16px 28px", textDecoration: "none", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", fontFamily: "Poppins, sans-serif", fontWeight: 600, borderRadius: 120 }}>
              See The Math
            </a>
          </motion.div>
        </div>
      </section>

      {/* Savings example — real numbers off the actual price list */}
      <section id="savings" style={{ padding: "88px 0", background: "#F2F2F2", scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="eyebrow" style={{ color: "#8F2740" }}>A Real Example</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3.5vw,2.5rem)", letterSpacing: "-0.022em", color: "#161616", marginBottom: 8 }}>
              Priced separately, this would cost{" "}
              <em className="display-accent" style={{ display: "inline" }}>${exampleTotal.toFixed(2)}.</em>
            </h2>
            <p style={{ color: "#6B6B6B", fontFamily: "Kodchasan, sans-serif", maxWidth: "56ch", margin: "0 auto" }}>
              Based on StareX&apos;s own per-item dry-clean rates — one illustration of what 5 typical pieces cost individually versus the flat combo price.
            </p>
          </AnimatedContent>

          <div style={{ background: "#ffffff", borderRadius: 24, padding: "36px", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
              {exampleItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 4px", borderBottom: i < exampleItems.length - 1 ? "1px solid rgba(20,20,20,0.06)" : "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(184,50,79,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.Icon size={15} color="#8F2740" />
                    </div>
                    <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.9375rem", color: "#161616", fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#6B6B6B" }}>${item.price.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 4px", borderTop: "2px solid #161616" }}>
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#161616" }}>Individually</span>
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "#161616", textDecoration: "line-through", textDecorationColor: "#DC2626", textDecorationThickness: 2 }}>
                ${exampleTotal.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 4px" }}>
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#8F2740" }}>With the {DRY_CLEAN_COMBO.tagline} combo</span>
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#8F2740" }}>${DRY_CLEAN_COMBO.priceCad}.00</span>
            </div>

            <div style={{ marginTop: 20, background: "linear-gradient(135deg,#C85770,#B8324F)", borderRadius: 14, padding: "16px 22px", textAlign: "center" }}>
              <p style={{ color: "#FFFFFF", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.0625rem" }}>
                You save ${exampleSavings.toFixed(2)} on this example
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's included / excluded */}
      <section style={{ padding: "88px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="eyebrow" style={{ color: "#8F2740" }}>The Fine Print — Kept Short</span>
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
                <p style={{ color: "#8C8C8C", fontSize: "0.8rem", marginTop: 18, fontFamily: "Kodchasan, sans-serif" }}>
                  {DRY_CLEAN_COMBO.multiPieceNote}
                </p>
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

      {/* How it works — 4 steps */}
      <section style={{ padding: "88px 0", background: "#F2F2F2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="eyebrow" style={{ color: "#8F2740" }}>How It Works</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3.5vw,2.5rem)", letterSpacing: "-0.022em", color: "#161616" }}>
              From pickup to <em className="display-accent" style={{ display: "inline" }}>pressed.</em>
            </h2>
          </AnimatedContent>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="offer-steps-grid">
            {steps.map((s, i) => (
              <AnimatedContent key={s.n} delay={i * 0.08}>
                <div style={{ background: "#ffffff", borderRadius: 18, padding: "26px 22px", height: "100%" }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "rgba(184,50,79,0.25)", letterSpacing: "-0.02em", marginBottom: 10 }}>{s.n}</p>
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#161616", marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ color: "#6B6B6B", fontSize: "0.825rem", lineHeight: 1.6, fontFamily: "Kodchasan, sans-serif" }}>{s.desc}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Price callout */}
      <section style={{ padding: "88px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent>
            <div style={{ background: "var(--brand)", borderRadius: 28, padding: "48px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <Sparkles size={28} color="rgba(255,255,255,0.35)" style={{ position: "absolute", top: 24, left: 28 }} />
              <Zap size={24} color="rgba(255,255,255,0.3)" style={{ position: "absolute", bottom: 28, right: 32 }} />
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

      {/* Mini FAQ */}
      <section style={{ padding: "0 0 100px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: 36 }}>
            <span className="eyebrow" style={{ color: "#8F2740" }}>Quick Questions</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2rem)", letterSpacing: "-0.022em", color: "#161616" }}>
              About the combo.
            </h2>
          </AnimatedContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((f, i) => (
              <AnimatedContent key={f.q} delay={i * 0.05}>
                <div style={{ background: "#F2F2F2", borderRadius: 16, padding: "20px 24px" }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#161616", marginBottom: 6 }}>{f.q}</p>
                  <p style={{ color: "#6B6B6B", fontSize: "0.875rem", lineHeight: 1.65, fontFamily: "Kodchasan, sans-serif" }}>{f.a}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
          <AnimatedContent style={{ textAlign: "center", marginTop: 28 }}>
            <p style={{ color: "#8C8C8C", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>
              More questions? <a href="/faq" style={{ color: "#8F2740", textDecoration: "underline" }}>Read the full FAQ</a> or <a href="/contact" style={{ color: "#8F2740", textDecoration: "underline" }}>contact us</a>.
            </p>
          </AnimatedContent>
        </div>
      </section>

      {/* Sticky mobile/desktop CTA bar */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 400,
              background: "#FFFFFF", borderTop: "1px solid rgba(20,20,20,0.1)",
              boxShadow: "0 -8px 30px rgba(0,0,0,0.08)",
              padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
            }}
          >
            <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9375rem", color: "#161616" }}>
              {DRY_CLEAN_COMBO.tagline} <span style={{ color: "#8C8C8C", fontWeight: 500 }}>— dry cleaning combo</span>
            </span>
            <a href="/book?service=dry-clean" className="btn-primary" style={{ padding: "10px 22px", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
              Book Now <ArrowRight size={14} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 700px) {
          .offer-grid { grid-template-columns: 1fr !important; }
          .offer-steps-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 420px) {
          .offer-steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
