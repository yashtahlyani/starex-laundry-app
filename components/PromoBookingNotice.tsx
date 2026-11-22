"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { PROMO, isPromoActive, promoAppliesToService } from "@/lib/promo";

/**
 * The 7-day delivery warning, shown on the last step before someone commits
 * to a booking.
 *
 * The owner asked for this specifically: "make sure if a person books he/she
 * should be aware of the fact that their garments are coming in 7 days time
 * window, rest normal delivery schedule would be for regular booked
 * garments."
 *
 * So it is placed where the decision is made, not only on the marketing
 * page. Somebody who arrived from Instagram has read the offer; somebody who
 * came straight to /book has not, and would otherwise find out a week later.
 *
 * It only appears when the offer is running AND the customer has chosen a
 * service the discount covers. Telling a wash & fold customer their order
 * will take a week would be false - their schedule is unchanged - and would
 * cost a booking for nothing.
 */
export default function PromoBookingNotice({ serviceId }: { serviceId: string }) {
  // Checked after mount: the booking page is prerendered, so a build made
  // during the offer would otherwise keep warning about a week-long wait in
  // December.
  const [active, setActive] = useState(false);
  useEffect(() => { setActive(isPromoActive()); }, []);

  if (!active || !promoAppliesToService(serviceId)) return null;

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
          Black Friday orders take about 7 days
        </p>
        <p style={{
          fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem",
          color: "#9A3412", lineHeight: 1.65,
        }}>
          Because of demand during the offer, dry cleaning booked this week comes back in
          roughly 7 days rather than the usual 24 to 48 hours. If you need something sooner,
          book it as a regular order instead and it keeps the normal schedule.
        </p>
        <p style={{
          fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem",
          color: "#B45309", lineHeight: 1.6, marginTop: 6,
        }}>
          {PROMO.appliedNote} {PROMO.exclusions.length > 0 && (
            <>Not included: {PROMO.exclusions.join(", ")}.</>
          )}
        </p>
      </div>
    </div>
  );
}
