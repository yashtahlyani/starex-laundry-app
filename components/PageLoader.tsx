"use client";

import { useEffect, useState } from "react";
import { BUSINESS_NAME } from "@/lib/pricing";

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1800);
    const hideTimer = setTimeout(() => setVisible(false), 2350);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-hero-gradient transition-opacity duration-500"
      style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? "none" : "all" }}
    >
      {/* Washing machine */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer housing */}
        <div className="relative h-36 w-36">
          {/* Machine body */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-slate-700 to-slate-800 shadow-2xl border border-white/10" />

          {/* Door ring */}
          <div className="absolute inset-3 rounded-2xl bg-gradient-to-b from-slate-600 to-slate-700 border border-white/5" />

          {/* Porthole glass */}
          <div className="absolute inset-5 rounded-full bg-brand-900/80 border-4 border-slate-500 overflow-hidden shadow-inner">
            {/* Drum rotation outer */}
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed border-white/10"
              style={{ animation: "drum-spin 2s linear infinite" }}
            />

            {/* Water */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-full"
              style={{
                background: "linear-gradient(to top, rgba(14,165,233,0.35) 0%, rgba(56,189,248,0.15) 100%)",
                animation: "water-fill 1.5s ease-in-out infinite",
              }}
            />

            {/* Clothes orbiting */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[
                { cls: "cloth-1", color: "#60a5fa" },
                { cls: "cloth-2", color: "#f472b6" },
                { cls: "cloth-3", color: "#34d399" },
                { cls: "cloth-4", color: "#fbbf24" },
              ].map(({ cls, color }) => (
                <div
                  key={cls}
                  className={`absolute h-4 w-4 rounded-sm shadow-sm ${cls}`}
                  style={{ backgroundColor: color, opacity: 0.9 }}
                />
              ))}
            </div>

            {/* Center drum hole */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-slate-700/80 border border-white/20 shadow-inner" />
            </div>

            {/* Bubbles */}
            {[
              { cls: "bubble-1", left: "20%", size: 5 },
              { cls: "bubble-2", left: "55%", size: 4 },
              { cls: "bubble-3", left: "75%", size: 3 },
            ].map(({ cls, left, size }) => (
              <div
                key={cls}
                className={`absolute bottom-3 rounded-full bg-white/30 border border-white/50 ${cls}`}
                style={{ left, width: size, height: size }}
              />
            ))}
          </div>

          {/* Control dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="loading-dot-1 h-1.5 w-1.5 rounded-full bg-brand-accent" />
            <div className="loading-dot-2 h-1.5 w-1.5 rounded-full bg-brand-accent" />
            <div className="loading-dot-3 h-1.5 w-1.5 rounded-full bg-brand-accent" />
          </div>
        </div>
      </div>

      {/* Brand */}
      <p className="text-white text-2xl font-bold tracking-tight mb-2">{BUSINESS_NAME}</p>
      <p className="text-white/50 text-sm tracking-wide">Getting your laundry ready…</p>
    </div>
  );
}
