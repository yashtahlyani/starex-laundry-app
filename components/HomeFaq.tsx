"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { PHONE, PHONE_HREF } from "@/lib/pricing";
import { HOMEPAGE_FAQS, faqJsonLd } from "@/lib/faq";

/**
 * Homepage FAQ: six questions, chosen by the owner (2026-11-21), sitting
 * immediately before the booking call to action.
 *
 * Six rather than all fourteen because this is the last thing someone reads
 * before deciding — a long list here is a reason to scroll past rather than
 * book. The full fourteen live on /faq, linked at the bottom of this block.
 *
 * The questions themselves live in lib/faq.ts so the homepage and /faq
 * cannot drift into answering the same question differently.
 */

const FAQS = HOMEPAGE_FAQS;

export const homeFaqJsonLd = faqJsonLd(FAQS);

export default function HomeFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section style={{ background: "#FFFFFF", padding: "88px 0" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span className="eyebrow" style={{ color: "#B30F14" }}>Common Questions</span>
          <h2 style={{
            fontFamily: "Poppins, sans-serif", fontWeight: 600,
            fontSize: "clamp(1.75rem,3.5vw,2.5rem)", letterSpacing: "-0.022em",
            color: "#161616", margin: "8px 0 10px",
          }}>
            Frequently asked <em className="display-accent" style={{ display: "inline" }}>questions.</em>
          </h2>
          <p style={{ color: "#6B6B6B", fontFamily: "Kodchasan, sans-serif" }}>
            Everything people usually ask before their first pickup.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                style={{
                  border: `1.5px solid ${isOpen ? "rgba(237,29,36,0.3)" : "rgba(20,20,20,0.1)"}`,
                  borderRadius: 14, background: isOpen ? "#FFF9F9" : "#FFFFFF",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 16, padding: "18px 20px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#161616" }}>
                    {f.q}
                  </span>
                  <span style={{
                    flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
                    background: isOpen ? "#ED1D24" : "#F2F2F2",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isOpen ? <Minus size={14} color="#fff" /> : <Plus size={14} color="#6B6B6B" />}
                  </span>
                </button>
                {isOpen && (
                  <p style={{
                    padding: "0 20px 20px", margin: 0,
                    fontFamily: "Kodchasan, sans-serif", fontSize: "0.95rem",
                    color: "#4A4A4A", lineHeight: 1.75,
                  }}>
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: "center", marginTop: 28, fontFamily: "Kodchasan, sans-serif", fontSize: "0.9rem", color: "#6B6B6B" }}>
          More questions? <a href="/faq" style={{ color: "#B30F14", textDecoration: "underline" }}>See the full FAQ</a>{" "}
          or call <a href={PHONE_HREF} style={{ color: "#B30F14", textDecoration: "underline" }}>{PHONE}</a>.
        </p>
      </div>
    </section>
  );
}
