"use client";

// Last-resort boundary for errors thrown in the root layout itself (where the
// normal error.tsx can't render because the layout failed). Must ship its own
// <html>/<body>. Kept dependency-free and inline-styled for exactly that reason.
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", background: "#FFFFFF", color: "#161616" }}>
        <div style={{ textAlign: "center", padding: "0 24px", maxWidth: 420 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: "#6B6B6B", marginBottom: 28, lineHeight: 1.6 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ background: "#B8324F", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
