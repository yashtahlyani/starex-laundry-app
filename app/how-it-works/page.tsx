"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Smartphone, Truck, Shirt, CheckCircle, ArrowRight } from "lucide-react";

const ease = [0.25, 0.4, 0.25, 1] as const;

function AnimatedContent({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay, ease }} style={style}>
      {children}
    </motion.div>
  );
}

const steps = [
  {
    Icon: Smartphone,
    num: "01",
    title: "Book in 2 minutes",
    desc: "Schedule a pickup from our website or app. Choose your time window, enter your address, and confirm your order. It takes under 2 minutes.",
    color: "#F7E9E8",
    accent: "#0ea5e9",
    details: ["Select wash preferences", "Add special care instructions", "Pick a convenient time slot"],
  },
  {
    Icon: Truck,
    num: "02",
    title: "We pick up",
    desc: "Our driver arrives at your chosen window, scans your bag, and takes it to our facility. No waiting around — leave it at your door.",
    color: "#F5F1EE",
    accent: "#16a34a",
    details: ["Real-time driver tracking", "Contactless pickup option", "Unique bag barcode tracking"],
  },
  {
    Icon: Shirt,
    num: "03",
    title: "Expert care",
    desc: "Our team sorts, washes, dries, and folds your laundry with professional-grade equipment and eco-friendly detergents.",
    color: "#F0EAE1",
    accent: "#f59e0b",
    details: ["Sorted by colour & fabric", "Biodegradable detergents", "Folded to your preference"],
  },
  {
    Icon: CheckCircle,
    num: "04",
    title: "Delivered back",
    desc: "Your laundry is returned clean, fresh, and neatly folded — within 24–48 hours. Just put it away.",
    color: "#ECE7E3",
    accent: "#8b5cf6",
    details: ["24–48h standard turnaround", "Real-time delivery updates", "Contactless drop-off"],
  },
];

const miniFaqs = [
  { q: "What if I have delicate items?", a: "Add a care note at checkout. Our team reads every instruction and treats delicates with extra attention." },
  { q: "Can I track my order?", a: "Yes — you get real-time SMS and email updates at every stage. Check your dashboard anytime." },
  { q: "What if I&apos;m not home for delivery?", a: "No problem. We&apos;ll leave your laundry safely at your door, or reattempt the next available window." },
];

export default function HowItWorks() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start center", "end center"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div style={{ background: "#FDFBFA" }}>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 80, background: "#1F1B1B", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 0%, #3F252C 0%, #1F1B1B 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative" }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>How It Works</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(2.5rem,5vw,3.75rem)", letterSpacing: "-0.022em", lineHeight: 1.1, color: "#ffffff", marginBottom: 20 }}
          >
            Laundry made <em className="display-accent" style={{ display: "inline" }}>effortless.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.0625rem", lineHeight: 1.8, fontFamily: "Kodchasan, sans-serif" }}
          >
            Four simple steps and you&apos;re done. No trips to the laundromat, no sorting, no folding. Just clean clothes at your door.
          </motion.p>
        </div>
      </section>

      {/* Steps timeline */}
      <section style={{ padding: "96px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <div ref={timelineRef} style={{ position: "relative" }}>
            {/* vertical line */}
            <div style={{ position: "absolute", left: 32, top: 0, bottom: 0, width: 2, background: "#E5E7EB" }} className="timeline-line">
              <motion.div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "linear-gradient(to bottom, #DE6E7A, #CE4257)", height: lineHeight }} />
            </div>

            {steps.map((step, i) => (
              <AnimatedContent key={step.num} delay={i * 0.1} style={{ marginBottom: i < steps.length - 1 ? 56 : 0, display: "flex", gap: 40, alignItems: "flex-start", paddingLeft: 80, position: "relative" }}>
                {/* dot */}
                <div style={{ position: "absolute", left: 22, top: 20, width: 22, height: 22, borderRadius: "50%", background: step.color, border: `3px solid ${step.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: step.accent }} />
                </div>

                <div style={{ flex: 1, background: "#ffffff", borderRadius: 20, padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: step.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <step.Icon size={22} color={step.accent} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 700, fontSize: "0.75rem", color: step.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Step {step.num}</p>
                      <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1F1B1B", letterSpacing: "-0.015em" }}>{step.title}</h3>
                    </div>
                  </div>
                  <p style={{ color: "#6B6360", fontSize: "0.9375rem", lineHeight: 1.75, marginBottom: 20, fontFamily: "Kodchasan, sans-serif" }}>{step.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {step.details.map(d => (
                      <li key={d} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Kodchasan, sans-serif", fontSize: "0.9rem", color: "#4A4340" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.accent, flexShrink: 0 }} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Mini FAQ */}
      <section style={{ padding: "80px 0", background: "#1F1B1B" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ marginBottom: 40, textAlign: "center" }}>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,4vw,2.5rem)", color: "#ffffff", letterSpacing: "-0.022em" }}>
              Common <em className="display-accent" style={{ display: "inline" }}>questions.</em>
            </h2>
          </AnimatedContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {miniFaqs.map((f, i) => (
              <AnimatedContent key={i} delay={i * 0.08}>
                <div style={{ background: "#1a2530", borderRadius: 14, padding: "24px 28px" }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#ffffff", marginBottom: 10, letterSpacing: "-0.01em" }}>{f.q}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", lineHeight: 1.7, fontFamily: "Kodchasan, sans-serif" }} dangerouslySetInnerHTML={{ __html: f.a }} />
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 0", textAlign: "center" }}>
        <AnimatedContent style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,3vw,2.5rem)", color: "#1F1B1B", marginBottom: 16, letterSpacing: "-0.022em" }}>
            Ready to <em className="display-accent" style={{ display: "inline" }}>start?</em>
          </h2>
          <p style={{ color: "#6B6360", marginBottom: 32, fontSize: "1.0625rem", fontFamily: "Kodchasan, sans-serif" }}>First pickup is on us. No credit card required.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/book" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", fontSize: "1rem" }}>
              Book First Pickup <ArrowRight size={16} />
            </a>
            <a href="/faq" className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", fontSize: "1rem" }}>
              See FAQ
            </a>
          </div>
        </AnimatedContent>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .timeline-line { left: 16px !important; }
        }
      `}</style>
    </div>
  );
}
