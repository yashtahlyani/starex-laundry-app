"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { PROMO, isPromoActive } from "@/lib/promo";
import { PHONE, PHONE_HREF, SERVICE_AREA } from "@/lib/pricing";

/**
 * Black Friday delivery notice.
 *
 * This page sold the 50% until 2026-11-23, when the owner was explicit that
 * the website covers the delivery time only and the discount is claimed over
 * WhatsApp. So the discount is gone from here: the page states the delivery
 * window, and sends people to WhatsApp to ask about the offer itself.
 *
 * Kept rather than deleted because the link has already been shared. A page
 * that answers the question is a better destination for a circulating link
 * than a 404, and the owner can point people here when they ask how long
 * things are taking this week.
 *
 * After the 29th it says the week has passed and points at booking, so a
 * link posted this week does not mislead anyone next month.
 */
export default function BlackFridayPage() {
  // Checked after mount for the same reason as the banner: this page is
  // prerendered, so a build made during the offer would otherwise keep
  // showing the notice in December.
  const [state, setState] = useState<"loading" | "live" | "ended">("loading");
  useEffect(() => { setState(isPromoActive() ? "live" : "ended"); }, []);

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh", paddingTop: 80 }}>
      <section style={{ background: "#161616", color: "#fff", padding: "72px 0 64px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8, background: "#ED1D24",
            borderRadius: 999, padding: "6px 16px", fontFamily: "Poppins, sans-serif",
            fontWeight: 700, fontSize: "0.8rem", marginBottom: 20,
          }}>
            <Clock size={14} /> {PROMO.label}
          </span>

          <h1 style={{
            fontFamily: "Poppins, sans-serif", fontWeight: 700,
            fontSize: "clamp(1.9rem,5vw,3rem)", letterSpacing: "-0.028em",
            lineHeight: 1.1, marginBottom: 18,
          }}>
            {state === "ended" ? "Back to normal turnaround" : "Delivery times this week"}
          </h1>

          <p style={{
            fontFamily: "Kodchasan, sans-serif", fontSize: "1.0625rem",
            color: "rgba(255,255,255,0.84)", lineHeight: 1.8,
            maxWidth: "52ch", margin: "0 auto 28px",
          }}>
            {state === "ended"
              ? `Our Black Friday week has finished and orders are back to the usual 24 to 48 hours across ${SERVICE_AREA}, with free pickup and delivery.`
              : PROMO.notice}
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/book" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", fontSize: "1rem" }}>
              Book a pickup <ArrowRight size={16} />
            </a>
            <a
              href={PHONE_HREF}
              className="btn-ghost"
              style={{ padding: "14px 26px", fontSize: "0.95rem", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Ask us on {PHONE}
            </a>
          </div>

          {state !== "ended" && (
            <p style={{
              fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)", marginTop: 22, lineHeight: 1.7,
            }}>
              Message or call us about this week&apos;s offer and we&apos;ll sort it out with you directly.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
