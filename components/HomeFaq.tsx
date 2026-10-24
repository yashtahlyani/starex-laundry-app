"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import {
  BUSINESS_NAME, SERVICE_AREA, MINIMUM_ORDER, DRY_CLEAN_COMBO, PLANS,
} from "@/lib/pricing";

/**
 * Homepage FAQ, requested by the SEO contractor (25 Oct) and supplied as six
 * questions in a .docx.
 *
 * His copy was accurate against the live price list, which is rare and worth
 * saying. Two things were changed:
 *
 *  - "StareX" throughout -> "Starex". That spelling was corrected site-wide
 *    on 14 Oct at the owner's request; reintroducing it on the homepage would
 *    undo that.
 *  - Every figure now reads from lib/pricing.ts rather than being typed in.
 *    Prices on this site have drifted three times from exactly this pattern —
 *    a second copy of a number that nobody remembers to update.
 *
 * The answers are otherwise his, and they match what the site actually does:
 * verified $2/lb, $3/lb express, the $40 minimum, 24-48h, and the five-PIECE
 * combo (which he got right, including that a 2-piece suit counts as two).
 */
const rate = (id: string) => PLANS.find(p => p.id === id)?.price ?? 0;

const FAQS: { q: string; a: string }[] = [
  {
    q: `What laundry and dry cleaning services does ${BUSINESS_NAME} offer?`,
    a: `${BUSINESS_NAME} offers professional wash and fold, dry cleaning, wash and press, ironing, same-day express laundry, bedding and blanket cleaning, and car and sofa detailing services.`,
  },
  {
    q: `Does ${BUSINESS_NAME} offer laundry pickup and delivery?`,
    a: `Yes, ${BUSINESS_NAME} provides convenient laundry pickup and delivery in ${SERVICE_AREA}, Ontario. You can schedule a pickup online and have your cleaned laundry delivered to your doorstep.`,
  },
  {
    q: `How much does ${BUSINESS_NAME} charge for laundry services?`,
    a: `${BUSINESS_NAME}'s wash and fold service starts at $${rate("wash-fold").toFixed(0)} per pound, with a $${MINIMUM_ORDER.standardCad} minimum order. Same-day express laundry starts at $${rate("express").toFixed(0)} per pound. Applicable taxes may apply.`,
  },
  {
    q: `How long does ${BUSINESS_NAME} take to complete laundry and dry cleaning?`,
    a: `${BUSINESS_NAME} typically completes orders within 24–48 hours. Same-day express wash and fold is also available, subject to service availability and applicable booking cut-off times.`,
  },
  {
    q: "Can I get blankets, duvets, and other household items cleaned?",
    a: `Yes, ${BUSINESS_NAME} cleans household items such as blankets, duvets, curtains, and rugs. Its dry cleaning offer includes ${DRY_CLEAN_COMBO.pieceCount} eligible pieces for $${DRY_CLEAN_COMBO.priceCad}, including one blanket or quilt, subject to the offer's exclusions. Multi-piece items count per piece — a 2-piece suit uses 2 of the ${DRY_CLEAN_COMBO.pieceCount}.`,
  },
  {
    q: `How can I book a laundry pickup with ${BUSINESS_NAME}?`,
    a: "You can book a pickup through this website. Select your preferred service, choose an available pickup date and time window, and provide your collection details to get started.",
  },
];

/** Same questions and answers as the visible list, marked up for search
 *  engines and AI assistants. Generated from FAQS so the two can never say
 *  different things. */
export const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(f => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

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
          or call <a href="tel:+14376077251" style={{ color: "#B30F14", textDecoration: "underline" }}>437-607-7251</a>.
        </p>
      </div>
    </section>
  );
}
