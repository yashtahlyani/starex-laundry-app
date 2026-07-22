"use client";

// Route-level error boundary. If a page or client component throws at runtime,
// the customer sees this branded fallback (with a retry) instead of a raw stack
// trace or a blank screen.
import { useEffect } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface to the console/host so it's visible in Vercel logs.
    console.error(error);
  }, [error]);

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <span className="eyebrow" style={{ display: "block", marginBottom: 16, color: "#8F2740" }}>Something went wrong</span>
        <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "clamp(1.75rem,4vw,2.5rem)", letterSpacing: "-0.02em", lineHeight: 1.15, color: "#161616", marginBottom: 16 }}>
          We hit a snag.
        </h1>
        <p style={{ color: "#6B6B6B", fontSize: "1rem", lineHeight: 1.7, marginBottom: 32, fontFamily: "Kodchasan, sans-serif" }}>
          Sorry about that — an unexpected error occurred. Try again, or head back home.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={reset} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <RefreshCw size={16} /> Try again
          </button>
          <a href="/" className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Back to Home <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
