"use client";

import { motion } from "framer-motion";
import { Check, Package, Truck, Sparkles, CheckCircle, MapPin, PartyPopper } from "lucide-react";

export const ORDER_STAGES = [
  { id: "scheduled",        label: "Order placed" },
  { id: "picked_up",        label: "Picked up" },
  { id: "in_progress",      label: "Cleaning" },
  { id: "ready",            label: "Ready" },
  { id: "out_for_delivery", label: "On the way" },
  { id: "delivered",        label: "Delivered" },
];

export const STAGE_INDEX: Record<string, number> = {
  scheduled: 0, picked_up: 1, in_progress: 2,
  ready: 3, out_for_delivery: 4, delivered: 5, cancelled: -1,
};

export const NEXT_STATUS: Record<string, string | null> = {
  scheduled:        "picked_up",
  picked_up:        "in_progress",
  in_progress:      "ready",
  ready:            "out_for_delivery",
  out_for_delivery: "delivered",
  delivered:        null,
  cancelled:        null,
};

export const STATUS_META: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
  scheduled:        { label: "Scheduled",        bg: "#EAEDf9", fg: "#4338CA", dot: "#6366F1" },
  picked_up:        { label: "Picked up",         bg: "#EAEDf9", fg: "#6D28D9", dot: "#8B5CF6" },
  in_progress:      { label: "Being cleaned",     bg: "#D1F9E3", fg: "#047857", dot: "#4ECDA0" },
  ready:            { label: "Ready",             bg: "#FDF1E1", fg: "#B45309", dot: "#F59E0B" },
  out_for_delivery: { label: "Out for delivery",  bg: "#D1F9E3", fg: "#065F46", dot: "#10B981" },
  delivered:        { label: "Delivered",         bg: "#DCFCE7", fg: "#15803D", dot: "#22C55E" },
  cancelled:        { label: "Cancelled",         bg: "#FEE2E2", fg: "#991B1B", dot: "#EF4444" },
};

export function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtSlot(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export function StatusBadge({ status, pulse = false, size = "md" }: { status: string; pulse?: boolean; size?: "sm" | "md" }) {
  const m = STATUS_META[status] ?? STATUS_META.scheduled;
  const pad = size === "sm" ? "3px 10px" : "5px 13px";
  const fs = size === "sm" ? "0.72rem" : "0.8rem";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: m.bg, color: m.fg, borderRadius: 999, padding: pad,
      fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: fs, whiteSpace: "nowrap",
    }}>
      <motion.span
        animate={pulse ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{ width: 7, height: 7, borderRadius: "50%", background: m.dot, flexShrink: 0 }}
      />
      {m.label}
    </span>
  );
}

export function ProgressTrack({ status }: { status: string }) {
  const current = STAGE_INDEX[status] ?? 0;
  const stages = ORDER_STAGES;
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
      {stages.map((s, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={s.id} style={{ flex: i === 0 ? "0 0 auto" : 1, display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <div style={{ flex: 1, height: 3, background: done ? "#78EDB2" : "#E4E4E7", transition: "background .4s", minWidth: 8 }} />
            )}
            <motion.div
              animate={{ scale: active ? [1, 1.18, 1] : 1 }}
              transition={{ duration: 1.2, repeat: active ? Infinity : 0, repeatDelay: 1.5 }}
              style={{
                width: active ? 26 : 20, height: active ? 26 : 20, borderRadius: "50%", flexShrink: 0,
                background: done ? "linear-gradient(180deg,#C9F8DE,#78EDB2)" : "#EDEDED",
                border: active ? "3px solid #C9F8DE" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {done && i < current && <Check size={11} color="#0a3547" strokeWidth={3} />}
              {active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0a3547" }} />}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
