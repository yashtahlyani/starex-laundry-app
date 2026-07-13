"use client";

import { motion } from "framer-motion";
import { Shirt, Sparkles, Zap, Package, Home, Car, CheckCircle, ArrowRight } from "lucide-react";

const ease = [0.25, 0.4, 0.25, 1] as const;
const pastelColors = ["#F7E9E8", "#F5F1EE", "#F0EAE1", "#ECE7E3", "#F7E9E8", "#F5F1EE"];

function AnimatedContent({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay, ease }} style={style}>
      {children}
    </motion.div>
  );
}

const services = [
  { Icon: Shirt,    num: "01", title: "Wash & Fold",           tagline: "Everyday laundry, done right.",     price: "$2.29/lb",         min: "Free pickup & delivery on 15 lbs+", features: ["Sorted by colour and fabric", "Washed, dried and folded neatly", "24–48hr turnaround", "Free pickup & delivery over 15 lbs", "Serving Brampton & Mississauga"], featured: true, badge: "POPULAR" },
  { Icon: Zap,      num: "02", title: "Same-Day Express",      tagline: "Same-day. No excuses.",             price: "+50%",             min: "Subject to availability",           features: ["Back the same day", "Full wash, dry and fold", "Priority processing", "SMS tracking updates", "Book early to secure your slot"], featured: false },
  { Icon: Sparkles, num: "03", title: "Dry Cleaning",          tagline: "Delicates deserve better.",         price: "From $6.99/item",  min: null,                                features: ["Suits, sarees, gowns and silks", "Leather jackets and winter coats", "Wedding dress specialists", "24–48hr turnaround", "Every price confirmed first"], featured: false },
  { Icon: Package,  num: "04", title: "Ironing & Press",       tagline: "Crisp. Sharp. Professional.",       price: "From $1.99/item",  min: null,                                features: ["Shirts, pants, jeans and skirts", "Complex dresses, saree and pleated", "Bedding and table cloths", "Steam-pressed to perfection", "24–48hr turnaround"], featured: false },
  { Icon: Home,     num: "05", title: "Household & Bedding",   tagline: "Big loads, no problem.",            price: "From $9.99/item",  min: null,                                features: ["Duvets, comforters and quilts", "Blankets — single to king", "Curtains, sheer to lined", "Rugs, pillows and sleeping bags", "Fluffed, bagged and returned"], featured: false },
  { Icon: Car,      num: "06", title: "Car & Sofa Detailing",  tagline: "Fabric care, beyond the bag.",      price: "From $199",        min: "Sofa $49 per seat",                 features: ["Full interior detailing & shampoo", "Sofa deep clean, per-seat pricing", "Stain and odour treatment", "Final pricing upon inspection", "By appointment"], featured: true, badge: "NEW" },
];

export default function ServicesPage() {
  return (
    <div style={{ background: "#FDFBFA" }}>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 72, textAlign: "center", background: "#1F1B1B", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, #4A1522 0%, #1F1B1B 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            What We Offer
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(2.5rem,5vw,3.75rem)", letterSpacing: "-0.022em", lineHeight: 1.1, color: "#ffffff", marginBottom: 16 }}
          >
            Every fabric,{" "}
            <em className="display-accent" style={{ display: "inline" }}>every need.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.0625rem", lineHeight: 1.75, fontFamily: "Kodchasan, sans-serif" }}
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
                <div style={{ background: pastelColors[i], borderRadius: 20, padding: "32px", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                  {s.featured && (
                    <span style={{ position: "absolute", top: 20, right: 20, background: "#A4243B", color: "#FFFFFF", fontSize: "0.65rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.08em", fontFamily: "Kodchasan, sans-serif" }}>
                      {s.badge}
                    </span>
                  )}
                  <div style={{ fontSize: "2.5rem", fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "rgba(9,9,11,0.1)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 12 }}>{s.num}</div>
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.2rem", color: "#1F1B1B", marginBottom: 4, letterSpacing: "-0.01em" }}>{s.title}</h3>
                  <p style={{ color: "#6B6360", fontSize: "0.9rem", marginBottom: 16, fontStyle: "italic", fontFamily: "Kodchasan, sans-serif" }}>{s.tagline}</p>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.375rem", color: "#1F1B1B", letterSpacing: "-0.02em", marginBottom: s.min ? 2 : 16 }}>{s.price}</p>
                  {s.min && <p style={{ color: "#857C78", fontSize: "0.8125rem", marginBottom: 16, fontFamily: "Kodchasan, sans-serif" }}>{s.min}</p>}
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, flex: 1 }}>
                    {s.features.map(f => (
                      <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <CheckCircle size={14} color="#7A1B2E" style={{ flexShrink: 0, marginTop: 3 }} />
                        <span style={{ color: "#4A4340", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="/book" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#4A1522", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", marginTop: "auto" }}>
                    Book this service <ArrowRight size={14} />
                  </a>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section style={{ background: "#1F1B1B", padding: "64px 0", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3vw,2.5rem)", color: "#ffffff", marginBottom: 16, letterSpacing: "-0.02em" }}>
              Not sure what you{" "}
              <em className="display-accent" style={{ display: "inline" }}>need?</em>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 32, fontSize: "1.0625rem", fontFamily: "Kodchasan, sans-serif" }}>
              Book a pickup and we&apos;ll assess your items at collection. No commitment required.
              Commercial client? Ask about exclusive discounts on our monthly plan.
            </p>
            <a href="/book" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "14px 32px", textDecoration: "none" }}>
              Book Free Pickup <ArrowRight size={16} />
            </a>
          </AnimatedContent>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .services-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
