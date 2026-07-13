"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, CheckCircle, ArrowRight } from "lucide-react";

const ease = [0.25, 0.4, 0.25, 1] as const;

function AnimatedContent({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay, ease }} style={style}>
      {children}
    </motion.div>
  );
}

const info = [
  { Icon: Phone, title: "Phone", value: "437-607-7251", sub: "Call or text, 7 days a week", color: "#EDEDED" },
  { Icon: Mail, title: "Email", value: "hello@starexlaundry.ca", sub: "We reply within 1 business hour", color: "#F2F2F2" },
  { Icon: MapPin, title: "Service Area", value: "Brampton & Mississauga", sub: "Ontario, Canada", color: "#EAEAEA" },
  { Icon: Clock, title: "Hours", value: "7 days a week", sub: "Pickups: 7 AM – 8 PM EST", color: "#E5E5E5" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send message");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 10, border: "1px solid #E5E7EB",
    fontSize: "0.9375rem", fontFamily: "Kodchasan, sans-serif", color: "#161616",
    background: "#FAFAFA", outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 500,
    fontSize: "0.875rem", color: "#4A4A4A", marginBottom: 6,
  };

  return (
    <div style={{ background: "#FFFFFF" }}>

      {/* Hero */}
      <section style={{
        paddingTop: 120, paddingBottom: 72, position: "relative", overflow: "hidden",
        backgroundColor: "var(--brand)",
        backgroundImage: "url(/images/starex/basket-towels.png)",
        backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", minHeight: 480,
      }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(184,50,79,0.55)" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative" }}>
          <motion.span className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>Contact</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(2.5rem,5vw,3.75rem)", letterSpacing: "-0.022em", lineHeight: 1.1, color: "#ffffff", marginBottom: 20 }}
          >
            Get in <em style={{ fontStyle: "italic" }}>touch.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.0625rem", fontFamily: "Kodchasan, sans-serif" }}
          >
            Questions, feedback, or just want to say hi — we&apos;d love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Main */}
      <section style={{ padding: "80px 0 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 400px", gap: 48, alignItems: "start" }} className="contact-layout">

          {/* Form */}
          <AnimatedContent>
            <div style={{ background: "#ffffff", borderRadius: 20, padding: "40px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: "center", padding: "48px 0" }}
                >
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F2F2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <CheckCircle size={30} color="#16a34a" />
                  </div>
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.375rem", color: "#161616", marginBottom: 10 }}>Message sent!</h3>
                  <p style={{ color: "#6B6B6B", fontFamily: "Kodchasan, sans-serif", marginBottom: 28 }}>We&apos;ll get back to you within 1 business hour.</p>
                  <button
                    onClick={() => { setForm({ name: "", email: "", subject: "", message: "" }); setSubmitted(false); setError(null); }}
                    className="btn-primary"
                    style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px" }}
                  >
                    Send another <ArrowRight size={15} />
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.5rem", color: "#161616", marginBottom: 28, letterSpacing: "-0.02em" }}>Send us a message</h2>
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-row">
                      <div>
                        <label style={labelStyle}>Full name</label>
                        <input style={inputStyle} placeholder="Jane Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                      </div>
                      <div>
                        <label style={labelStyle}>Email address</label>
                        <input type="email" style={inputStyle} placeholder="jane@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Subject</label>
                      <input style={inputStyle} placeholder="How can we help?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Message</label>
                      <textarea
                        rows={5} style={{ ...inputStyle, resize: "vertical" }}
                        placeholder="Tell us more…"
                        value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                        required
                      />
                    </div>
                    {error && (
                      <p style={{ color: "#dc2626", fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem" }}>{error}</p>
                    )}
                    <button type="submit" disabled={loading} className="btn-primary" style={{ border: "none", cursor: loading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", width: "100%", fontSize: "1rem", opacity: loading ? 0.7 : 1 }}>
                      {loading ? "Sending…" : <>Send Message <ArrowRight size={16} /></>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </AnimatedContent>

          {/* Info cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {info.map((item, i) => (
              <AnimatedContent key={item.title} delay={i * 0.07}>
                <div style={{ background: item.color, borderRadius: 16, padding: "24px" }}>
                  <div style={{ width: 36, height: 36, background: "rgba(0,0,0,0.07)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <item.Icon size={16} color="#161616" />
                  </div>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#161616", marginBottom: 4 }}>{item.title}</p>
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#161616", marginBottom: 2 }}>{item.value}</p>
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8125rem", color: "#6B6B6B" }}>{item.sub}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .contact-layout { grid-template-columns: 1fr !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
