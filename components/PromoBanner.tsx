"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { PROMO, isPromoActive } from "@/lib/promo";

/**
 * The Black Friday delivery notice, on the homepage and the booking page.
 *
 * It carries the owner's sentence and nothing else. No discount figure, and
 * no link to an offer page: he asked for the website to cover the delivery
 * time only, with the 50% claimed over WhatsApp.
 *
 * Renders nothing outside the promo window, so on 30 November it disappears
 * on its own rather than waiting for someone to remember.
 *
 * The window is checked after mount, not during the server render, because
 * both pages that use it are prerendered at build time: a build made during
 * the offer would otherwise bake the notice into the HTML and keep serving
 * it in December until something triggered a rebuild. A little pop-in is a
 * fair price for a dated notice that cannot go stale.
 *
 * Not dismissible. The delay is the part a customer most needs before
 * booking, and a dismissed banner is one they never read.
 */
export default function PromoBanner({ compact = false }: { compact?: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(isPromoActive()); }, []);
  if (!show) return null;

  return (
    <aside
      aria-label="Black Friday delivery notice"
      style={{
        background: "#161616", color: "#FFFFFF",
        padding: compact ? "12px 16px" : "14px 24px",
        borderRadius: compact ? 14 : 0,
        marginBottom: compact ? 20 : 0,
      }}
    >
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 10, flexWrap: "wrap", textAlign: "center",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "#ED1D24", borderRadius: 999, padding: "4px 12px",
          fontFamily: "Poppins, sans-serif", fontWeight: 700,
          fontSize: compact ? "0.78rem" : "0.82rem", whiteSpace: "nowrap",
        }}>
          <Clock size={13} /> {PROMO.label}
        </span>
        <span style={{
          fontFamily: "Kodchasan, sans-serif",
          fontSize: compact ? "0.8rem" : "0.86rem",
          color: "rgba(255,255,255,0.88)", lineHeight: 1.6,
        }}>
          {PROMO.notice}
        </span>
      </div>
    </aside>
  );
}
