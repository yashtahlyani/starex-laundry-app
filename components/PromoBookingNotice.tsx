"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { PROMO, isPromoActive } from "@/lib/promo";

/**
 * The delivery warning, repeated on the last step before someone commits to
 * a booking.
 *
 * The owner asked for this twice: "make sure if a person books he/she should
 * be aware of the fact that their garments are coming in 7 days time window,
 * rest normal delivery schedule would be for regular booked garments."
 *
 * The banner at the top of the page says the same thing, but someone who has
 * worked through four steps of a form has long since scrolled past it. This
 * sits directly above the button that commits the order, where it cannot be
 * missed, and it uses the owner's exact sentence so the two cannot drift
 * apart.
 *
 * No discount figure here either - the website covers the delivery time, the
 * offer itself is claimed over WhatsApp.
 */
export default function PromoBookingNotice() {
  // Checked after mount: the booking page is prerendered, so a build made
  // during the offer would otherwise keep warning about a week-long wait in
  // December.
  const [active, setActive] = useState(false);
  useEffect(() => { setActive(isPromoActive()); }, []);

  if (!active) return null;

  return (
    <div
      role="note"
      style={{
        display: "flex", gap: 11, alignItems: "flex-start",
        background: "#FFF7ED", border: "1.5px solid rgba(234,88,12,0.35)",
        borderRadius: 14, padding: "14px 16px", marginBottom: 20,
      }}
    >
      <Clock size={18} color="#C2410C" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <p style={{
          fontFamily: "Poppins, sans-serif", fontWeight: 600,
          fontSize: "0.9rem", color: "#9A3412", marginBottom: 4,
        }}>
          Before you book - delivery times this week
        </p>
        <p style={{
          fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem",
          color: "#9A3412", lineHeight: 1.65,
        }}>
          {PROMO.notice}
        </p>
      </div>
    </div>
  );
}
