"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";

// Polls for new incoming orders every 20s and soft-refreshes the console the
// moment the count goes up, so a new booking shows up without anyone having
// to click anything. Real Postgres realtime isn't available on this project
// (see app/api/admin/new-count/route.ts), so polling is the honest substitute.
export default function AdminLivePoll({ initialCount }: { initialCount: number }) {
  const router = useRouter();
  const lastCount = useRef(initialCount);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    lastCount.current = initialCount;
  }, [initialCount]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/new-count", { cache: "no-store" });
        if (!res.ok) return;
        const { count } = await res.json();
        if (count > lastCount.current) {
          lastCount.current = count;
          setPulsing(true);
          router.refresh();
          setTimeout(() => setPulsing(false), 2000);
        }
      } catch {
        // Silent — a missed poll just means we try again in 20s.
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <span
      title="Live — checking for new orders every 20s"
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        color: pulsing ? "#B8324F" : "rgba(255,255,255,0.4)",
        transition: "color 0.3s",
      }}
    >
      <Radio size={12} style={{ animation: pulsing ? "admin-live-pulse 1s ease-in-out infinite" : "none" }} />
      <style>{`@keyframes admin-live-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </span>
  );
}
