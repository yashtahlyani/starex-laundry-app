"use client";

import { motion } from "framer-motion";
import { Shirt, Sparkles, Zap, Package, Home, Car, CheckCircle, ArrowRight, Star } from "lucide-react";
import { MEMBERSHIP, HST_LABEL, PICKUP_DELIVERY, DETAILING } from "@/lib/pricing";

const ease = [0.25, 0.4, 0.25, 1] as const;

function AnimatedContent({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay, ease }} style={style}>
      {children}
    </motion.div>
  );
}

const services = [
  { id: "wash-fold", Icon: Shirt,    num: "01", title: "Wash & Fold",           tagline: "Everyday laundry, done right.",     price: "$2/lb",         min: `$40 minimum order value (~${PICKUP_DELIVERY.minimumLbs} lbs)`, features: ["Sorted by colour and fabric", "Washed, dried and folded neatly", "24–48hr turnaround", "Serving Brampton & Mississauga"], featured: true, badge: "POPULAR" },
  { id: "express",   Icon: Zap,      num: "02", title: "Same-Day Express",      tagline: "Same-day. No excuses.",             price: "$3/lb",         min: "Wash & Fold only",           features: ["Back the same day", "Full wash, dry and fold", "Priority processing", "SMS tracking updates", "Book early to secure your slot"], featured: false },
  { id: "dry-clean", Icon: Sparkles, num: "03", title: "Dry Cleaning",          tagline: "Delicates deserve better.",         price: "From $6.99/item",  min: "$40 minimum order value",                                features: ["Suits, sarees, gowns and silks", "Leather jackets and winter coats", "Also covers household & bedding", "24–48hr turnaround", "Every price confirmed first"], featured: false },
  { id: "ironing",   Icon: Package,  num: "04", title: "Ironing & Press",       tagline: "Crisp. Sharp. Professional.",       price: "From $1.99/item",  min: "$40 minimum order value",                                features: ["Shirts, pants, jeans and skirts", "Complex dresses, saree and pleated", "Bedding and table cloths", "Steam-pressed to perfection", "24–48hr turnaround"], featured: false },
  { id: "household", Icon: Home,     num: "05", title: "Household & Bedding",   tagline: "Big loads, no problem.",            price: "From $9.99/item",  min: "$40 minimum order value",                                features: ["Duvets, comforters and quilts", "Blankets — single to king", "Curtains, sheer to lined", "Rugs, pillows and sleeping bags", "Fluffed, bagged and returned"], featured: false },
  { id: "detailing", Icon: Car,      num: "06", title: "Car & Sofa Detailing",  tagline: "Fabric care, beyond the bag.",      price: "From $199",        min: "$199 minimum order value",                 features: ["Full interior detailing & shampoo", `Sofa deep clean — $${DETAILING.sofaPerSeatCad}/seat`, "Stain and odour treatment", "Final pricing upon inspection", "By appointment"], featured: true, badge: "NEW" },
];

export default function ServicesPage() {
  return (
    <div style={{ background: "#FFFFFF" }}>

      {/* Hero — clean text-free photo as a true backdrop */}
      <section style={{
        paddingTop: 120, paddingBottom: 72, textAlign: "center", position: "relative", overflow: "hidden",
        backgroundColor: "var(--brand)",
        backgroundImage: "url(/images/starex/washer-plant.webp)",
        backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", minHeight: 540,
      }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(184,50,79,0.55)" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <motion.span className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            What We Offer
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(2.5rem,5vw,3.75rem)", letterSpacing: "-0.022em", lineHeight: 1.1, color: "#ffffff", marginBottom: 16 }}
          >
            Every fabric,{" "}
            <em style={{ fontStyle: "italic" }}>every need.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.0625rem", lineHeight: 1.75, fontFamily: "Kodchasan, sans-serif" }}
          >
            From everyday wash-and-fold to delicate dry cleaning — we handle it all with professional care.
          </motion.p>
        </div>
      </section>

      {/* Services grid */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} className="services-grid">
            {services.map((s, i) => (
              <AnimatedContent key={s.title} delay={i * 0.07}>
                <div style={{ background: "#FFFFFF", border: "1px solid rgba(184,50,79,0.14)", borderTop: "3px solid #B8324F", borderRadius: 20, padding: "32px", height: "100%", display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.04)" }}>
                  {s.featured && (
                    <span style={{ position: "absolute", top: 20, right: 20, background: "#B8324F", color: "#FFFFFF", fontSize: "0.65rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.08em", fontFamily: "Kodchasan, sans-serif" }}>
                      {s.badge}
                    </span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(184,50,79,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <s.Icon size={20} color="#8F2740" />
                    </div>
                    <span style={{ fontSize: "1.75rem", fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "rgba(9,9,11,0.1)", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.num}</span>
                  </div>
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.2rem", color: "#161616", marginBottom: 4, letterSpacing: "-0.01em" }}>{s.title}</h3>
                  <p style={{ color: "#6B6B6B", fontSize: "0.9rem", marginBottom: 16, fontStyle: "italic", fontFamily: "Kodchasan, sans-serif" }}>{s.tagline}</p>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.375rem", color: "#161616", letterSpacing: "-0.02em", marginBottom: s.min ? 2 : 16 }}>{s.price}</p>
                  {s.min && <p style={{ color: "#8C8C8C", fontSize: "0.8125rem", marginBottom: 16, fontFamily: "Kodchasan, sans-serif" }}>{s.min}</p>}
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, flex: 1 }}>
                    {s.features.map(f => (
                      <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <CheckCircle size={14} color="#8F2740" style={{ flexShrink: 0, marginTop: 3 }} />
                        <span style={{ color: "#4A4A4A", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={`/book?service=${s.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#8F2740", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", marginTop: "auto" }}>
                    Book this service <ArrowRight size={14} />
                  </a>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly Plan — its own dedicated journey, not the standard booking flow */}
      <section style={{ padding: "0 0 80px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent>
            <div style={{ background: "var(--brand)", borderRadius: 28, padding: "48px 40px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40, alignItems: "center" }} className="monthly-grid">
                <div>
                  <span className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }}>StareX Monthly Plan</span>
                  <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2.25rem)", letterSpacing: "-0.022em", color: "#ffffff", marginBottom: 12, marginTop: 8 }}>
                    Laundry on <em style={{ fontStyle: "italic" }}>autopilot.</em>
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.7, fontFamily: "Kodchasan, sans-serif", marginBottom: 24 }}>
                    One flat monthly rate, regular pickups, no per-order thinking. Additional laundry beyond your plan billed at ${MEMBERSHIP.overagePerLbCad}/lb.
                  </p>
                  <a href="/monthly" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#FFFFFF", color: "var(--brand)", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9375rem", padding: "13px 28px", borderRadius: 120 }}>
                    Get Started <ArrowRight size={14} />
                  </a>
                </div>
                <div>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2.5rem", color: "#ffffff", letterSpacing: "-0.025em", marginBottom: 16 }}>
                    ${MEMBERSHIP.monthlyPriceCad}<span style={{ fontSize: "1rem", fontWeight: 400, color: "rgba(255,255,255,0.7)" }}>/mo {HST_LABEL}</span>
                  </p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                    {MEMBERSHIP.perks.slice(0, 4).map(p => (
                      <li key={p} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <Star size={13} color="#ffffff" style={{ flexShrink: 0, marginTop: 3 }} />
                        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.85rem", fontFamily: "Kodchasan, sans-serif" }}>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* CTA strip */}
      <section style={{
        padding: "64px 0", textAlign: "center", position: "relative",
        background: "var(--brand)",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <AnimatedContent>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3vw,2.5rem)", color: "#ffffff", marginBottom: 16, letterSpacing: "-0.02em" }}>
              Not sure what you{" "}
              <em style={{ fontStyle: "italic" }}>need?</em>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 32, fontSize: "1.0625rem", fontFamily: "Kodchasan, sans-serif" }}>
              Book a pickup and we&apos;ll assess your items at collection. No commitment required.
              Commercial client? Ask about exclusive discounts on our monthly plan.
            </p>
            <a href="/book" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "14px 32px", textDecoration: "none", background: "#FFFFFF", color: "var(--brand)", fontFamily: "Poppins, sans-serif", fontWeight: 700, borderRadius: 120 }}>
              Book Free Pickup <ArrowRight size={16} />
            </a>
          </AnimatedContent>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2,1fr) !important; }
          .monthly-grid  { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
        @media (max-width: 560px) { .services-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
