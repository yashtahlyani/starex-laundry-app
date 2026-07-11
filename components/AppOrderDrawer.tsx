"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, MapPin, CalendarClock, ArrowRight, Star } from "lucide-react";
import { StatusBadge, ProgressTrack, NEXT_STATUS, STATUS_META, ORDER_STAGES, fmtSlot } from "./OrderBits";

const ease = [0.25, 0.4, 0.25, 1] as const;

const SERVICE_LABELS: Record<string, string> = {
  "wash-fold": "Wash & Fold",
  "dry-clean": "Dry Cleaning",
  ironing: "Ironing",
  alteration: "Alteration",
};

export type DrawerOrder = {
  id: string;
  order_code: string;
  service_type: string;
  status: string;
  pickup_address: string;
  pickup_slot_start: string;
  created_at: string;
  notes?: string | null;
};

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color="#52525B" />
      </div>
      <div>
        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#A1A1AA", fontWeight: 700 }}>{label}</p>
        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.9rem", color: "#09090B", fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}

export default function AppOrderDrawer({
  order,
  onClose,
  admin = false,
}: {
  order: DrawerOrder | null;
  onClose: () => void;
  admin?: boolean;
}) {
  const [advancing, setAdvancing] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const currentStatus = localStatus ?? order?.status ?? "scheduled";
  const nextStatusId = NEXT_STATUS[currentStatus] ?? null;
  const nextLabel = nextStatusId ? STATUS_META[nextStatusId]?.label : null;

  async function handleAdvance() {
    if (!order || !nextStatusId) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.order_code)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatusId }),
      });
      if (res.ok) setLocalStatus(nextStatusId);
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(9,9,11,0.5)", backdropFilter: "blur(3px)", zIndex: 1000 }}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              width: "min(460px, 100vw)", zIndex: 1001,
              background: "#FFFFFF", boxShadow: "-10px 0 40px rgba(0,0,0,0.15)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ background: "#111921", padding: "24px 28px", position: "relative" }}>
              <button onClick={onClose} style={{
                position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.08)", border: "none",
                borderRadius: 8, width: 34, height: 34, cursor: "pointer", color: "rgba(255,255,255,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><X size={17} /></button>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#78EDB2", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                {SERVICE_LABELS[order.service_type] ?? order.service_type}
              </p>
              <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.6rem", color: "#fff", letterSpacing: "-0.02em", marginBottom: 12 }}>
                Order {order.order_code}
              </h3>
              <StatusBadge status={currentStatus} pulse={currentStatus !== "delivered" && currentStatus !== "cancelled"} />
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#71717A", marginBottom: 16 }}>Progress</p>

              {/* Vertical timeline */}
              <div style={{ position: "relative" }}>
                {ORDER_STAGES.map((s, i) => {
                  const current = ["scheduled","picked_up","in_progress","ready","out_for_delivery","delivered"].indexOf(currentStatus);
                  const done = i <= current;
                  const active = i === current;
                  return (
                    <div key={s.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, position: "relative", paddingBottom: i < ORDER_STAGES.length - 1 ? 22 : 0 }}>
                      {i < ORDER_STAGES.length - 1 && (
                        <div style={{ position: "absolute", left: 19, top: 40, bottom: 0, width: 2, background: i < current ? "#78EDB2" : "#E4E4E7" }} />
                      )}
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%", zIndex: 1,
                        background: done ? "linear-gradient(180deg,#C9F8DE,#78EDB2)" : "#F4F4F5",
                        border: active ? "3px solid #C9F8DE" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: active ? "0 0 0 4px rgba(120,237,178,0.2)" : "none",
                        fontSize: "0.85rem",
                      }}>
                        {done && !active ? "✓" : active ? "●" : ""}
                      </div>
                      <div style={{ paddingTop: 8 }}>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: done ? "#09090B" : "#A1A1AA" }}>
                          {s.label}
                          {active && <span style={{ color: "#4ECDA0", fontSize: "0.8rem", fontWeight: 400 }}> · in progress</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ height: 1, background: "#F0F0F0", margin: "24px 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Row icon={CalendarClock} label="Pickup window" value={fmtSlot(order.pickup_slot_start)} />
                <Row icon={MapPin} label="Pickup address" value={order.pickup_address} />
                <Row icon={Package} label="Notes" value={order.notes ?? null} />
              </div>
            </div>

            {/* Footer */}
            {admin && nextStatusId && (
              <div style={{ padding: "16px 28px", borderTop: "1px solid #F0F0F0", background: "#FAFAFA" }}>
                <button
                  onClick={handleAdvance}
                  disabled={advancing}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 120, border: "none", cursor: "pointer",
                    background: advancing ? "#E4E4E7" : "#111921", color: advancing ? "#A1A1AA" : "#fff",
                    fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {advancing ? "Updating…" : `Advance to: ${nextLabel}`}
                  {!advancing && <ArrowRight size={16} />}
                </button>
              </div>
            )}
            {admin && !nextStatusId && (
              <div style={{ padding: "16px 28px", borderTop: "1px solid #F0F0F0" }}>
                <p style={{ textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#15803D", padding: "10px" }}>✓ Order completed &amp; delivered</p>
              </div>
            )}
            {!admin && (
              <div style={{ padding: "16px 28px", borderTop: "1px solid #F0F0F0" }}>
                <a href={`/order?code=${order.order_code}`} className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}>
                  Track live <ArrowRight size={15} />
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
