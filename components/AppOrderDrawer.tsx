"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, MapPin, CalendarClock, ArrowRight, AlertTriangle } from "lucide-react";
import { StatusBadge, ProgressTrack, NEXT_STATUS, STATUS_META } from "./OrderBits";
import { getItemTracking } from "@/lib/itemTracking";
import { orderCodeColor } from "@/lib/orderCode";

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
  status_history?: { status: string; itemCount?: number }[];
};

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color="#6B6B6B" />
      </div>
      <div>
        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#A1A1AA", fontWeight: 700 }}>{label}</p>
        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.9rem", color: "#161616", fontWeight: 500 }}>{value}</p>
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
  const router = useRouter();
  const [advancing, setAdvancing] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [localTracking, setLocalTracking] = useState<{ received?: number; returned?: number } | null>(null);
  const [pendingCount, setPendingCount] = useState<string>("");
  const [pendingWeight, setPendingWeight] = useState<string>("");
  const [countError, setCountError] = useState<string | null>(null);

  const currentStatus = localStatus ?? order?.status ?? "placed";
  const nextStatusId = NEXT_STATUS[currentStatus] ?? null;
  const nextLabel = nextStatusId ? STATUS_META[nextStatusId]?.label : null;
  const needsCount = nextStatusId === "picked_up" || nextStatusId === "delivered";

  const tracking = order ? getItemTracking(order.status_history as any) : { received: null, returned: null, missing: null };
  const received = localTracking?.received ?? tracking.received;
  const returned = localTracking?.returned ?? tracking.returned;
  const missing = received != null && returned != null ? received - returned : null;

  async function handleAdvance() {
    if (!order || !nextStatusId) return;

    let itemCount: number | undefined;
    if (needsCount) {
      if (!pendingCount.trim()) { setCountError("Enter an item count"); return; }
      itemCount = parseInt(pendingCount, 10);
      if (isNaN(itemCount) || itemCount < 0) { setCountError("Enter a valid item count"); return; }
    }

    setAdvancing(true);
    setCountError(null);
    try {
      const res = await fetch(`/api/orders/${order.code}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatusId, note: null,
          itemCount,
          weight: nextStatusId === "picked_up" ? (pendingWeight.trim() || undefined) : undefined,
        }),
      });
      if (res.ok) {
        setLocalStatus(nextStatusId);
        if (itemCount != null) {
          setLocalTracking((prev) => nextStatusId === "picked_up"
            ? { ...prev, received: itemCount }
            : { ...prev, returned: itemCount });
        }
        setPendingCount(""); setPendingWeight("");
        // Without this, the order list/KPIs behind the drawer stay stale until
        // a manual page reload — the drawer itself updates via local state,
        // but nothing tells the server-rendered page underneath to refetch.
        router.refresh();
      }
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
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#161616" }}>
                  {order.service_title ?? SERVICE_LABELS[order.service] ?? order.service}
                  <span style={{ color: orderCodeColor(order.code).text, fontWeight: 600 }}> · {order.code}</span>
                </p>
                <StatusBadge status={currentStatus} pulse={!["delivered","cancelled"].includes(currentStatus)} size="sm" />
              </div>
              <button onClick={onClose} style={{ background: "#F4F4F5", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} color="#6B6B6B" />
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

              {admin && (received != null || returned != null) && (
                <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 12, background: missing ? "#FEF2F2" : "#F4F4F5", border: missing ? "1px solid #FCA5A5" : "none" }}>
                  {missing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <AlertTriangle size={15} color="#DC2626" />
                      <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#DC2626" }}>
                        {missing} item{missing !== 1 ? "s" : ""} missing
                      </p>
                    </div>
                  ) : null}
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8125rem", color: "#6B6B6B" }}>
                    Received: <strong style={{ color: "#161616" }}>{received ?? "—"}</strong>
                    {" · "}Returned: <strong style={{ color: "#161616" }}>{returned ?? "—"}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "20px 28px", borderTop: "1px solid #F4F4F5", display: "flex", flexDirection: "column", gap: 10 }}>
              {admin && nextLabel && needsCount && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
                  <input
                    type="number" min={0} inputMode="numeric"
                    placeholder={nextStatusId === "picked_up" ? "Items received from customer" : "Items returned to customer"}
                    value={pendingCount}
                    onChange={e => setPendingCount(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}
                  />
                  {nextStatusId === "picked_up" && (
                    <input
                      type="text" placeholder="Weight (optional, e.g. 8.2 lbs)"
                      value={pendingWeight}
                      onChange={e => setPendingWeight(e.target.value)}
                      style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}
                    />
                  )}
                  {countError && <p style={{ color: "#DC2626", fontSize: "0.8rem", fontFamily: "Kodchasan, sans-serif" }}>{countError}</p>}
                </div>
              )}
              {admin && nextLabel && (
                <button
                  onClick={handleAdvance} disabled={advancing}
                  style={{
                    width: "100%", padding: "13px", background: advancing ? "#A1A1AA" : "#161616",
                    color: "#fff", border: "none", borderRadius: 120, cursor: advancing ? "not-allowed" : "pointer",
                    fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {advancing ? "Updating…" : currentStatus === "payment_pending"
                    ? <>Complete Payment &amp; Mark Delivered <ArrowRight size={15} /></>
                    : <>Mark as {nextLabel} <ArrowRight size={15} /></>}
                </button>
              )}
              {!admin && !["delivered","cancelled"].includes(currentStatus) && (
                <a href="/contact" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px", background: "#F4F4F5", color: "#161616",
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
