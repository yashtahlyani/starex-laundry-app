"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Leaf, Shield, Clock, Heart, ArrowRight } from "lucide-react";

const ease = [0.25, 0.4, 0.25, 1] as const;

function AnimatedContent({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay, ease }} style={style}>
      {children}
    </motion.div>
  );
}

const milestones = [
  { year: "2019", title: "Founded in a garage", desc: "Started with two laundry machines and a dream to make laundry day disappear for good." },
  { year: "2020", title: "First 500 customers",  desc: "Word of mouth grew us across Brampton. Quality over everything — always." },
  { year: "2022", title: "Expanded across Peel", desc: "Grew our pickup & delivery routes to cover Brampton and Mississauga end to end." },
  { year: "2024", title: "10,000+ customers served", desc: "Now serving Brampton & Mississauga — plus car & sofa detailing, our newest service." },
];

const values = [
  { Icon: Shield, title: "Radical transparency", desc: "Price confirmed before we touch your clothes. No surprises, ever.", color: "#F7E3E6" },
  { Icon: Leaf,   title: "Eco-first",            desc: "Biodegradable detergents, optimised wash loads, carbon-offset delivery.", color: "#F1EBDD" },
  { Icon: Clock,  title: "Obsessed with time",   desc: "We know your time is precious. 98% of deliveries arrive on schedule.", color: "#EFE8D8" },
  { Icon: Heart,  title: "Care in every fold",   desc: "Every garment is handled like it belongs to us — because for a few hours, it does.", color: "#E9E2D2" },
];

export default function About() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(timelineRef, { once: true, margin: "-80px" });

  return (
    <div style={{ background: "#FBF8F1" }}>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 72, background: "#241619", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, #431E2C 0%, #241619 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", position: "relative" }} className="about-hero">
          <div>
            <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>About StareX</motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease }}
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(2.5rem,5vw,4rem)", letterSpacing: "-0.022em", lineHeight: 1.1, color: "#ffffff", marginBottom: 20 }}
            >
              Built on{" "}
              <em className="display-accent" style={{ display: "inline" }}>trust.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
              style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.0625rem", lineHeight: 1.8, maxWidth: "48ch", fontFamily: "Kodchasan, sans-serif" }}
            >
              StareX started in 2019 with one belief: laundry should be invisible. You should never have to think about it. Five years later, we serve over 10,000 Canadians who&apos;ve reclaimed their weekends.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            style={{ background: "#3B2A2E", borderRadius: 20, padding: "48px", position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "rgba(203,62,94,0.08)", borderRadius: "50%", pointerEvents: "none" }} />
            <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "4rem", letterSpacing: "-0.03em", lineHeight: 1, color: "#CB3E5E", marginBottom: 8 }}>10,000+</p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", marginBottom: 32, fontFamily: "Kodchasan, sans-serif" }}>customers who stopped doing laundry</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[["4.9★", "avg rating"], ["98%", "on-time"], ["24hr", "turnaround"], ["2019", "founded"]].map(([n, l]) => (
                <div key={l}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.5rem", color: "#ffffff", letterSpacing: "-0.02em" }}>{n}</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif" }}>{l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "96px 0", background: "#FBF8F1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ marginBottom: 56 }}>
            <span className="eyebrow" style={{ color: "#431E2C" }}>Our Values</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.875rem,4vw,2.75rem)", letterSpacing: "-0.022em", color: "#241619" }}>
              What we stand <em className="display-accent" style={{ display: "inline" }}>for.</em>
            </h2>
          </AnimatedContent>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="values-grid">
            {values.map((v, i) => (
              <AnimatedContent key={v.title} delay={i * 0.08}>
                <div style={{ background: v.color, borderRadius: 20, padding: "28px", height: "100%" }}>
                  <div style={{ width: 40, height: 40, background: "rgba(0,0,0,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <v.Icon size={18} color="#241619" />
                  </div>
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#241619", marginBottom: 8, letterSpacing: "-0.01em" }}>{v.title}</h3>
                  <p style={{ color: "#4C403D", fontSize: "0.9rem", lineHeight: 1.7, fontFamily: "Kodchasan, sans-serif" }}>{v.desc}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: "80px 0", background: "#241619" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ marginBottom: 56 }}>
            <span className="eyebrow">Our Story</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.875rem,4vw,2.75rem)", letterSpacing: "-0.022em", color: "#ffffff" }}>
              Five years of <em className="display-accent" style={{ display: "inline" }}>growth.</em>
            </h2>
          </AnimatedContent>

          <div ref={timelineRef} style={{ position: "relative", paddingLeft: 40 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#3B2A2E" }}>
              <motion.div
                style={{ position: "absolute", top: 0, left: 0, right: 0, background: "linear-gradient(to bottom, #DA6178, #CB3E5E)" }}
                animate={{ height: inView ? "100%" : "0%" }}
                transition={{ duration: 1.5, ease }}
              />
            </div>
            {milestones.map((m, i) => (
              <AnimatedContent key={m.year} delay={i * 0.12} style={{ marginBottom: i < milestones.length - 1 ? 40 : 0 }}>
                <div style={{ position: "relative", paddingLeft: 24 }}>
                  <div style={{ position: "absolute", left: -46, top: 6, width: 12, height: 12, borderRadius: "50%", background: "#CB3E5E", border: "2px solid #241619" }} />
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#CB3E5E", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{m.year}</p>
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.125rem", color: "#ffffff", marginBottom: 6, letterSpacing: "-0.01em" }}>{m.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9375rem", lineHeight: 1.7, fontFamily: "Kodchasan, sans-serif" }}>{m.desc}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 0", background: "#FBF8F1", textAlign: "center" }}>
        <AnimatedContent style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3vw,2.5rem)", color: "#241619", marginBottom: 16, letterSpacing: "-0.022em" }}>
            Join our <em className="display-accent" style={{ display: "inline" }}>community.</em>
          </h2>
          <p style={{ color: "#6E5F5C", marginBottom: 32, fontSize: "1.0625rem", fontFamily: "Kodchasan, sans-serif" }}>Try StareX risk-free. First pickup on us.</p>
          <a href="/book" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "14px 32px" }}>
            Get Started Free <ArrowRight size={16} />
          </a>
        </AnimatedContent>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .about-hero { grid-template-columns: 1fr !important; }
          .values-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) { .values-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
