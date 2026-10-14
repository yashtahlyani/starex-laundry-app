"use client";

import { useEffect, useState } from "react";
import { Star, ShieldCheck } from "lucide-react";

type Summary = {
  show: boolean;
  source?: "google" | "starex";
  average?: number;
  count?: number;
  profileUrl?: string | null;
};

/**
 * Rating shown beside the booking button (per client, 2026-10-14).
 *
 * Shows the Google Business Profile rating once that profile is configured in
 * lib/site.ts; until then it shows Starex's own verified ratings — real
 * ratings from real delivered orders, labelled as what they are rather than
 * dressed up as Google's.
 *
 * Renders nothing at all when there isn't enough real data. No placeholder
 * stars, no sample testimonials: a made-up rating next to a payment button is
 * exactly the kind of thing that costs more trust than it buys.
 */
export default function TrustBadge({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/reviews/summary")
      .then(r => r.json())
      .then(d => { if (alive) setData(d); })
      .catch(() => { if (alive) setData({ show: false }); });
    return () => { alive = false; };
  }, []);

  if (!data?.show || data.average == null || data.count == null) return null;

  const isGoogle = data.source === "google";
  const full = Math.floor(data.average);
  const half = data.average - full >= 0.5;

  const stars = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      {[0, 1, 2, 3, 4].map(i => {
        const lit = i < full || (i === full && half);
        return (
          <Star
            key={i}
            size={compact ? 12 : 14}
            color={lit ? "#F5A623" : "#D4D4D8"}
            fill={lit ? "#F5A623" : "none"}
            // a half star is rendered as a lit outline rather than a partial
            // fill — honest about rounding without pretending to precision
            strokeWidth={2}
          />
        );
      })}
    </span>
  );

  const body = (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 999,
      padding: compact ? "6px 13px" : "9px 16px",
    }}>
      {isGoogle ? <GoogleG size={compact ? 13 : 15} /> : <ShieldCheck size={compact ? 13 : 15} color="#16A34A" />}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
        <strong style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: compact ? "0.82rem" : "0.9rem", color: "#161616" }}>
          {data.average.toFixed(1)}
        </strong>
        {stars}
        <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: compact ? "0.72rem" : "0.78rem", color: "#6B6B6B" }}>
          {isGoogle
            ? `from ${data.count} Google review${data.count === 1 ? "" : "s"}`
            : `from ${data.count} verified order${data.count === 1 ? "" : "s"}`}
        </span>
      </span>
    </div>
  );

  return data.profileUrl ? (
    <a href={data.profileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      {body}
    </a>
  ) : body;
}

function GoogleG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.0 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.0 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37.1 40.2 44 35 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
