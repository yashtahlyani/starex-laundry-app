"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import { StatusBadge, fmtSlot } from "./OrderBits";
import AppOrderDrawer, { type DrawerOrder } from "./AppOrderDrawer";

const ease = [0.25, 0.4, 0.25, 1] as const;

type AdminOrder = DrawerOrder;

export function AdminIncomingSection({ orders }: { orders: AdminOrder[] }) {
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [selected,     setSelected]     = useState<DrawerOrder | null>(null);

  if (orders.length === 0) return null;

  async function accept(o: AdminOrder) {
    await fetch(`/api/orders/${encodeURIComponent(o.code)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });
    setAcknowledged(prev => new Set([...prev, o.id]));
  }

  const visible = orders.filter(o => !acknowledged.has(o.id));

  return (
    <>
      <AnimatePresence>
        {visible.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 28 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 9, height: 9, borderRadius: "50%", background: "#CB3E5E", flexShrink: 0 }} />
              <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#241619" }}>
                New orders — need your confirmation
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
              {visible.map(o => (
                <motion.div key={o.id} layout initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ background: "#fff", border: "2px solid #CB3E5E", borderRadius: 16, padding: "20px", boxShadow: "0 6px 24px rgba(203,62,94,0.22)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#241619" }}>{o.code}</span>
                    <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#A1A1AA" }}>{o.date} · {o.time_slot}</span>
                  </div>
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem", color: "#6E5F5C", marginBottom: 2 }}>
                    {o.customer_name ?? "—"} · {o.service_title ?? o.service}
                  </p>
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#8A7B77", marginBottom: 14 }}>{o.address}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => accept(o)} className="btn-primary" style={{ flex: 1, padding: "10px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Check size={14} /> Confirm
                    </button>
                    <button onClick={() => setSelected(o)} className="btn-ghost" style={{ padding: "10px 16px", fontSize: "0.85rem" }}>Details</button>
                  </div>
                </motion.div>
              ))}
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
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr 1fr auto", gap: 16, padding: "12px 22px", background: "#FAFAFA", borderBottom: "1px solid #F0F0F0" }} className="admin-th">
          {["Order", "Customer", "Status", ""].map((h, i) => (
            <span key={i} style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#A1A1AA" }}>{h}</span>
          ))}
        </div>
        {orders.length === 0 && (
          <p style={{ padding: "40px", textAlign: "center", fontFamily: "Kodchasan, sans-serif", color: "#A1A1AA" }}>No orders in this view.</p>
        )}
        {orders.map((o, i) => (
          <button key={o.id} onClick={() => setSelected(o)} style={{
            width: "100%", display: "grid", gridTemplateColumns: "1.4fr 1.2fr 1fr auto", gap: 16, alignItems: "center",
            padding: "16px 22px",
            borderBottom: i < orders.length - 1 ? "1px solid #F4F4F5" : "none",
            borderLeft: "none", borderRight: "none", borderTop: "none",
            background: o.status === "placed" ? "#F0FFF7" : "none",
            cursor: "pointer", textAlign: "left",
          }} className="admin-tr">
            <div>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "#241619" }}>
                {o.code}
                {o.status === "placed" && <span style={{ color: "#A82F4B" }}> •</span>}
              </p>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.76rem", color: "#A1A1AA" }}>
                {o.service_title ?? o.service} · {o.date}
              </p>
            </div>
            <div>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem", color: "#241619", fontWeight: 500 }}>{o.customer_name ?? "—"}</p>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.76rem", color: "#A1A1AA" }}>{o.phone ?? o.email ?? ""}</p>
            </div>
            <StatusBadge status={o.status} size="sm" pulse={!["delivered","cancelled"].includes(o.status)} />
            <ChevronRight size={16} color="#C0C0C0" />
          </button>
        ))}
      </div>
      <AppOrderDrawer order={selected} onClose={() => setSelected(null)} admin />
    </>
  );
}
