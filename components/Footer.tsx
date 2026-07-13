"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUp } from "lucide-react";

const pages = [
  { label: "Services",     href: "/services" },
  { label: "Pricing",      href: "/pricing" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About",        href: "/about" },
  { label: "FAQ",          href: "/faq" },
  { label: "Contact",      href: "/contact" },
];

const serviceList = ["Wash & Fold — $2.29/lb", "Dry Cleaning", "Same-Day Express", "Ironing & Press", "Household & Bedding", "Car & Sofa Detailing"];

const colHead: React.CSSProperties = {
  fontFamily: "Kodchasan, sans-serif",
  fontWeight: 600,
  fontSize: "0.7rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.35)",
  marginBottom: "20px",
  display: "block",
};

const linkStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.55)",
  fontSize: "0.875rem",
  textDecoration: "none",
  display: "block",
  marginBottom: "10px",
  fontFamily: "Kodchasan, sans-serif",
  transition: "color 0.15s ease",
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer style={{ background: "#1F1B1B" }}>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 24px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "48px" }}>

            {/* Brand + newsletter */}
            <div>
              <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: "linear-gradient(180deg,#BE4459,#A4243B)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l2.47 6.9 7.32.1-5.87 4.38 2.16 7L12 16.2l-6.08 4.18 2.16-7L2.21 9l7.32-.1L12 2z" fill="#FFFFFF"/>
                  </svg>
                </div>
                <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.05rem", color: "#ffffff" }}>StareX</span>
              </a>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "28px", maxWidth: "220px", fontFamily: "Kodchasan, sans-serif" }}>
                Canada&apos;s premium laundry service. Pickup, clean, deliver — repeat.
              </p>
              {subscribed ? (
                <p style={{ color: "#D9909B", fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem", fontWeight: 600 }}>You&apos;re in ✓</p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: "10px", gap: 8 }}>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{ background: "none", border: "none", outline: "none", color: "#ffffff", fontSize: "0.875rem", flex: 1, fontFamily: "Kodchasan, sans-serif" }}
                  />
                  <button
                    onClick={() => { if (email) setSubscribed(true); }}
                    style={{ background: "none", border: "none", color: "#D9909B", cursor: "pointer", padding: "4px", display: "flex" }}
                    aria-label="Subscribe"
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Pages */}
            <div>
              <span style={colHead}>Pages</span>
              {pages.map(p => (
                <a key={p.href} href={p.href} style={linkStyle}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#D9909B"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"}
                >{p.label}</a>
              ))}
            </div>

            {/* Services */}
            <div>
              <span style={colHead}>Services</span>
              {serviceList.map(s => (
                <p key={s} style={linkStyle}>{s}</p>
              ))}
            </div>

            {/* Contact */}
            <div>
              <span style={colHead}>Contact</span>
              <a href="mailto:hello@starexlaundry.ca" style={linkStyle}>hello@starexlaundry.ca</a>
              <a href="tel:+14376077251" style={linkStyle}>437-607-7251</a>
              <p style={{ ...linkStyle, lineHeight: 1.65 }}>Brampton, ON<br />Mississauga, ON</p>
              <p style={linkStyle}>www.starexlaundry.ca</p>
              <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                {[
                  <svg key="ig" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
                  <svg key="tw" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>,
                  <svg key="fb" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>,
                ].map((icon, i) => (
                  <motion.a
                    key={i} href="#"
                    style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", display: "flex" }}
                    whileHover={{ color: "#D9909B", scale: 1.15 } as any}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
        {/* Ghost watermark */}
        <div style={{
          position: "absolute", bottom: "-12px", left: "50%", transform: "translateX(-50%)",
          fontFamily: "Poppins, sans-serif", fontWeight: 700,
          fontSize: "clamp(3rem,10vw,6rem)", letterSpacing: "-0.04em",
          color: "rgba(255,255,255,0.04)", whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none",
        }}>
          STAREX
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif" }}>
            &copy; {new Date().getFullYear()} StareX Inc. Made in Canada 🍁
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="/terms" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif", textDecoration: "none" }}>Terms</a>
            <a href="/privacy" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif", textDecoration: "none" }}>Privacy</a>
          </div>
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ rotate: -45 } as any}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", background: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Back to top"
          >
            <ArrowUp size={15} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
