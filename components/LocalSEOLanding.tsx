"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MapPin } from "lucide-react";
import { PHONE, PHONE_HREF, HST_LABEL } from "@/lib/pricing";

const ease = [0.25, 0.4, 0.25, 1] as const;

function AnimatedContent({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay, ease }} style={style}>
      {children}
    </motion.div>
  );
}

export type LocalSEOProps = {
  city: string;
  serviceLabel: string;      // "Dry Cleaning" | "Laundry Service"
  heroImage: string;
  h1: string;
  intro: string;
  neighborhoods: string[];
  bookHref: string;
  priceHighlights: { label: string; price: string; desc: string }[];
  features: string[];
  faqs: { q: string; a: string }[];
};

export default function LocalSEOLanding(props: LocalSEOProps) {
  const { city, serviceLabel, heroImage, h1, intro, neighborhoods, bookHref, priceHighlights, features, faqs } = props;

  return (
    <div style={{ background: "#FFFFFF" }}>
      <section style={{
        paddingTop: 120, paddingBottom: 80, textAlign: "center", position: "relative", overflow: "hidden",
        backgroundColor: "var(--brand)",
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", minHeight: 500,
      }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(184,50,79,0.6)" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 20 }}
          >
            <MapPin size={12} /> {city}, Ontario
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(2.25rem,5vw,3.75rem)", letterSpacing: "-0.025em", lineHeight: 1.1, color: "#ffffff", marginBottom: 18 }}
          >
            {h1}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            style={{ color: "rgba(255,255,255,0.92)", fontSize: "1.0625rem", lineHeight: 1.75, fontFamily: "Kodchasan, sans-serif", marginBottom: 32, maxWidth: "58ch", marginLeft: "auto", marginRight: "auto" }}
          >
            {intro}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={bookHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "15px 32px", textDecoration: "none", background: "#FFFFFF", color: "var(--brand)", fontFamily: "Poppins, sans-serif", fontWeight: 700, borderRadius: 120 }}>
              Book a Pickup in {city} <ArrowRight size={16} />
            </a>
            <a href={PHONE_HREF} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "15px 28px", textDecoration: "none", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", fontFamily: "Poppins, sans-serif", fontWeight: 600, borderRadius: 120 }}>
              Call {PHONE}
            </a>
          </motion.div>
        </div>
      </section>

      {/* Price highlights */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="eyebrow" style={{ color: "#8F2740" }}>{serviceLabel} Pricing in {city}</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3.5vw,2.5rem)", letterSpacing: "-0.022em", color: "#161616" }}>
              Transparent, no surprises.
            </h2>
          </AnimatedContent>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${priceHighlights.length},1fr)`, gap: 20 }} className="local-price-grid">
            {priceHighlights.map((p, i) => (
              <AnimatedContent key={p.label} delay={i * 0.06}>
                <div style={{ background: "#F2F2F2", borderRadius: 20, padding: "28px", height: "100%" }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#8F2740", letterSpacing: "-0.02em", marginBottom: 6 }}>{p.price}</p>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#161616", marginBottom: 6 }}>{p.label}</p>
                  <p style={{ color: "#6B6B6B", fontSize: "0.825rem", lineHeight: 1.6, fontFamily: "Kodchasan, sans-serif" }}>{p.desc}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "#8C8C8C", fontSize: "0.8125rem", marginTop: 24, fontFamily: "Kodchasan, sans-serif" }}>
            Prices shown {HST_LABEL}. See the <a href="/pricing" style={{ color: "#8F2740", textDecoration: "underline" }}>full price list</a>.
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 0", background: "#F2F2F2" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="eyebrow" style={{ color: "#8F2740" }}>Why {city} Chooses StareX</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3.5vw,2.5rem)", letterSpacing: "-0.022em", color: "#161616" }}>
              Built for your neighbourhood.
            </h2>
          </AnimatedContent>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="local-features-grid">
            {features.map((f, i) => (
              <AnimatedContent key={f} delay={i * 0.05}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#ffffff", borderRadius: 16, padding: "18px 20px" }}>
                  <CheckCircle size={18} color="#8F2740" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: "#4A4A4A", fontSize: "0.9375rem", fontFamily: "Kodchasan, sans-serif", lineHeight: 1.6 }}>{f}</span>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Service area */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <AnimatedContent>
            <span className="eyebrow" style={{ color: "#8F2740" }}>Service Area</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2.25rem)", letterSpacing: "-0.022em", color: "#161616", marginBottom: 24 }}>
              Proudly serving all of {city}.
            </h2>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {neighborhoods.map(n => (
                <span key={n} style={{ background: "#F2F2F2", borderRadius: 999, padding: "8px 18px", fontFamily: "Kodchasan, sans-serif", fontWeight: 500, fontSize: "0.875rem", color: "#4A4A4A" }}>{n}</span>
              ))}
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "0 0 96px", background: "#F2F2F2" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: 36 }}>
            <span className="eyebrow" style={{ color: "#8F2740" }}>FAQ</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2rem)", letterSpacing: "-0.022em", color: "#161616" }}>
              {serviceLabel} in {city} — common questions.
            </h2>
          </AnimatedContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((f, i) => (
              <AnimatedContent key={f.q} delay={i * 0.05}>
                <div style={{ background: "#ffffff", borderRadius: 16, padding: "20px 24px" }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#161616", marginBottom: 6 }}>{f.q}</p>
                  <p style={{ color: "#6B6B6B", fontSize: "0.875rem", lineHeight: 1.65, fontFamily: "Kodchasan, sans-serif" }}>{f.a}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 0", textAlign: "center", background: "var(--brand)" }}>
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem,3.5vw,2.5rem)", color: "#ffffff", marginBottom: 16, letterSpacing: "-0.02em" }}>
              Ready for {serviceLabel.toLowerCase()} in {city}?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 32, fontSize: "1.0625rem", fontFamily: "Kodchasan, sans-serif" }}>
              Book your first pickup today. $40 minimum order value.
            </p>
            <a href={bookHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "15px 36px", textDecoration: "none", background: "#FFFFFF", color: "var(--brand)", fontFamily: "Poppins, sans-serif", fontWeight: 700, borderRadius: 120 }}>
              Schedule Free Pickup <ArrowRight size={16} />
            </a>
          </AnimatedContent>
        </div>
      </section>

      <style>{`
        @media (max-width: 700px) {
          .local-price-grid    { grid-template-columns: 1fr !important; }
          .local-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
