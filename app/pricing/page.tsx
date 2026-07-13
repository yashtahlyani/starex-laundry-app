"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Shirt, Sparkles, Zap, Package, Home, Car, Sofa, Search } from "lucide-react";
import { CATALOG, MEMBERSHIP, DETAILING } from "@/lib/pricing";

const ease = [0.25, 0.4, 0.25, 1] as const;
const pastelColors = ["#F7E3E6", "#F1EBDD", "#EFE8D8", "#E9E2D2", "#F7E3E6", "#F1EBDD"];

function AnimatedContent({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay, ease }} style={style}>
      {children}
    </motion.div>
  );
}

const payAsYouGo = [
  { Icon: Shirt,    title: "Wash & Fold (Pay-Per-Pound)", price: "$2.29",      unit: "/lb",     min: "Free pickup & delivery on 15 lbs+", desc: "24–48h turnaround, washed, dried & folded" },
  { Icon: Zap,      title: "Same-Day Express",            price: "+50%",       unit: "",        min: "Subject to availability",           desc: "Back the same day when you need it fast" },
  { Icon: Sparkles, title: "Dry Cleaning / Premium",      price: "From $6.99", unit: "/item",   min: null,                                desc: "Suits, dresses, delicates & formalwear" },
  { Icon: Package,  title: "Ironing & Press",             price: "From $1.99", unit: "/item",   min: null,                                desc: "Shirts, pants, sarees & complex dresses" },
  { Icon: Home,     title: "Household Items",             price: "From $9.99", unit: "/item",   min: null,                                desc: "Duvets, blankets, curtains, rugs & more" },
  { Icon: Car,      title: "Car & Sofa Detailing",        price: "From $199",  unit: "",        min: "Sofa $49 per seat",                 desc: "Deep clean & shampoo — final price on inspection", badge: "New" },
];

const planPPP = {
  name: "Pay-Per-Pound",
  tagline: "No commitment, pay as you go",
  price: "$2.29",
  suffix: "/lb",
  features: [
    "Free pickup & delivery on 15 lbs or more",
    "24–48h turnaround service",
    "Serving Brampton & Mississauga",
    "Same-day service +50% (subject to availability)",
    "Wash preferences from $2.99",
  ],
};

const planMonthly = {
  name: "Monthly Plan",
  tagline: "Best value for regulars & businesses",
  price: `$${MEMBERSHIP.monthlyPriceCad}`,
  suffix: "/month",
  features: MEMBERSHIP.perks,
};

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState(CATALOG[0].id);
  const tab = CATALOG.find((t) => t.id === activeTab)!;

  return (
    <div style={{ background: "#FBF8F1" }}>

      {/* Hero — flat brand red, bold & confident */}
      <section style={{ paddingTop: 120, paddingBottom: 72, textAlign: "center", background: "var(--brand)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <motion.span className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            Simple Pricing
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(2.5rem,5vw,4rem)", letterSpacing: "-0.022em", lineHeight: 1.1, color: "#ffffff", marginBottom: 16 }}
          >
            Pay for what you{" "}
            <em style={{ fontStyle: "italic" }}>need.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.0625rem", lineHeight: 1.75, fontFamily: "Kodchasan, sans-serif" }}
          >
            No hidden fees, no surprises. Laundry at $2.29 per pound, or one flat monthly plan.
            Every price confirmed before we begin.
          </motion.p>
        </div>
      </section>

      {/* Full item price list — moved up, this is what people come here for */}
      <section style={{ padding: "80px 0", background: "#FBF8F1" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: 36 }}>
            <span className="eyebrow" style={{ color: "#A82F4B" }}>Item Pricing</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3.5vw,2.5rem)", letterSpacing: "-0.022em", color: "#241619", marginBottom: 8 }}>
              The full <em className="display-accent" style={{ display: "inline" }}>price list.</em>
            </h2>
            <p style={{ color: "#6E5F5C", fontFamily: "Kodchasan, sans-serif", maxWidth: "52ch", margin: "0 auto" }}>
              Prices marked with a <strong style={{ color: "#A82F4B" }}>+</strong> are starting prices — the final price depends on size, fabric and condition, and is always confirmed with you first.
            </p>
          </AnimatedContent>

          {/* Tabs */}
          <AnimatedContent>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
              {CATALOG.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: "9px 20px", borderRadius: 999, cursor: "pointer",
                    border: activeTab === t.id ? "1.5px solid #CB3E5E" : "1.5px solid rgba(36,22,26,0.12)",
                    background: activeTab === t.id ? "#CB3E5E" : "#ffffff",
                    color: activeTab === t.id ? "#ffffff" : "#4C403D",
                    fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.85rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </AnimatedContent>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease }}
            >
              <p style={{ textAlign: "center", color: "#8A7B77", fontSize: "0.9rem", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>{tab.blurb}</p>
              <div style={{ display: "grid", gridTemplateColumns: tab.sections.length > 1 ? "repeat(2,1fr)" : "minmax(0,560px)", gap: 20, justifyContent: "center" }} className="catalog-grid">
                {tab.sections.map((section) => (
                  <div key={section.title} style={{ background: "#ffffff", borderRadius: 20, padding: "26px 28px", border: "1px solid rgba(36,22,26,0.06)", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)" }}>
                    <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#A82F4B", marginBottom: 16 }}>
                      {section.title}
                    </h3>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" }}>
                      {section.items.map((item, i) => (
                        <li key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, padding: "10px 0", borderBottom: i < section.items.length - 1 ? "1px solid rgba(36,22,26,0.06)" : "none" }}>
                          <span style={{ color: "#4C403D", fontSize: "0.9rem", fontFamily: "Kodchasan, sans-serif" }}>{item.name}</span>
                          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#241619", whiteSpace: "nowrap" }}>
                            ${item.price.toFixed(2)}{item.from && <span style={{ color: "#A82F4B" }}> +</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Choose your plan */}
      <section style={{ padding: "80px 0", background: "#F1EBDD" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="eyebrow" style={{ color: "#A82F4B" }}>Choose Your Plan</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3.5vw,2.5rem)", letterSpacing: "-0.022em", color: "#241619", marginBottom: 16 }}>
              Two ways to <em className="display-accent" style={{ display: "inline" }}>StareX.</em>
            </h2>
            <p style={{ color: "#6E5F5C", fontFamily: "Kodchasan, sans-serif" }}>
              Pay by the pound whenever you need us, or lock in the monthly plan and never think about laundry again.
            </p>
          </AnimatedContent>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }} className="plans-grid">
            {/* Pay-Per-Pound */}
            <AnimatedContent>
              <div style={{ background: "#ffffff", border: "1px solid rgba(36,22,26,0.08)", borderRadius: 20, padding: "36px", height: "100%", display: "flex", flexDirection: "column" }}>
                <p style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A7B77", marginBottom: 4 }}>{planPPP.name}</p>
                <p style={{ color: "#6E5F5C", fontSize: "0.875rem", marginBottom: 16, fontFamily: "Kodchasan, sans-serif" }}>{planPPP.tagline}</p>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "3rem", letterSpacing: "-0.025em", color: "#241619", lineHeight: 1, marginBottom: 24 }}>
                  {planPPP.price}
                  <span style={{ fontSize: "1rem", fontWeight: 400, color: "#8A7B77", fontFamily: "Kodchasan, sans-serif" }}>{planPPP.suffix}</span>
                </p>
                <ul style={{ listStyle: "none", marginBottom: 28, display: "flex", flexDirection: "column", gap: 10, flexGrow: 1 }}>
                  {planPPP.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <CheckCircle size={15} color="#CB3E5E" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: "#4C403D", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="/book" style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 120, background: "transparent", border: "1.5px solid rgba(36,22,26,0.16)", color: "#241619", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
                  Book a pickup
                </a>
              </div>
            </AnimatedContent>

            {/* Monthly Plan */}
            <AnimatedContent delay={0.08}>
              <div style={{ background: "#ffffff", borderRadius: 20, padding: "36px", position: "relative", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", background: "var(--brand)", color: "#ffffff", fontSize: "0.65rem", fontWeight: 700, padding: "6px 16px", borderRadius: "0 0 10px 10px", letterSpacing: "0.08em", whiteSpace: "nowrap", fontFamily: "Kodchasan, sans-serif" }}>
                  BEST VALUE
                </div>
                <p style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A7B77", marginBottom: 4, marginTop: 12 }}>{planMonthly.name}</p>
                <p style={{ color: "#6E5F5C", fontSize: "0.875rem", marginBottom: 16, fontFamily: "Kodchasan, sans-serif" }}>{planMonthly.tagline}</p>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "3rem", letterSpacing: "-0.025em", color: "#241619", lineHeight: 1, marginBottom: 24 }}>
                  {planMonthly.price}
                  <span style={{ fontSize: "1rem", fontWeight: 400, color: "#6E5F5C", fontFamily: "Kodchasan, sans-serif" }}>{planMonthly.suffix}</span>
                </p>
                <ul style={{ listStyle: "none", marginBottom: 28, display: "flex", flexDirection: "column", gap: 10, flexGrow: 1 }}>
                  {planMonthly.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <CheckCircle size={15} color="#CB3E5E" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: "#4C403D", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="/book" className="btn-primary" style={{ textAlign: "center", textDecoration: "none" }}>
                  Get started
                </a>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Pay-as-you-go quick reference — services detailed on /services, kept brief here */}
      <section style={{ padding: "80px 0", background: "#FBF8F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ marginBottom: 40 }}>
            <span className="eyebrow" style={{ color: "#A82F4B" }}>At A Glance</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3.5vw,2.5rem)", letterSpacing: "-0.022em", color: "#241619", marginBottom: 8 }}>
              Every service, <em className="display-accent" style={{ display: "inline" }}>one glance.</em>
            </h2>
            <p style={{ color: "#6E5F5C", maxWidth: "50ch", fontFamily: "Kodchasan, sans-serif" }}>
              See the full breakdown on the <a href="/services" style={{ color: "#A82F4B", textDecoration: "underline" }}>Services</a> page.
            </p>
          </AnimatedContent>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="paygo-grid">
            {payAsYouGo.map((s, i) => (
              <AnimatedContent key={s.title} delay={i * 0.06}>
                <div style={{ background: pastelColors[i], borderRadius: 20, padding: "28px", position: "relative", height: "100%" }}>
                  {s.badge && (
                    <span style={{ position: "absolute", top: 20, right: 20, background: "#CB3E5E", color: "#ffffff", fontSize: "0.65rem", fontWeight: 700, padding: "3px 9px", borderRadius: 999, fontFamily: "Kodchasan, sans-serif" }}>
                      {s.badge}
                    </span>
                  )}
                  <div style={{ width: 40, height: 40, background: "rgba(0,0,0,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <s.Icon size={18} color="#241619" />
                  </div>
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#241619", marginBottom: 8, letterSpacing: "-0.01em" }}>{s.title}</h3>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: s.price.startsWith("From") ? "1.375rem" : "1.75rem", letterSpacing: "-0.02em", color: "#241619", lineHeight: 1 }}>
                    {s.price}<span style={{ fontSize: "0.875rem", fontWeight: 400, color: "#6E5F5C", fontFamily: "Kodchasan, sans-serif" }}>{s.unit}</span>
                  </p>
                  {s.min && <p style={{ color: "#8A7B77", fontSize: "0.8125rem", marginTop: 4, fontFamily: "Kodchasan, sans-serif" }}>{s.min}</p>}
                  <p style={{ color: "#4C403D", fontSize: "0.875rem", marginTop: 8, lineHeight: 1.6, fontFamily: "Kodchasan, sans-serif" }}>{s.desc}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>

          <AnimatedContent>
            <p style={{ color: "#8A7B77", fontSize: "0.875rem", marginTop: 24, textAlign: "center", fontFamily: "Kodchasan, sans-serif" }}>
              Free pickup and delivery on orders of 15 lbs or more. We weigh at pickup and confirm your price before washing.
            </p>
          </AnimatedContent>
        </div>
      </section>

      {/* Detailing highlight — flat brand-red panel, deliberate accent moment */}
      <section style={{ padding: "0 0 80px", background: "#FBF8F1" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent>
            <div style={{ background: "var(--brand)", borderRadius: 24, padding: "48px 40px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "center" }} className="detailing-grid">
                <div>
                  <span className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }}>New Service</span>
                  <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2.25rem)", letterSpacing: "-0.022em", color: "#ffffff", marginBottom: 12 }}>
                    Car & sofa <em style={{ fontStyle: "italic" }}>detailing.</em>
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.7, fontFamily: "Kodchasan, sans-serif", marginBottom: 24 }}>
                    Interior detailing, dry cleaning and shampoo for your vehicle and upholstery —
                    the same fabric care expertise, beyond the laundry bag. {DETAILING.note}.
                  </p>
                  <a href="/book" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#FFFFFF", color: "var(--brand)", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9375rem", padding: "13px 28px", borderRadius: 120 }}>
                    Request an inspection <ArrowRight size={14} />
                  </a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Car size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <p style={{ color: "#ffffff", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>Car detailing / shampoo</p>
                      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontFamily: "Kodchasan, sans-serif" }}>From ${DETAILING.carFromCad} per vehicle</p>
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Sofa size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <p style={{ color: "#ffffff", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>Sofa deep clean / shampoo</p>
                      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontFamily: "Kodchasan, sans-serif" }}>${DETAILING.sofaPerSeatCad} per seat</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4 }}>
                    <Search size={13} color="rgba(255,255,255,0.7)" />
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontFamily: "Kodchasan, sans-serif" }}>{DETAILING.note}</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 0 80px", background: "#FBF8F1", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2.25rem)", color: "#241619", marginBottom: 12, letterSpacing: "-0.022em" }}>
              Still have <em className="display-accent" style={{ display: "inline" }}>questions?</em>
            </h2>
            <p style={{ color: "#6E5F5C", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>All prices confirmed before we start. No surprises, no bills that shock you.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/faq" className="btn-ghost" style={{ textDecoration: "none", color: "#4C403D", borderColor: "rgba(36,22,26,0.2)" }}>Read FAQ</a>
              <a href="/book" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                Book Your First Pickup <ArrowRight size={14} />
              </a>
            </div>
          </AnimatedContent>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .paygo-grid { grid-template-columns: repeat(2,1fr) !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .catalog-grid { grid-template-columns: 1fr !important; }
          .detailing-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) { .paygo-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
