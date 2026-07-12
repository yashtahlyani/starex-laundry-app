"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const ORDER_STAGES = [
  { id: "placed",           label: "Order placed" },
  { id: "confirmed",        label: "Confirmed" },
  { id: "picked_up",        label: "Picked up" },
  { id: "washing",          label: "Cleaning" },
  { id: "folding",          label: "Folding" },
  { id: "out_for_delivery", label: "On the way" },
  { id: "delivered",        label: "Delivered" },
];

export const STAGE_INDEX: Record<string, number> = {
  placed: 0, confirmed: 1, picked_up: 2,
  washing: 3, folding: 4, out_for_delivery: 5, delivered: 6, cancelled: -1,
};

export const NEXT_STATUS: Record<string, string | null> = {
  placed:           "confirmed",
  confirmed:        "picked_up",
  picked_up:        "washing",
  washing:          "folding",
  folding:          "out_for_delivery",
  out_for_delivery: "delivered",
  delivered:        null,
  cancelled:        null,
};

export const STATUS_META: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
  placed:           { label: "Order placed",     bg: "#EAEDf9", fg: "#4338CA", dot: "#6366F1" },
  confirmed:        { label: "Confirmed",         bg: "#FDF1E1", fg: "#B45309", dot: "#F59E0B" },
  picked_up:        { label: "Picked up",         bg: "#EDE9FE", fg: "#6D28D9", dot: "#8B5CF6" },
  washing:          { label: "Being cleaned",     bg: "#D1F9E3", fg: "#047857", dot: "#4ECDA0" },
  folding:          { label: "Folding",           bg: "#FEF3C7", fg: "#92400E", dot: "#D97706" },
  out_for_delivery: { label: "Out for delivery",  bg: "#D1F9E3", fg: "#065F46", dot: "#10B981" },
  delivered:        { label: "Delivered",         bg: "#DCFCE7", fg: "#15803D", dot: "#22C55E" },
  cancelled:        { label: "Cancelled",         bg: "#FEE2E2", fg: "#991B1B", dot: "#EF4444" },
};

export function fmtSlot(val: string) {
  if (!val) return "—";
  if (isNaN(Date.parse(val))) return val; // already human-readable
  return new Date(val).toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export function StatusBadge({ status, pulse = false, size = "md" }: { status: string; pulse?: boolean; size?: "sm" | "md" }) {
  const m = STATUS_META[status] ?? STATUS_META.placed;
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
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {ORDER_STAGES.map((s, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < ORDER_STAGES.length - 1 ? 1 : undefined }}>
            <motion.div
              animate={{ background: done ? "#4ECDA0" : "#E4E4E7", scale: active ? 1.15 : 1 }}
              transition={{ duration: 0.3 }}
              style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              {done && <Check size={10} color="#fff" strokeWidth={3} />}
            </motion.div>
            {i < ORDER_STAGES.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done && i < current ? "#4ECDA0" : "#E4E4E7", margin: "0 2px", transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
