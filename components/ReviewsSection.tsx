"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { REVIEWS_SECTION, type Review } from "@/lib/reviews";

type Payload = {
  source: "google" | "manual" | "none";
  reviews: Review[];
  rating?: number | null;
  reviewCount?: number | null;
  profileUrl?: string | null;
};

/**
 * Real customer reviews, shown word for word (per client, 2026-10-23).
 *
 * Nothing here is written by us and nothing is edited: the text is printed as
 * the customer typed it, including their spelling. Each review carries the
 * reviewer's name and links to the Google profile so anyone can check it.
 *
 * Renders nothing at all when there are no real reviews to show — no
 * skeletons, no sample quotes. An empty section is honest; a fabricated one
 * is a false representation under the Competition Act and risks the Business
 * Profile itself.
 */
export default function ReviewsSection() {
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

  return (
    <section style={{ background: "#F7F7F8", padding: "88px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <span className="eyebrow" style={{ color: "#B30F14" }}>{REVIEWS_SECTION.eyebrow}</span>
          <h2 style={{
            fontFamily: "Poppins, sans-serif", fontWeight: 600,
            fontSize: "clamp(1.75rem,3.5vw,2.5rem)", letterSpacing: "-0.022em",
            color: "#161616", margin: "8px 0 10px",
          }}>
            {REVIEWS_SECTION.heading}
          </h2>
          <p style={{ color: "#6B6B6B", fontFamily: "Kodchasan, sans-serif", maxWidth: "54ch", margin: "0 auto" }}>
            {REVIEWS_SECTION.blurb}
          </p>

          {data.rating != null && data.reviewCount != null && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16 }}>
              <GoogleG size={16} />
              <strong style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#161616" }}>
                {Number(data.rating).toFixed(1)}
              </strong>
              <Stars value={Number(data.rating)} />
              <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem", color: "#6B6B6B" }}>
                from {data.reviewCount} Google reviews
              </span>
            </div>
          )}
        </div>

        {/* Columns follow the count: four reviews in a three-column grid
            leaves a lone card on its own row, which reads like something
            failed to load. */}
        <div
          className="reviews-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${data.reviews.length === 4 ? 2 : Math.min(3, data.reviews.length)},1fr)`,
            gap: 18,
            alignItems: "start",
            maxWidth: data.reviews.length <= 2 ? 760 : undefined,
            margin: data.reviews.length <= 2 ? "0 auto" : undefined,
          }}
        >
          {data.reviews.map((r, i) => (
            <article
              key={`${r.author}-${i}`}
              style={{
                background: "#FFFFFF", border: "1px solid rgba(20,20,20,0.08)",
                borderRadius: 18, padding: "24px 24px 20px",
                display: "flex", flexDirection: "column", gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <Stars value={r.rating} />
                <GoogleG size={15} />
              </div>

              {/* The review itself. Printed exactly as written — whiteSpace
                  preserves the reviewer's own line breaks. */}
              <p style={{
                fontFamily: "Kodchasan, sans-serif", fontSize: "0.95rem",
                color: "#161616", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap",
              }}>
                {r.text}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", paddingTop: 6 }}>
                {r.photoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={r.photoUrl} alt="" width={32} height={32} style={{ borderRadius: "50%", flexShrink: 0 }} referrerPolicy="no-referrer" />
                  : <Initial name={r.author} />}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#161616", margin: 0 }}>
                    {r.author}
                  </p>
                  {r.relativeTime && (
                    <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#8C8C8C", margin: 0 }}>
                      {r.relativeTime}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {data.profileUrl && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a
              href={data.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem",
                color: "#161616", padding: "12px 24px", borderRadius: 120,
                border: "1.5px solid rgba(20,20,20,0.16)", textDecoration: "none",
              }}
            >
              <GoogleG size={15} /> Read all our reviews on Google
            </a>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) { .reviews-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 620px) { .reviews-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span style={{ display: "inline-flex", gap: 1 }} aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map(i => {
        const lit = i < full || (i === full && half);
        return <Star key={i} size={14} color={lit ? "#F5A623" : "#D4D4D8"} fill={lit ? "#F5A623" : "none"} strokeWidth={2} />;
      })}
    </span>
  );
}

function Initial({ name }: { name: string }) {
  return (
    <span style={{
      width: 32, height: 32, borderRadius: "50%", background: "#F2F2F2",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.85rem",
      color: "#6B6B6B", flexShrink: 0,
    }}>
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}

function GoogleG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.0 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.0 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37.1 40.2 44 35 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
