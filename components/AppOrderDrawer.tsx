"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, MapPin, CalendarClock, ArrowRight } from "lucide-react";
import { StatusBadge, ProgressTrack, NEXT_STATUS, STATUS_META } from "./OrderBits";

const ease = [0.25, 0.4, 0.25, 1] as const;

const SERVICE_LABELS: Record<string, string> = {
  "wash-fold": "Wash & Fold",
  "express":   "Same-Day Express",
  "dry-clean": "Dry Cleaning",
  ironing:     "Ironing",
  household:   "Household Items",
  detailing:   "Car & Sofa Detailing",
};

// Matches the freshdrop orders schema
export type DrawerOrder = {
  id: string;
  code: string;
  service: string;
  service_title?: string;
  status: string;
  address: string;
  date: string;
  time_slot: string;
  created_at: string;
  notes?: string | null;
  weight?: string | null;
  price?: number | null;
  rating?: number | null;
  customer_name?: string;
  email?: string;
  phone?: string;
};

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color="#6B6360" />
      </div>
      <div>
        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#A1A1AA", fontWeight: 700 }}>{label}</p>
        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.9rem", color: "#1F1B1B", fontWeight: 500 }}>{value}</p>
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

  const currentStatus = localStatus ?? order?.status ?? "placed";
  const nextStatusId = NEXT_STATUS[currentStatus] ?? null;
  const nextLabel = nextStatusId ? STATUS_META[nextStatusId]?.label : null;

  async function handleAdvance() {
    if (!order || !nextStatusId) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/orders/${order.code}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatusId, note: null }),
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
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500, backdropFilter: "blur(2px)" }}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0,
              width: "min(480px, 100vw)", background: "#fff",
              zIndex: 501, display: "flex", flexDirection: "column",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
            }}
          >
            {/* Header */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #F4F4F5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#1F1B1B" }}>
                  {order.service_title ?? SERVICE_LABELS[order.service] ?? order.service}
                  <span style={{ color: "#A1A1AA", fontWeight: 400 }}> · {order.code}</span>
                </p>
                <StatusBadge status={currentStatus} pulse={!["delivered","cancelled"].includes(currentStatus)} size="sm" />
              </div>
              <button onClick={onClose} style={{ background: "#F4F4F5", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} color="#6B6360" />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: 12 }}>Progress</p>
                <ProgressTrack status={currentStatus} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Row icon={MapPin} label="Pickup address" value={order.address} />
                <Row icon={CalendarClock} label="Pickup date" value={order.date} />
                <Row icon={CalendarClock} label="Time slot" value={order.time_slot} />
                {order.weight && order.weight !== "TBD" && <Row icon={Package} label="Weight" value={order.weight} />}
                {order.price != null && <Row icon={Package} label="Price" value={`$${Number(order.price).toFixed(2)}`} />}
                {order.notes && <Row icon={Package} label="Notes" value={order.notes} />}
                {admin && order.customer_name && <Row icon={Package} label="Customer" value={`${order.customer_name} · ${order.email} · ${order.phone}`} />}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "20px 28px", borderTop: "1px solid #F4F4F5", display: "flex", flexDirection: "column", gap: 10 }}>
              {admin && nextLabel && (
                <button
                  onClick={handleAdvance} disabled={advancing}
                  style={{
                    width: "100%", padding: "13px", background: advancing ? "#A1A1AA" : "#1F1B1B",
                    color: "#fff", border: "none", borderRadius: 120, cursor: advancing ? "not-allowed" : "pointer",
                    fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {advancing ? "Updating…" : <>Mark as {nextLabel} <ArrowRight size={15} /></>}
                </button>
              )}
              {!admin && !["delivered","cancelled"].includes(currentStatus) && (
                <a href="/contact" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px", background: "#F4F4F5", color: "#1F1B1B",
                  borderRadius: 120, textDecoration: "none",
                  fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.875rem",
                }}>
                  Need help with this order?
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
