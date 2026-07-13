"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, CheckCircle, Shield, Leaf, Clock, X, XCircle } from "lucide-react";

const ease = [0.25, 0.4, 0.25, 1] as const;

const marqueeItems = [
  "★ 4.9 Rating", "Free Pickup & Delivery on 15 lbs+", "24–48h Turnaround", "$2.29 Per Pound",
  "Same-Day Service Available", "Dry Cleaning & Ironing", "Car & Sofa Detailing", "No Hidden Fees",
];

const cities = ["Brampton", "Mississauga"];

const comparisons = [
  { feature: "Getting There",     them: "Drive yourself",              us: "Free pickup on 15 lbs+" },
  { feature: "Time Required",     them: "1–2 hours waiting",           us: "60-second booking" },
  { feature: "Garment Sorting",   them: "You sort everything",         us: "We sort by colour & fabric" },
  { feature: "Cleaning Products", them: "Generic detergents",          us: "Premium, skin-safe products" },
  { feature: "Order Tracking",    them: "No updates — just wait",      us: "Real-time status updates" },
  { feature: "Pricing",           them: "Coin-by-coin, adds up",       us: "$2.29/lb or $100/mo flat" },
];

function Counter({ target, suffix = "", fixed = false }: { target: number; suffix?: string; fixed?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const start = Date.now();
    const raf = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const val = fixed ? parseFloat((target * e).toFixed(1)) : Math.floor(target * e);
      setCount(val);
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [inView, target, fixed]);
  return <span ref={ref}>{fixed ? count.toFixed(1) : count.toLocaleString()}{suffix}</span>;
}

function AnimatedContent({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

const stats = [
  { value: 10000, suffix: "+", label: "Happy Customers", desc: "Across Brampton & Mississauga" },
  { value: 4.9,   suffix: "",  label: "Average Rating",  desc: "★ Google & Yelp", fixed: true },
  { value: 98,    suffix: "%", label: "On-Time Delivery", desc: "Promised window kept" },
  { value: 24,    suffix: "hr", label: "Turnaround",     desc: "24–48h, door to door" },
];

const pasteColors = ["#EDEDED", "#F2F2F2", "#EAEAEA", "#E5E5E5", "#EDEDED", "#F2F2F2"];

const services = [
  { num: "01", title: "Wash & Fold",           desc: "Professional wash, dry and fold for everyday laundry. Sorted by colour, dried right, crisp.",        price: "$2.29/lb",        tags: ["Everyday", "Colour-sorted"] },
  { num: "02", title: "Dry Cleaning",          desc: "Expert care for suits, sarees, gowns and delicates — even leather jackets and wedding dresses.",       price: "From $6.99",      tags: ["Delicates", "Formalwear"] },
  { num: "03", title: "Same-Day Express",      desc: "Need it back today? Same-day service at a 50% surcharge, subject to availability.",                    price: "+50%",            tags: ["Same-day", "Rush"] },
  { num: "04", title: "Ironing & Press",       desc: "Crisp, boardroom-ready garments every single time. From baby clothes to complex pleated dresses.",     price: "From $1.99",      tags: ["Shirts", "Sarees"] },
  { num: "05", title: "Household & Bedding",   desc: "Duvets, blankets, curtains, rugs and more — fluffed, bagged and brought back fresh.",                  price: "From $9.99",      tags: ["Duvets", "Curtains"] },
  { num: "06", title: "Car & Sofa Detailing",  desc: "Interior detailing, deep clean and shampoo for vehicles and sofas. Final pricing upon inspection.",    price: "From $199",       tags: ["New", "Detailing"] },
];

const steps = [
  { label: "Step 1", title: "Schedule Pickup",  desc: "Book online in 60 seconds. Choose your date, time window and service type. We remember your preferences.", tags: ["60-Second Booking", "Any Day"] },
  { label: "Step 2", title: "We Collect",        desc: "Contactless pickup at your door — no need to be home. Sealed, labelled and logged the moment it leaves your hands.", tags: ["Contactless", "GPS Tracked"] },
  { label: "Step 3", title: "Fresh Delivery",    desc: "Clean, folded and returned within 24 hours — or ironed and hung. Ready to wear, zero stress.", tags: ["24hr Return", "Insured"] },
];

const testimonials = [
  { name: "Sarah M.",  role: "Brampton, ON",     text: "I switched from my local laundromat and honestly never going back. Quality is incredible for the price.",  stars: 5 },
  { name: "James K.",  role: "Mississauga, ON",  text: "Pickup at 8am, back by 6pm. Shirts perfectly pressed. This is the kind of service you tell everyone about.", stars: 5 },
  { name: "Priya R.",  role: "Brampton, ON",     text: "My sarees came back better than new. They are incredibly careful with every single piece.",                  stars: 5 },
  { name: "David L.",  role: "Mississauga, ON",  text: "We use StareX for our restaurant linens. Reliable, affordable, and always on time. Absolute lifesaver.",  stars: 5 },
];

const trust = [
  { Icon: Shield, title: "Fully Insured",  desc: "Every garment covered up to $500 against damage or loss." },
  { Icon: Leaf,   title: "Eco-Friendly",   desc: "Biodegradable detergents. Low-water wash cycles." },
  { Icon: Star,   title: "4.9★ Rated",     desc: "Consistently top-rated across Google and Yelp." },
  { Icon: Clock,  title: "Always On Time", desc: "98% of deliveries arrive within the promised window." },
];

export default function Home() {
  const [promoDismissed, setPromoDismissed] = useState(false);

  return (
    <div>

      {/* ══ HERO — flat white/cream editorial, red used as bold accent only ══ */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        position: "relative", overflow: "hidden", paddingTop: "80px",
        background: "#FFFFFF",
      }}>

        {/* Promo banner */}
        <AnimatePresence>
          {!promoDismissed && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2, duration: 0.4, ease }}
              style={{
                position: "absolute", top: 72, left: 0, right: 0, zIndex: 10,
                background: "var(--brand)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "10px 24px", gap: 16,
              }}
            >
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem", color: "#FFFFFF", margin: 0 }}>
                🍁 Book your first pickup today — free pickup &amp; delivery on 15 lbs+.
              </p>
              <a href="/book" style={{
                fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.8125rem",
                color: "var(--brand)", background: "#FFFFFF",
                padding: "4px 14px", borderRadius: 999, textDecoration: "none", whiteSpace: "nowrap",
              }}>
                Book free →
              </a>
              <button
                onClick={() => setPromoDismissed(true)}
                aria-label="Dismiss"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", padding: 4, marginLeft: 4 }}
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "90px 24px 60px", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="hero-grid">

          {/* Left — bold editorial copy */}
          <div>
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease }}
              style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div className="rule-mark" aria-hidden="true"><span /><span /><span /></div>
              <span style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#161616" }}>
                Canada&apos;s Premium Laundry Service
              </span>
            </motion.div>

            <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(2.75rem,5.5vw,4.75rem)", letterSpacing: "-0.03em", lineHeight: 1.02, color: "#161616", marginBottom: "28px" }}>
              {["Fresh laundry,", "delivered to"].map((line, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 + i * 0.1, ease }} style={{ display: "block" }}>
                  {line}
                </motion.span>
              ))}
              <motion.span initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.3, ease }}
                style={{ display: "block", color: "var(--brand)" }}>
                your door.
              </motion.span>
            </h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45, ease }}
              style={{ color: "#6B6B6B", fontSize: "1.0625rem", lineHeight: 1.75, maxWidth: "42ch", marginBottom: 40, fontFamily: "Kodchasan, sans-serif" }}>
              Schedule a pickup in 60 seconds. We wash, fold, and deliver — you relax.
              Just $2.29/lb with free pickup &amp; delivery over 15 lbs.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55, ease }}
              style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <a href="/book" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 34px" }}>
                Schedule Free Pickup <ArrowRight size={16} />
              </a>
              <a href="/how-it-works" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem",
                color: "#161616", padding: "13px 28px", borderRadius: 120,
                border: "1.5px solid rgba(20,20,20,0.16)", textDecoration: "none",
              }}>
                See How It Works
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.75, ease }}
              style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "48px" }}>
              <div style={{ display: "flex" }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    width: 30, height: 30, borderRadius: "50%", marginLeft: i === 0 ? 0 : -8,
                    background: ["#B8324F","#4A4A4A","#B5233F","#8C8C8C","#161616"][i],
                    border: "2px solid #FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 700, color: "#FFFFFF",
                    fontFamily: "Kodchasan, sans-serif",
                  }}>
                    {["SM","JK","PR","DL","AK"][i]}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="var(--brand)" color="var(--brand)" />)}
                </div>
                <p style={{ color: "#6B6B6B", fontSize: "0.8rem", marginTop: 2, fontFamily: "Kodchasan, sans-serif" }}>
                  Loved by <strong style={{ color: "#161616" }}>10,000+</strong> Canadians
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right — official StareX brand imagery, shown at its own aspect ratio so nothing gets cropped */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2, ease }}
            className="hero-panel"
            style={{
              position: "relative", borderRadius: 28, overflow: "hidden",
              aspectRatio: "1717 / 916", width: "100%",
              boxShadow: "0 24px 60px rgba(20,20,20,0.12)",
            }}
          >
            <img
              src="/images/starex-hero-banner.png"
              alt="StareX premium laundry service — fresh laundry, delivered to your door"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </motion.div>
        </div>
      </section>

      {/* ══ MARQUEE — flat brand red strip ══ */}
      <div style={{ background: "var(--brand)", padding: "14px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "marquee 28s linear infinite", whiteSpace: "nowrap", width: "max-content", willChange: "transform" }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", padding: "0 32px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {item}
              <span style={{ marginLeft: 32, color: "#FFFFFF" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS — flat brand red band ══ */}
      <section style={{ background: "var(--brand)", padding: "80px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }} className="stats-grid">
            {stats.map((s, i) => (
              <AnimatedContent key={s.label} delay={i * 0.08}>
                <motion.div
                  className="card-stat"
                  whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(2rem,3.5vw,2.8rem)", letterSpacing: "-0.02em", color: "#ffffff", lineHeight: 1, marginBottom: "8px" }}>
                    <Counter target={s.value} suffix={s.suffix} fixed={s.fixed} />
                  </p>
                  <p style={{ color: "#ffffff", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", marginBottom: "4px" }}>{s.label}</p>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Kodchasan, sans-serif", fontSize: "0.8125rem" }}>{s.desc}</p>
                </motion.div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CITY COVERAGE ══ */}
      <div style={{ background: "var(--brand-dark)", padding: "24px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", flexShrink: 0 }}>
              Service Area
            </span>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {cities.map((city, i) => (
                <motion.span
                  key={city}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease }}
                  style={{
                    fontFamily: "Kodchasan, sans-serif", fontSize: "0.8125rem", fontWeight: 500,
                    color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)", borderRadius: 999,
                    padding: "4px 14px", whiteSpace: "nowrap",
                  }}
                >
                  🍁 {city}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ HOW IT WORKS — light bg, vertical timeline ══ */}
      <section style={{ padding: "96px 0", background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ marginBottom: "72px" }}>
            <span className="eyebrow" style={{ color: "#431E2C" }}>How It Works</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.875rem,4vw,2.75rem)", letterSpacing: "-0.022em", color: "#161616", maxWidth: "18ch" }}>
              Three steps to{" "}
              <span className="display-accent" style={{ fontWeight: 600 }}>clean.</span>
            </h2>
          </AnimatedContent>

          <div style={{ position: "relative", paddingLeft: "48px" }}>
            <div style={{ position: "absolute", left: "9px", top: "16px", bottom: "16px", width: "2px", background: "rgba(20,20,20,0.1)", borderRadius: 2 }} />
            {steps.map((step, i) => (
              <AnimatedContent key={step.label} delay={i * 0.1}>
                <div style={{ position: "relative", marginBottom: i < steps.length - 1 ? "64px" : 0 }}>
                  <div style={{ position: "absolute", left: "-43px", top: "6px", width: 16, height: 16, borderRadius: "50%", background: "#B8324F", flexShrink: 0, boxShadow: "0 0 0 3px #FFFFFF, 0 0 0 5px rgba(184,50,79,0.22)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <span className="step-pill">{step.label}</span>
                  </div>
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.375rem", letterSpacing: "-0.015em", color: "#161616", marginBottom: "10px" }}>{step.title}</h3>
                  <p style={{ color: "#6B6B6B", fontSize: "1rem", lineHeight: 1.75, maxWidth: "55ch", marginBottom: "16px", fontFamily: "Kodchasan, sans-serif" }}>{step.desc}</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {step.tags.map(tag => <span key={tag} className="tag-outline-dark">{tag}</span>)}
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES — white, pastel cards ══ */}
      <section style={{ padding: "96px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ marginBottom: "56px" }}>
            <span className="eyebrow" style={{ color: "#431E2C" }}>What We Offer</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.875rem,4vw,2.75rem)", letterSpacing: "-0.022em", color: "#161616" }}>
              Services built for{" "}
              <span className="display-accent" style={{ fontWeight: 600 }}>your life.</span>
            </h2>
          </AnimatedContent>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }} className="services-grid">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: i * 0.06, ease }}
                whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(20,20,20,0.12)" }}
                style={{ background: pasteColors[i % pasteColors.length], borderRadius: "20px", padding: "32px 28px", height: "100%", display: "flex", flexDirection: "column", cursor: "default" }}
              >
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "2rem", letterSpacing: "-0.03em", color: "rgba(20,20,20,0.18)", lineHeight: 1, marginBottom: "28px" }}>{s.num}</p>
                <div style={{ height: "1px", background: "rgba(20,20,20,0.1)", marginBottom: "20px" }} />
                <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.125rem", letterSpacing: "-0.01em", color: "#161616", marginBottom: "10px" }}>{s.title}</h3>
                <p style={{ color: "rgba(20,20,20,0.65)", fontSize: "0.9rem", lineHeight: 1.7, fontFamily: "Kodchasan, sans-serif", flexGrow: 1, marginBottom: "20px" }}>{s.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#431E2C" }}>{s.price}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatedContent style={{ textAlign: "center", marginTop: "48px" }}>
            <a href="/services" className="btn-ghost">
              View all services <ArrowRight size={14} />
            </a>
          </AnimatedContent>
        </div>
      </section>

      {/* ══ WHY STAREX — comparison ══ */}
      <section style={{ padding: "96px 0", background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "80px", alignItems: "center" }} className="comparison-layout">

            {/* Left col */}
            <AnimatedContent>
              <span className="eyebrow" style={{ color: "#431E2C" }}>The Difference</span>
              <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.875rem,4vw,2.75rem)", letterSpacing: "-0.022em", color: "#161616", marginBottom: "16px" }}>
                Why StareX beats the{" "}
                <span className="display-accent" style={{ fontWeight: 600 }}>laundromat.</span>
              </h2>
              <p style={{ color: "#6B6B6B", fontSize: "1rem", lineHeight: 1.75, fontFamily: "Kodchasan, sans-serif", maxWidth: "38ch", marginBottom: "28px" }}>
                Skip the trip. Skip the wait. We handle everything, every time.
              </p>
              <a href="/book" className="btn-primary" style={{ display: "inline-flex" }}>
                Try it free <ArrowRight size={14} />
              </a>
            </AnimatedContent>

            {/* Right col — comparison table */}
            <AnimatedContent delay={0.15}>
              <div style={{ background: "#ffffff", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(20,20,20,0.06)" }}>
                {/* Header row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "16px 24px", background: "rgba(20,20,20,0.03)", borderBottom: "1px solid rgba(20,20,20,0.06)" }}>
                  <span />
                  <span style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(20,20,20,0.35)", textAlign: "center" }}>Traditional</span>
                  <span style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#B8324F", textAlign: "center" }}>StareX</span>
                </div>
                {comparisons.map((row, i) => (
                  <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "14px 24px", borderBottom: i < comparisons.length - 1 ? "1px solid rgba(20,20,20,0.06)" : "none", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: "0.8125rem", color: "#161616" }}>{row.feature}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                      <XCircle size={13} color="rgba(20,20,20,0.3)" strokeWidth={2} />
                      <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "rgba(20,20,20,0.45)", textAlign: "center" }}>{row.them}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                      <CheckCircle size={13} color="#B8324F" strokeWidth={2.5} />
                      <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#161616", fontWeight: 600, textAlign: "center" }}>{row.us}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedContent>

          </div>
        </div>
      </section>

      {/* ══ PRICING — cream ══ */}
      <section style={{ background: "#F2F2F2", padding: "96px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ textAlign: "center", marginBottom: "56px" }}>
            <span className="eyebrow" style={{ color: "#8F2740" }}>Simple Pricing</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.875rem,4vw,2.75rem)", letterSpacing: "-0.022em", color: "#161616", marginBottom: "12px" }}>
              Pricing that{" "}
              <span className="display-accent" style={{ fontWeight: 600 }}>works for you.</span>
            </h2>
            <p style={{ color: "#6B6B6B", fontSize: "1.0625rem", maxWidth: "50ch", margin: "0 auto", fontFamily: "Kodchasan, sans-serif" }}>
              Pay per pound, or save with the monthly plan. No hidden fees, ever.
            </p>
          </AnimatedContent>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", maxWidth: 820, margin: "0 auto" }} className="pricing-preview-grid">
            {[
              { name: "Pay-Per-Pound", price: "$2.29", period: "/lb", desc: "No commitment, pay as you go",       features: ["Free pickup & delivery on 15 lbs+", "24–48h turnaround", "Same-day service +50%"],                        popular: false },
              { name: "Monthly Plan",  price: "$100",  period: "/mo", desc: "Best value for regulars & business", features: ["2+1 pickups/month (up to 50 lbs)", "Free softener, hot wash & bleach", "Commercial discounts included"],  popular: true  },
            ].map((plan, i) => (
              <AnimatedContent key={plan.name} delay={i * 0.08}>
                <div style={{
                  background: "#ffffff",
                  border: plan.popular ? "none" : "1px solid rgba(20,20,20,0.08)",
                  borderRadius: "20px", padding: "32px",
                  transform: plan.popular ? "scale(1.03)" : "scale(1)",
                  position: "relative",
                  boxShadow: plan.popular ? "0 24px 64px rgba(0,0,0,0.14)" : "none",
                }}>
                  {plan.popular && (
                    <div style={{ position: "absolute", top: 20, right: 20, background: "var(--brand)", color: "#FFFFFF", fontSize: "0.7rem", fontWeight: 700, padding: "4px 12px", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Kodchasan, sans-serif" }}>
                      Popular
                    </div>
                  )}
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8C8C8C", marginBottom: "10px" }}>{plan.name}</p>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "2.75rem", letterSpacing: "-0.03em", color: "#161616", lineHeight: 1 }}>
                    {plan.price}<span style={{ fontSize: "1rem", fontWeight: 400 }}>{plan.period}</span>
                  </p>
                  <p style={{ color: "#6B6B6B", fontSize: "0.875rem", margin: "8px 0 24px", fontFamily: "Kodchasan, sans-serif" }}>{plan.desc}</p>
                  <ul style={{ listStyle: "none", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <CheckCircle size={15} color="#B8324F" strokeWidth={2.5} />
                        <span style={{ color: "#4A4A4A", fontSize: "0.9rem", fontFamily: "Kodchasan, sans-serif" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="/pricing" className={plan.popular ? "btn-primary" : undefined} style={plan.popular ? { display: "block", textAlign: "center", textDecoration: "none" } : {
                    display: "block", textAlign: "center", padding: "12px", borderRadius: "120px",
                    background: "transparent",
                    border: "1.5px solid rgba(20,20,20,0.16)",
                    color: "#161616",
                    fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.875rem",
                    textDecoration: "none", transition: "all 0.2s ease",
                  }}>
                    {plan.popular ? "Get the plan" : "Book a pickup"}
                  </a>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS — light ══ */}
      <section style={{ padding: "96px 0", background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <AnimatedContent style={{ marginBottom: "48px" }}>
            <span className="eyebrow" style={{ color: "#8F2740" }}>What People Say</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.875rem,4vw,2.75rem)", letterSpacing: "-0.022em", color: "#161616" }}>
              Thousands of happy{" "}
              <span className="display-accent" style={{ fontWeight: 600 }}>customers.</span>
            </h2>
          </AnimatedContent>

          {/* Featured testimonial */}
          <AnimatedContent style={{ marginBottom: "24px" }}>
            <div style={{ background: "var(--brand)", borderRadius: 20, padding: "40px 48px", position: "relative", overflow: "hidden" }}>
              <p aria-hidden="true" style={{ position: "absolute", top: -20, left: 20, fontSize: "12rem", lineHeight: 1, fontFamily: "Poppins, sans-serif", color: "rgba(255,255,255,0.08)", pointerEvents: "none", userSelect: "none" }}>&ldquo;</p>
              <div style={{ display: "flex", gap: 3, marginBottom: 16, position: "relative" }}>
                {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#FFFFFF" color="#FFFFFF" />)}
              </div>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: "clamp(1.1rem,2vw,1.375rem)", color: "#ffffff", lineHeight: 1.6, fontStyle: "italic", maxWidth: "72ch", marginBottom: 24, position: "relative" }}>
                &ldquo;Switched to StareX six months ago and it&apos;s become the one subscription I&apos;d never cancel. My clothes come back cleaner than they&apos;ve ever been — pressed, folded, and always on time.&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0 }}>
                  M
                </div>
                <div>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#ffffff" }}>Michael T.</p>
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)" }}>Mississauga, ON · Monthly plan member</p>
                </div>
              </div>
            </div>
          </AnimatedContent>

          {/* 2×2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px" }} className="testimonials-grid">
            {testimonials.map((t, i) => (
              <AnimatedContent key={t.name} delay={i * 0.06}>
                <div className="card" style={{ padding: "28px 32px", height: "100%" }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: "16px" }}>
                    {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} fill="#B8324F" color="#B8324F" />)}
                  </div>
                  <p style={{ color: "#4A4A4A", fontSize: "1rem", lineHeight: 1.75, marginBottom: "24px", fontFamily: "Kodchasan, sans-serif", fontStyle: "italic" }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div style={{ borderTop: "1px solid rgba(20,20,20,0.06)", paddingTop: "16px" }}>
                    <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#161616" }}>{t.name}</p>
                    <p style={{ color: "rgba(20,20,20,0.4)", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif" }}>{t.role}</p>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST BADGES — cream ══ */}
      <section style={{ background: "#FFFFFF", padding: "64px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "32px" }} className="trust-grid">
            {trust.map((t, i) => (
              <AnimatedContent key={t.title} delay={i * 0.07}>
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(184,50,79,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <t.Icon size={20} color="#B8324F" />
                  </div>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#161616", marginBottom: "8px" }}>{t.title}</p>
                  <p style={{ color: "#6B6B6B", fontSize: "0.875rem", lineHeight: 1.65, fontFamily: "Kodchasan, sans-serif" }}>{t.desc}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA — solid flat brand-red block, bold & graphic ══ */}
      <section style={{
        padding: "120px 0", position: "relative", overflow: "hidden",
        background: "var(--brand)",
      }}>
        <div aria-hidden="true" style={{ position: "absolute", bottom: "-30px", left: "50%", transform: "translateX(-50%)", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "160px", color: "rgba(255,255,255,0.08)", letterSpacing: "-8px", whiteSpace: "nowrap", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>
          StareX
        </div>
        <AnimatedContent style={{ maxWidth: 580, margin: "0 auto", textAlign: "center", padding: "0 24px", position: "relative" }}>
          <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", display: "block", marginBottom: 14 }}>
            Get Started Today
          </span>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(1.875rem,4vw,2.75rem)", letterSpacing: "-0.022em", color: "#ffffff", marginBottom: "16px" }}>
            Ready for fresh clothes?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.0625rem", marginBottom: "40px", fontFamily: "Kodchasan, sans-serif" }}>
            Book your first pickup today. Free pickup &amp; delivery on 15 lbs or more.
          </p>
          <a href="/book" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1rem",
            color: "var(--brand)", background: "#FFFFFF", padding: "15px 36px",
            borderRadius: 120, textDecoration: "none",
          }}>
            Schedule Free Pickup <ArrowRight size={16} />
          </a>
        </AnimatedContent>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid   { grid-template-columns: 1fr !important; }
          .hero-panel  { display: none !important; }
        }
        @media (max-width: 768px) {
          .stats-grid           { grid-template-columns: repeat(2,1fr) !important; }
          .services-grid        { grid-template-columns: 1fr !important; }
          .pricing-preview-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid    { grid-template-columns: 1fr !important; }
          .trust-grid           { grid-template-columns: repeat(2,1fr) !important; }
          .comparison-layout    { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .trust-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
