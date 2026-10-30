"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { NotificationHealth } from "@/app/api/admin/notification-health/route";

/**
 * Warns the owner when customer notifications are not arriving.
 *
 * This exists because of a real two-month outage: Meta disabled the WhatsApp
 * sender on 24 Aug, every message after that failed, and nothing in the
 * console said so. The owner found out by noticing that customers never
 * replied and having to message them one by one.
 *
 * Deliberately only appears when something is wrong. A banner that is always
 * there is a banner nobody reads.
 */

const CODE_MEANINGS: Record<string, string> = {
  "63112": "Meta has disabled the WhatsApp Business Account. Only Twilio/Meta can re-enable it.",
  "63024": "Invalid recipient number — check the phone number on those orders.",
  "63016": "Message sent outside WhatsApp's 24-hour window without an approved template.",
  "63018": "Rate limit reached on the WhatsApp sender.",
  "63003": "The recipient's number is not on WhatsApp.",
};

export default function NotificationHealthBanner() {
  const [health, setHealth] = useState<NotificationHealth | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/notification-health")
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled && d) setHealth(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Only channels that are actually failing, and only when failures are a
  // real share of the traffic — a single bad phone number is not an outage.
  const broken = (health?.channels ?? []).filter(c => {
    const attempted = c.sent + c.failed;
    return c.failed >= 3 && attempted > 0 && c.failed / attempted >= 0.2;
  });

  if (!health || broken.length === 0) return null;

  return (
    <div
      role="status"
      style={{
        border: "1.5px solid rgba(237,29,36,0.35)", background: "#FFF5F5",
        borderRadius: 14, padding: "14px 16px", marginBottom: 18,
        display: "flex", gap: 12, alignItems: "flex-start",
      }}
    >
      <AlertTriangle size={18} color="#B30F14" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.88rem", color: "#4A4A4A", lineHeight: 1.6 }}>
        <strong style={{ fontFamily: "Poppins, sans-serif", color: "#B30F14", display: "block", marginBottom: 4 }}>
          Customers are not receiving notifications
        </strong>
        {broken.map(c => {
          const attempted = c.sent + c.failed;
          const codes = Object.entries(c.errorCodes).sort((a, b) => b[1] - a[1]);
          return (
            <div key={c.channel} style={{ marginBottom: 6 }}>
              <strong style={{ textTransform: "capitalize" }}>{c.channel}</strong>:{" "}
              {c.failed} of {attempted} failed in the last {health.windowDays} days.
              {c.lastSuccessAt
                ? ` Last one that actually arrived: ${new Date(c.lastSuccessAt).toLocaleDateString("en-CA", { day: "numeric", month: "short", year: "numeric" })}.`
                : " None have arrived in this period."}
              {codes.map(([code, n]) => (
                <div key={code} style={{ marginTop: 3, color: "#6B6B6B", fontSize: "0.83rem" }}>
                  {CODE_MEANINGS[code] ?? `Provider error ${code}`}{codes.length > 1 ? ` (${n}×)` : ""}
                </div>
              ))}
            </div>
          );
        })}
        <div style={{ marginTop: 8, color: "#6B6B6B", fontSize: "0.83rem" }}>
          Email is tracked separately above — if only WhatsApp is listed, order emails are still going out.
        </div>
      </div>
    </div>
  );
}
