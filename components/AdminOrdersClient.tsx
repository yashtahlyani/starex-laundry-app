"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import { StatusBadge, PaymentBadge, fmtSlot } from "./OrderBits";
import AppOrderDrawer, { type DrawerOrder } from "./AppOrderDrawer";
import { getDeliveryRequest } from "@/lib/deliveryRequest";
import { orderCodeColor } from "@/lib/orderCode";
import { calculateHst } from "@/lib/pricing";

const ease = [0.25, 0.4, 0.25, 1] as const;

// Header and rows have to stay in lockstep — they're two separate grids
// drawn to look like one table.
const COLUMNS = "1.3fr 1.1fr 0.9fr 0.8fr 0.9fr auto";

type AdminOrder = DrawerOrder;

export function AdminIncomingSection({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [selected,     setSelected]     = useState<DrawerOrder | null>(null);

  if (orders.length === 0) return null;

  async function accept(o: AdminOrder) {
    const res = await fetch(`/api/orders/${encodeURIComponent(o.code)}/acknowledge`, { method: "POST" });
    if (!res.ok) return; // leave it as-is so staff can retry rather than losing it silently
    setAcknowledged(prev => new Set([...prev, o.id]));
    router.refresh();
  }

  // Confirming an order no longer removes its card. The order is booked but
  // still sitting at the customer's door until a driver collects it, so it
  // stays in this list until pickup (per client, 2026-11-06) and only
  // changes appearance. `acknowledged` is the optimistic local echo, so the
  // card settles the moment it is clicked rather than after the refresh.
  const visible = orders;
  const needsConfirming = (o: AdminOrder) => o.is_new !== false && !acknowledged.has(o.id);
  const unconfirmed = visible.filter(needsConfirming).length;

  return (
    <>
      <AnimatePresence>
        {visible.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 28 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              {/* The dot pulses only while something still needs a look. A
                  permanently pulsing marker stops meaning anything. */}
              {unconfirmed > 0 ? (
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ width: 9, height: 9, borderRadius: "50%", background: "#ED1D24", flexShrink: 0 }} />
              ) : (
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#16A34A", flexShrink: 0 }} />
              )}
              <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#161616" }}>
                New orders — awaiting pickup
              </h2>
              <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "#6B6B6B" }}>
                {unconfirmed > 0
                  ? `${unconfirmed} need${unconfirmed === 1 ? "s" : ""} confirming`
                  : "all confirmed — waiting on collection"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
              {visible.map(o => {
                const pending = needsConfirming(o);
                return (
                <motion.div key={o.id} layout initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{
                    background: "#fff", borderRadius: 16, padding: "20px",
                    // Red and raised while it needs attention; calm once
                    // confirmed, so a glance separates the two without
                    // either disappearing.
                    border: pending ? "2px solid #ED1D24" : "1.5px solid #E4E4E7",
                    boxShadow: pending ? "0 6px 24px rgba(184,50,79,0.22)" : "none",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1rem", color: orderCodeColor(o.code).text }}>{o.code}</span>
                    <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#A1A1AA" }}>{o.date} · {o.time_slot}</span>
                  </div>
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem", color: "#6B6B6B", marginBottom: 2 }}>
                    {o.customer_name ?? "—"} · {o.service_title ?? o.service}
                  </p>
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#8C8C8C", marginBottom: 14 }}>{o.address}</p>
                  {!pending && (
                    <p style={{
                      display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12,
                      background: "rgba(22,163,74,0.08)", color: "#15803D", borderRadius: 999,
                      padding: "5px 11px", fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem",
                    }}>
                      <Check size={12} /> Confirmed · waiting for pickup
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    {pending && (
                      <button onClick={() => accept(o)} className="btn-primary" style={{ flex: 1, padding: "10px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <Check size={14} /> Confirm
                      </button>
                    )}
                    <button onClick={() => setSelected(o)} className="btn-ghost" style={{ flex: pending ? undefined : 1, padding: "10px 16px", fontSize: "0.85rem" }}>
                      {pending ? "Details" : "Open order"}
                    </button>
                  </div>
                </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AppOrderDrawer order={selected} onClose={() => setSelected(null)} admin />
    </>
  );
}

export function AdminOrderTable({ orders }: { orders: AdminOrder[] }) {
  const [selected, setSelected] = useState<DrawerOrder | null>(null);

  return (
    <>
      <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: COLUMNS, gap: 16, padding: "12px 22px", background: "#FAFAFA", borderBottom: "1px solid #F0F0F0" }} className="admin-th">
          {["Order", "Customer", "Status", "Amount", "Payment", ""].map((h, i) => (
            <span key={i} style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#A1A1AA" }}>{h}</span>
          ))}
        </div>
        {orders.length === 0 && (
          <p style={{ padding: "40px", textAlign: "center", fontFamily: "Kodchasan, sans-serif", color: "#A1A1AA" }}>No orders in this view.</p>
        )}
        {orders.map((o, i) => (
          <button key={o.id} onClick={() => setSelected(o)} style={{
            width: "100%", display: "grid", gridTemplateColumns: COLUMNS, gap: 16, alignItems: "center",
            padding: "16px 22px",
            borderBottom: i < orders.length - 1 ? "1px solid #F4F4F5" : "none",
            borderLeft: "none", borderRight: "none", borderTop: "none",
            background: o.status === "placed" ? "#F0FFF7" : "none",
            cursor: "pointer", textAlign: "left",
          }} className="admin-tr">
            <div>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.88rem", color: orderCodeColor(o.code).text }}>
                {o.code}
                {o.status === "placed" && <span style={{ color: "#B30F14" }}> •</span>}
              </p>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.76rem", color: "#A1A1AA" }}>
                {o.service_title ?? o.service} · {o.date}
              </p>
            </div>
            <div>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem", color: "#161616", fontWeight: 500 }}>{o.customer_name ?? "—"}</p>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.76rem", color: "#A1A1AA" }}>{o.phone ?? o.email ?? ""}</p>
              {/* The delivery window the customer asked for when they paid,
                  readable straight down the list. It was only inside the
                  order's notes, so the owner was messaging customers to ask
                  for a time they had already given (per client, 2026-10-18). */}
              {getDeliveryRequest((o as any).status_history) && (
                <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#B30F14", fontWeight: 600, marginTop: 2 }}>
                  Wants: {getDeliveryRequest((o as any).status_history)}
                </p>
              )}
            </div>
            <StatusBadge status={o.status} size="sm" pulse={!["delivered","cancelled"].includes(o.status)} />
            {/* The confirmed total, visible without opening the order — the
                owner needs to read amounts down the list (and off a printed
                manifest), not one drawer at a time (per client, 2026-09-25).
                Shown tax-inclusive, since that's what's actually charged. */}
            <div>
              {o.price != null ? (
                <>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#161616" }}>
                    ${calculateHst(Number(o.price)).total.toFixed(2)}
                  </p>
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#A1A1AA" }}>
                    incl. HST
                  </p>
                </>
              ) : (
                <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#C0C0C0" }}>—</p>
              )}
            </div>
            <PaymentBadge status={o.payment_status} size="sm" />
            <ChevronRight size={16} color="#C0C0C0" />
          </button>
        ))}
      </div>
      <AppOrderDrawer order={selected} onClose={() => setSelected(null)} admin />
    </>
  );
}
