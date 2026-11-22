"use client";

import { useEffect, useState } from "react";
import { Check, ArrowRight, Clock, Truck } from "lucide-react";
import { PROMO, isPromoActive } from "@/lib/promo";
import {
  PLANS, MINIMUM_ORDER, SERVICE_AREA, PHONE, PHONE_HREF, HST_LABEL,
} from "@/lib/pricing";
import { SITE_ORIGIN } from "@/lib/site";
import TrustBadge from "@/components/TrustBadge";

/**
 * The Black Friday page: one link to share on WhatsApp, Instagram and the
 * Google Business Profile.
 *
 * An eight-day offer cannot win organic search — Google takes weeks to
 * recrawl and rerank — so this page is built for the share, not the crawl.
 * The work that earns customers is in app/black-friday/layout.tsx, which
 * decides what the link preview shows.
 *
 * The page stays up after the offer ends and says so, rather than 404ing.
 * Links posted to WhatsApp and Google outlive the week they were posted in,
 * and a dead link is a worse answer than "this has finished, here is what we
 * do now".
 *
 * The delivery delay is on the page twice, in the hero and in the terms. An
 * offer that wins bookings by hiding a week-long wait wins complaints eight
 * days later.
 */

const OFFER_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Offer",
  name: "Black Friday - 50% off laundry and dry cleaning",
  description:
    `50% off laundry and dry cleaning in ${SERVICE_AREA}. Free pickup and delivery. `
    + `Delivery takes about a week during the offer.`,
  url: `${SITE_ORIGIN}${PROMO.landingPath}`,
  priceCurrency: "CAD",
  availabilityStarts: PROMO.startDate,
  availabilityEnds: PROMO.endDate,
  areaServed: SERVICE_AREA,
  seller: {
    "@type": "LaundryService",
    name: "Starex",
    telephone: "+1-437-607-7251",
    url: SITE_ORIGIN,
  },
};

export default function BlackFridayPage() {
  // Checked after mount for the same reason as the banner: this page is
  // prerendered, so a build made during the offer would otherwise keep
  // serving "ends 29 November" in December.
  const [state, setState] = useState<"loading" | "live" | "ended">("loading");
  useEffect(() => { setState(isPromoActive() ? "live" : "ended"); }, []);

  const headline = state === "ended" ? "This offer has finished" : "50% off";

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh", paddingTop: 80 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(OFFER_JSON_LD) }} />

      {/* Hero */}
      <section style={{ background: "#161616", color: "#fff", padding: "72px 0 64px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          {state !== "ended" && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8, background: "#ED1D24",
              borderRadius: 999, padding: "6px 16px", fontFamily: "Poppins, sans-serif",
              fontWeight: 700, fontSize: "0.8rem", marginBottom: 20,
            }}>
              Black Friday · {PROMO.dates}
            </span>
          )}

          <h1 style={{
            fontFamily: "Poppins, sans-serif", fontWeight: 700,
            fontSize: "clamp(2.25rem,6vw,4rem)", letterSpacing: "-0.03em",
            lineHeight: 1.05, marginBottom: 18,
          }}>
            {headline}
            {state !== "ended" && (
              <span style={{ display: "block", fontSize: "clamp(1.125rem,2.5vw,1.6rem)", fontWeight: 600, color: "rgba(255,255,255,0.82)", marginTop: 10 }}>
                laundry &amp; dry cleaning in {SERVICE_AREA}
              </span>
            )}
          </h1>

          {state === "ended" ? (
            <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.75, maxWidth: "52ch", margin: "0 auto 28px" }}>
              Our Black Friday offer has ended, but free pickup and delivery has not.
              Wash &amp; Fold is ${PLANS.find(p => p.id === "wash-fold")?.price?.toFixed(2)}/lb and
              we still dry clean 5 pieces for $50.
            </p>
          ) : (
            <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "1.0625rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.75, maxWidth: "54ch", margin: "0 auto 28px" }}>
              Book by {PROMO.endDate.slice(-2)} November and we collect from your door, free.
              One thing to know before you book: <strong style={{ color: "#fff" }}>delivery is taking about a week</strong> while
              the offer runs. Regular orders are still back in 24 to 48 hours.
            </p>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <a href="/book" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", fontSize: "1rem" }}>
              {state === "ended" ? "Book a pickup" : "Claim 50% off"} <ArrowRight size={16} />
            </a>
            <a href={PHONE_HREF} className="btn-ghost" style={{ padding: "14px 26px", fontSize: "0.95rem", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
              Call {PHONE}
            </a>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}><TrustBadge compact /></div>
        </div>
      </section>

      {/* What you can send */}
      <section style={{ padding: "64px 0 32px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.4rem,3vw,1.9rem)", color: "#161616", marginBottom: 18, textAlign: "center" }}>
            What we clean
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {PLANS.filter(p => p.id !== "express").map(p => (
              <div key={p.id} style={{ border: "1.5px solid #E4E4E7", borderRadius: 14, padding: "16px 18px" }}>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#161616" }}>{p.label}</p>
                <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.82rem", color: "#6B6B6B", marginTop: 3 }}>
                  {typeof p.price === "number" ? `$${p.price.toFixed(2)} ${p.unit}` : p.unit} · {p.turnaround}
                </p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 16, fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem", color: "#6B6B6B" }}>
            Prices shown {HST_LABEL}. ${MINIMUM_ORDER.standardCad} minimum order.{" "}
            <a href="/pricing" style={{ color: "#B30F14", textDecoration: "underline" }}>See the full price list</a>.
          </p>
        </div>
      </section>

      {/* The honest bits */}
      <section style={{ padding: "16px 0 72px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ background: "#FAFAFA", border: "1px solid #E4E4E7", borderRadius: 16, padding: "22px 24px" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#161616", marginBottom: 14 }}>
              <Clock size={16} color="#B30F14" /> What to expect
            </h2>
            <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
              {PROMO.terms.map(t => (
                <li key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontFamily: "Kodchasan, sans-serif", fontSize: "0.9rem", color: "#4A4A4A", lineHeight: 1.65 }}>
                  <Check size={15} color="#16A34A" style={{ flexShrink: 0, marginTop: 3 }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <p style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 18, fontFamily: "Kodchasan, sans-serif", fontSize: "0.86rem", color: "#6B6B6B", lineHeight: 1.7 }}>
            <Truck size={15} color="#6B6B6B" style={{ flexShrink: 0, marginTop: 3 }} />
            Not sure what your laundry weighs? Nobody is. We weigh it at pickup and
            confirm the price with you before any work starts, so nothing is a surprise.
          </p>
        </div>
      </section>
    </div>
  );
}
