"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import {
  BUSINESS_NAME, SERVICE_AREA, MINIMUM_ORDER, DRY_CLEAN_COMBO, PLANS, MEMBERSHIP,
  PHONE, PHONE_HREF, CATALOG, itemKey, lookupCatalogItem,
} from "@/lib/pricing";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * Homepage FAQ. Rewritten 2026-11-19 from the fourteen questions the owner
 * sent, and placed directly after How It Works at his request.
 *
 * Two constraints came with it.
 *
 * The SEO lead asked for no special characters. Em dashes, en dashes and
 * curly quotes are out: they survive the page fine but get mangled in rich
 * results, in the Business Profile and anywhere the text is pasted onward.
 * Plain hyphens and straight apostrophes throughout, and PLAIN_TEXT below
 * enforces it rather than trusting anyone to remember.
 *
 * He also asked that it align with SEO. So each question is phrased the way
 * a person actually searches - "how much is wash and fold", "do you clean
 * sarees" - and each answer puts the concrete fact first, because a snippet
 * is often all a searcher reads. The city names, the phone number and the
 * prices come from the price list rather than being typed in, for the usual
 * reason: a hand-typed price goes stale and starts lying to people.
 */

const rate = (id: string) => PLANS.find(p => p.id === id)?.price ?? 0;
const price = (tab: string, name: string) =>
  lookupCatalogItem(itemKey(tab, name))?.item.price ?? 0;
const money = (n: number) => `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;

const FAQS: { q: string; a: string }[] = [
  {
    q: "Do you offer laundry pickup and delivery?",
    a: `Yes. Free pickup and delivery across ${SERVICE_AREA} on orders of $${MINIMUM_ORDER.standardCad} or more. Book at ${SITE_ORIGIN.replace("https://", "")} or call ${PHONE}.`,
  },
  {
    q: "How much is wash and fold?",
    a: `Wash and Fold is ${money(rate("wash-fold"))} per pound. Your clothes are washed, neatly folded and back to you in 24 to 48 hours.`,
  },
  {
    q: "What dry cleaning offers do you have?",
    a: `Our Dry Clean Combo is any ${DRY_CLEAN_COMBO.pieceCount} pieces for $${DRY_CLEAN_COMBO.priceCad}, including 1 blanket. Wedding dresses, leather and suede are not included. Shirts start at ${money(price("dry-clean", "Shirt / T-Shirt"))} and pants at ${money(price("dry-clean", "Pant / Skirt / Bottom"))}.`,
  },
  {
    q: "Do you clean sarees and Indian outfits?",
    a: `Yes. Saree dry cleaning starts at ${money(price("dry-clean", "Saree"))}, and we also clean Punjabi suits, kurtas and lehengas. Festive wear is something we do a lot of.`,
  },
  {
    q: "I need something urgently. Can you do same day?",
    a: `Yes. Same Day Dry Cleaning is charged at 50% extra and depends on the day's capacity, so please confirm slot availability before booking, or call ${PHONE} and we will arrange a pickup.`,
  },
  {
    q: "Do you clean blankets, duvets and comforters?",
    a: `Yes, in any size. A blanket also counts as one of the ${DRY_CLEAN_COMBO.pieceCount} pieces in the $${DRY_CLEAN_COMBO.priceCad} combo.`,
  },
  {
    q: "What is Wash and Press?",
    a: `Wash and Press is ${money(rate("wash-press"))} per pound. Your everyday clothes come back washed and pressed, charged by weight instead of per garment.`,
  },
  {
    q: "Is there a minimum order?",
    a: `Yes. Orders start at $${MINIMUM_ORDER.standardCad} before HST. Pickup and delivery are free at that amount. Car and Sofa Detailing has its own $${MINIMUM_ORDER.detailingCad} minimum.`,
  },
  {
    q: "Do you have a monthly plan?",
    a: `Yes. The ${MEMBERSHIP.name} is $${MEMBERSHIP.monthlyPriceCad} a month and covers up to ${MEMBERSHIP.includedLbs} lbs, with anything beyond that at $${MEMBERSHIP.overagePerLbCad.toFixed(2)} per pound.`,
  },
  {
    q: "Do I need to be home for pickup?",
    a: "No. Pickup is contactless at your door. You choose your time window when you book, and your bag is sealed, labelled and tracked from the moment it leaves your hands.",
  },
  {
    q: "Do you detail cars and sofas?",
    a: `Yes. Interior detailing, deep clean and shampoo for vehicles and sofas, from $${price("detailing", "Car Detailing (Interior Only)")}, with the final price confirmed on inspection.`,
  },
  {
    q: "Are my clothes insured?",
    a: "Yes. Your garments are covered. The full claim policy is in our Terms and Conditions.",
  },
  {
    q: "Do you clean curtains and drapery?",
    a: `Yes. Curtain and drapery cleaning starts at ${money(price("dry-clean", "Curtain / Drapery (per panel)"))} per panel, with free pickup and delivery on orders of $${MINIMUM_ORDER.standardCad} or more.`,
  },
  {
    q: "How do I book a pickup?",
    a: `Book online in about a minute, or call ${PHONE}. Choose your service, pick a pickup day and time window, and tell us where to collect from.`,
  },
];

/**
 * The SEO lead's "no special characters" rule, enforced instead of trusted.
 * Throws at build time rather than shipping a mangled dash into a rich
 * result, so the rule outlives whoever remembers it.
 */
const PLAIN_TEXT = /^[\x20-\x7E]*$/;
for (const f of FAQS) {
  for (const [field, text] of [["question", f.q], ["answer", f.a]] as const) {
    if (!PLAIN_TEXT.test(text)) {
      const bad = [...text].filter(c => !PLAIN_TEXT.test(c)).join(" ");
      throw new Error(
        `Homepage FAQ ${field} contains non-plain characters (${bad}): "${text.slice(0, 60)}". ` +
        `Use plain hyphens and straight apostrophes - see the note in HomeFaq.tsx.`
      );
    }
  }
}

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
          or call <a href={PHONE_HREF} style={{ color: "#B30F14", textDecoration: "underline" }}>{PHONE}</a>.
        </p>
      </div>
    </section>
  );
}
