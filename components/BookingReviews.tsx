"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import type { Review } from "@/lib/reviews";

type Payload = {
  source: "google" | "manual" | "none";
  reviews: Review[];
  profileUrl?: string | null;
};

/**
 * Two real reviews, shown beside the button that commits the order
 * (per client, 2026-11-02: "add a reviews section near the booking button").
 *
 * The homepage already carries the full reviews section; this is the moment
 * of hesitation it cannot reach — the customer is on the last step, about to
 * hand over an address and a card. TrustBadge above gives the number, this
 * gives the words.
 *
 * Reviews are printed exactly as written, with no trimming: the standing rule
 * on this site is that review text is never edited, and an ellipsis in a
 * testimonial is an edit. Rather than cut anything, it shows the two SHORTEST
 * real reviews, so what fits is whole.
 *
 * Renders nothing when there are no real reviews. A fabricated testimonial
 * beside a payment button is a false representation under the Competition
 * Act, quite apart from being a bad way to treat customers.
 */
const HOW_MANY = 2;

export default function BookingReviews() {
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/reviews/list")
      .then(r => r.json())
      .then(d => { if (alive) setData(d); })
      .catch(() => { if (alive) setData({ source: "none", reviews: [] }); });
    return () => { alive = false; };
  }, []);

  if (!data || data.reviews.length === 0) return null;

  const shown = [...data.reviews]
    .filter(r => r.text?.trim())
    .sort((a, b) => a.text.length - b.text.length)
    .slice(0, HOW_MANY);

  if (shown.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem",
        color: "#6B6B6B", margin: "0 0 8px", letterSpacing: "0.01em",
      }}>
        What customers say
      </p>

      <div style={{ display: "grid", gap: 8 }}>
        {shown.map(r => (
          <figure
            key={`${r.author}-${r.text.slice(0, 24)}`}
            style={{
              margin: 0, background: "#FFFFFF", border: "1px solid #E4E4E7",
              borderRadius: 12, padding: "11px 14px",
            }}
          >
            <span style={{ display: "inline-flex", gap: 1, marginBottom: 5 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <Star
                  key={i} size={11}
                  color={i < Math.round(r.rating) ? "#F5A623" : "#D4D4D8"}
                  fill={i < Math.round(r.rating) ? "#F5A623" : "none"}
                  strokeWidth={2}
                />
              ))}
            </span>
            <blockquote style={{
              margin: 0, fontFamily: "Kodchasan, sans-serif", fontSize: "0.83rem",
              color: "#4A4A4A", lineHeight: 1.6,
            }}>
              {r.text}
            </blockquote>
            <figcaption style={{
              marginTop: 5, fontFamily: "Kodchasan, sans-serif",
              fontSize: "0.75rem", color: "#8C8C8C",
            }}>
              — {r.author}
            </figcaption>
          </figure>
        ))}
      </div>

      {data.profileUrl && (
        <a
          href={data.profileUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-block", marginTop: 7,
            fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem",
            color: "#B30F14", textDecoration: "underline", textUnderlineOffset: 2,
          }}
        >
          Read all reviews on Google
        </a>
      )}
    </div>
  );
}
