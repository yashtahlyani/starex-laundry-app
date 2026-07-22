"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUp } from "lucide-react";
import Logo from "@/components/Logo";
import { CONTACT, SOCIAL_LINKS } from "@/lib/site";

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
  color: "#8C8C8C",
  marginBottom: "20px",
  display: "block",
};

const linkStyle: React.CSSProperties = {
  color: "#4A4A4A",
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
  const [submitting, setSubmitting] = useState(false);

  async function subscribe() {
    const value = email.trim();
    if (!value || submitting) return;
    setSubmitting(true);
    try {
      // Fire-and-persist: store the address, but don't block the "You're in ✓"
      // confirmation on a network hiccup — a newsletter signup should never
      // feel like it failed.
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      }).catch(() => {});
      setSubscribed(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer style={{ background: "#F2F2F2" }}>
      <div style={{ borderTop: "1px solid rgba(20,20,20,0.08)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 24px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "48px" }}>

            {/* Brand + newsletter */}
            <div>
              <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", marginBottom: 16 }}>
                <Logo color="#161616" fontSize="1.25rem" />
              </a>
              <p style={{ color: "#6B6B6B", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "28px", maxWidth: "220px", fontFamily: "Kodchasan, sans-serif" }}>
                Canada&apos;s premium laundry service. Pickup, clean, deliver — repeat.
              </p>
              {subscribed ? (
                <p style={{ color: "#8F2740", fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem", fontWeight: 600 }}>You&apos;re in ✓</p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(20,20,20,0.15)", paddingBottom: "10px", gap: 8 }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") subscribe(); }}
                    placeholder="your@email.com"
                    style={{ background: "none", border: "none", outline: "none", color: "#161616", fontSize: "0.875rem", flex: 1, fontFamily: "Kodchasan, sans-serif" }}
                  />
                  <button
                    onClick={subscribe}
                    disabled={submitting}
                    style={{ background: "none", border: "none", color: "#B8324F", cursor: submitting ? "default" : "pointer", padding: "4px", display: "flex", opacity: submitting ? 0.5 : 1 }}
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
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#B8324F"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#4A4A4A"}
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
              <a href={`mailto:${CONTACT.email}`} style={linkStyle}>{CONTACT.email}</a>
              <a href={`tel:${CONTACT.phoneHref}`} style={linkStyle}>{CONTACT.phone}</a>
              <p style={{ ...linkStyle, lineHeight: 1.65 }}>{CONTACT.cities[0]}<br />{CONTACT.cities[1]}</p>
              <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                {[
                  { key: "ig", url: SOCIAL_LINKS.instagram, label: "Instagram", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
                  { key: "tw", url: SOCIAL_LINKS.twitter, label: "Twitter/X", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg> },
                  { key: "fb", url: SOCIAL_LINKS.facebook, label: "Facebook", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
                ].map(({ key, url, label, icon }) =>
                  url ? (
                    <motion.a
                      key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
                      style={{ color: "#8C8C8C", textDecoration: "none", display: "flex" }}
                      whileHover={{ color: "#B8324F", scale: 1.15 } as any}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      {icon}
                    </motion.a>
                  ) : (
                    // No profile URL configured yet — show the icon but don't
                    // render a dead link that jumps the page to the top.
                    <span key={key} aria-hidden="true" style={{ color: "#C4C4C4", display: "flex" }}>{icon}</span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ borderTop: "1px solid rgba(20,20,20,0.08)", position: "relative", overflow: "hidden" }}>
        {/* Ghost watermark */}
        <div style={{
          position: "absolute", bottom: "-12px", left: "50%", transform: "translateX(-50%)",
          fontFamily: "Poppins, sans-serif", fontWeight: 700,
          fontSize: "clamp(3rem,10vw,6rem)", letterSpacing: "-0.04em",
          color: "rgba(20,20,20,0.04)", whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none",
        }}>
          STAREX
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", position: "relative" }}>
          <p style={{ color: "#8C8C8C", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif" }}>
            &copy; {new Date().getFullYear()} StareX Inc. Made in Canada 🍁
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="/terms" style={{ color: "#8C8C8C", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif", textDecoration: "none" }}>Terms</a>
            <a href="/privacy" style={{ color: "#8C8C8C", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif", textDecoration: "none" }}>Privacy</a>
          </div>
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ rotate: -45 } as any}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(20,20,20,0.15)", background: "none", cursor: "pointer", color: "#4A4A4A", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Back to top"
          >
            <ArrowUp size={15} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
