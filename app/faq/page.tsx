"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, ArrowRight } from "lucide-react";

const ease = [0.25, 0.4, 0.25, 1] as const;

const categories = [
  {
    name: "Getting Started",
    faqs: [
      { q: "How does StareX work?", a: "Schedule a pickup online, leave your laundry bag at your door, and we'll return it clean, fresh, and folded — within 24–48 hours." },
      { q: "What areas do you serve?", a: "We currently serve Brampton and Mississauga, Ontario. Not sure if you're in our zone? Call or text us at 437-607-7251." },
      { q: "Do I need to be home for pickup?", a: "No! Just leave your bag at your door. Our driver will pick it up safely." },
      { q: "How do I schedule a pickup?", a: "Book online in under 2 minutes. Choose a time window, add your address, and we'll handle the rest." },
      { q: "What if I need same-day service?", a: "Same-day service is available at a 50% surcharge, subject to availability. Book early in the day to secure your slot." },
    ],
  },
  {
    name: "Pricing & Plans",
    faqs: [
      { q: "How much does StareX cost?", a: "Wash & Fold is $2.29/lb with free pickup & delivery on orders of 15 lbs or more. Dry cleaning, ironing, and household items are priced per item — see our full price list on the Pricing page. No hidden fees — ever." },
      { q: "Is there a minimum order?", a: "No strict minimum — but pickup & delivery is free on orders of 15 lbs or more." },
      { q: "Do you offer subscription plans?", a: "Yes! The StareX Monthly Plan is $100/month: 2+1 pickups per month (up to 50 lbs), free fabric softener, hot wash & bleach, and exclusive discounts for commercial clients." },
      { q: "Are there any hidden fees?", a: "Never. Your price is confirmed before we touch your laundry. What you see is what you pay." },
      { q: "How does car & sofa detailing pricing work?", a: "Car detailing/shampoo starts from $199 per vehicle and sofa deep cleaning is $49 per seat. Final pricing is confirmed upon inspection." },
    ],
  },
  {
    name: "Laundry Care",
    faqs: [
      { q: "Do you use eco-friendly detergents?", a: "Yes, all our detergents are biodegradable, hypoallergenic, and Canadian-certified. We also offer fragrance-free on request." },
      { q: "What if I have special washing instructions?", a: "Add notes during checkout. Our staff read every instruction and follow them to the letter." },
      { q: "Can I request a specific detergent or fabric softener?", a: "Yes, you can add a custom detergent request in your order notes. We'll do our best to accommodate." },
      { q: "Do you separate lights and darks?", a: "Always. Every load is sorted by colour and fabric type before washing." },
      { q: "What happens if my item is damaged?", a: "We carry full coverage insurance. If we damage anything, we'll replace or reimburse it at full value — no questions asked." },
    ],
  },
  {
    name: "Pickup & Delivery",
    faqs: [
      { q: "What are your pickup windows?", a: "We offer morning (7–10 AM), afternoon (12–3 PM), and evening (5–8 PM) windows, 7 days a week." },
      { q: "How do I track my order?", a: "You'll receive real-time SMS and email updates at every stage — pickup, processing, and delivery." },
      { q: "What if I miss my delivery?", a: "We'll reattempt delivery the next available time slot at no extra charge." },
      { q: "Can I change my delivery address?", a: "Yes, contact us at least 2 hours before your scheduled delivery and we'll update your address." },
      { q: "Is there a delivery fee?", a: "Pickup and delivery are free on orders of 15 lbs or more. For smaller orders, we'll confirm any fee with you before pickup." },
    ],
  },
  {
    name: "Safety & Trust",
    faqs: [
      { q: "How do I know my clothes are safe?", a: "Every bag is tagged and tracked with a unique barcode from pickup to delivery. Your items never mix with another customer's." },
      { q: "Are your drivers background-checked?", a: "Yes, every driver goes through a thorough background check and is fully insured before their first pickup." },
      { q: "What is your privacy policy?", a: "We never share your personal data with third parties. Your address and order history are strictly confidential." },
      { q: "How do I cancel my subscription?", a: "Cancel anytime from your dashboard — no penalties, no questions. We'll process any outstanding orders first." },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #E5E7EB", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}
      >
        <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: "1rem", color: "#161616", letterSpacing: "-0.01em" }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={18} color="#6B6B6B" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <p style={{ paddingBottom: 20, color: "#6B6B6B", fontSize: "0.9375rem", lineHeight: 1.75, fontFamily: "Kodchasan, sans-serif" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(categories[0].name);

  const filtered = search.trim()
    ? categories.flatMap(c => c.faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())))
    : (categories.find(c => c.name === activeCategory)?.faqs ?? []);

  return (
    <div style={{ background: "#FFFFFF" }}>

      {/* Hero */}
      <section style={{
        paddingTop: 120, paddingBottom: 72, position: "relative", overflow: "hidden",
        backgroundColor: "var(--brand)",
        backgroundImage: "url(/images/starex/towels-vase.webp)",
        backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", minHeight: 540,
      }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(184,50,79,0.55)" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative" }}>
          <motion.span className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>FAQ</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(2.5rem,5vw,3.75rem)", letterSpacing: "-0.022em", lineHeight: 1.1, color: "#ffffff", marginBottom: 20 }}
          >
            Got <em style={{ fontStyle: "italic" }}>questions?</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.0625rem", marginBottom: 32, fontFamily: "Kodchasan, sans-serif" }}
          >
            Everything you need to know about StareX. Can&apos;t find an answer? We&apos;re just a message away.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ position: "relative", maxWidth: 480, margin: "0 auto" }}
          >
            <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
            <input
              type="text"
              placeholder="Search questions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "14px 14px 14px 48px", borderRadius: 12,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#ffffff", fontSize: "0.9375rem", fontFamily: "Kodchasan, sans-serif",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "80px 0 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 48 }} className="faq-layout">
          {!search && (
            <nav>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Categories</p>
              {categories.map(c => (
                <button
                  key={c.name}
                  onClick={() => setActiveCategory(c.name)}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 10,
                    background: activeCategory === c.name ? "rgba(184,50,79,0.1)" : "none",
                    border: "none", cursor: "pointer", marginBottom: 4,
                    color: activeCategory === c.name ? "#8F2740" : "#6B6B6B",
                    fontFamily: "Poppins, sans-serif", fontWeight: activeCategory === c.name ? 600 : 400,
                    fontSize: "0.9rem",
                  }}
                >
                  {c.name}
                  <span style={{ float: "right", fontSize: "0.75rem", color: "#9CA3AF" }}>
                    {c.faqs.length}
                  </span>
                </button>
              ))}
            </nav>
          )}

          <div style={search ? { gridColumn: "1 / -1" } : {}}>
            {search && (
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.9rem", color: "#6B6B6B", marginBottom: 24 }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{search}&quot;
              </p>
            )}
            <div style={{ background: "#ffffff", borderRadius: 20, padding: "8px 32px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "48px 0", textAlign: "center" }}>
                  <p style={{ color: "#6B6B6B", fontFamily: "Kodchasan, sans-serif" }}>No results found. Try a different search term.</p>
                  <a href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, color: "#8F2740", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
                    Contact us <ArrowRight size={14} />
                  </a>
                </div>
              ) : (
                filtered.map((f, i) => <AccordionItem key={i} q={f.q} a={f.a} />)
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Still need help */}
      <section style={{ padding: "64px 0 96px", textAlign: "center" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2rem)", color: "#161616", marginBottom: 12, letterSpacing: "-0.022em" }}>
            Still need <em className="display-accent" style={{ display: "inline" }}>help?</em>
          </h2>
          <p style={{ color: "#6B6B6B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>Our team responds within 1 business hour, 7 days a week.</p>
          <a href="/contact" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px" }}>
            Contact Us <ArrowRight size={15} />
          </a>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .faq-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
