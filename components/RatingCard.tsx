"use client";

import { useState } from "react";
import { Star, CheckCircle } from "lucide-react";

export default function RatingCard({
  orderCode, currentRating, onRated,
}: { orderCode: string; currentRating: number | null; onRated: (rating: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentRating != null) {
    return (
      <div className="card rounded-2xl p-5" style={{ display: "flex", alignItems: "center", gap: 12, background: "#F0FDF4", border: "1px solid rgba(34,197,94,0.3)" }}>
        <CheckCircle size={20} color="#16A34A" style={{ flexShrink: 0 }} />
        <div>
          <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9375rem", color: "#166534" }}>Thanks for your feedback!</p>
          <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} size={16} fill={n <= currentRating ? "#166534" : "none"} color="#166534" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  async function submit(rating: number) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderCode)}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save your rating");
      onRated(rating);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card rounded-2xl p-5">
      <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9375rem", color: "#161616", marginBottom: 4 }}>
        How was your order?
      </p>
      <p style={{ color: "#6B6B6B", fontSize: "0.8125rem", marginBottom: 14, fontFamily: "Kodchasan, sans-serif" }}>
        Tap a star to rate your experience.
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            disabled={submitting}
            onClick={() => submit(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`Rate ${n} out of 5 stars`}
            style={{ background: "none", border: "none", padding: 4, cursor: submitting ? "not-allowed" : "pointer" }}
          >
            <Star size={26} fill={hovered != null && n <= hovered ? "#B30F14" : "none"} color={hovered != null && n <= hovered ? "#B30F14" : "#D4D4D8"} />
          </button>
        ))}
      </div>
      {error && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: 10, fontFamily: "Kodchasan, sans-serif" }}>{error}</p>}
    </div>
  );
}
