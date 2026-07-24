"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, MapPin, CalendarClock, ArrowRight, AlertTriangle } from "lucide-react";
import { StatusBadge, PaymentBadge, ProgressTrack, NEXT_STATUS, STATUS_META } from "./OrderBits";
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
  stripe_payment_method_id?: string | null;
  card_brand?: string | null;
  card_last4?: string | null;
  payment_status?: "unpaid" | "paid" | null;
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
  const [localPaymentStatus, setLocalPaymentStatus] = useState<"unpaid" | "paid" | null>(null);
  const [localTracking, setLocalTracking] = useState<{ received?: number; returned?: number } | null>(null);
  const [pendingCount, setPendingCount] = useState<string>("");
  const [pendingWeight, setPendingWeight] = useState<string>("");
  const [countError, setCountError] = useState<string | null>(null);
  const [pendingPrice, setPendingPrice] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [payingWith, setPayingWith] = useState<"charge" | "manual" | null>(null);
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceSaved, setPriceSaved] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [sendingNote, setSendingNote] = useState(false);
  const [noteSent, setNoteSent] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // The drawer is a single component instance reused across every order
  // (AdminOrderTable/AdminIncomingSection just swap the `order` prop) — its
  // hooks never remounted, so without this, closing order A after advancing
  // its status/payment and opening order B would show A's leftover local
  // state (stale status, stale "Saved" banner, stale item-count fields).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setAdvancing(false);
    setLocalStatus(null);
    setLocalPaymentStatus(null);
    setLocalTracking(null);
    setPendingCount("");
    setPendingWeight("");
    setCountError(null);
    setPendingPrice("");
    setPaymentError(null);
    setPayingWith(null);
    setSavingPrice(false);
    setPriceSaved(false);
    setNoteMessage("");
    setSendingNote(false);
    setNoteSent(false);
    setNoteError(null);
  }, [order?.id]);

  const currentStatus = localStatus ?? order?.status ?? "placed";
  const paymentStatus = localPaymentStatus ?? order?.payment_status ?? "unpaid";
  const isPaid = paymentStatus === "paid";
  const nextStatusId = NEXT_STATUS[currentStatus] ?? null;
  const nextLabel = nextStatusId ? STATUS_META[nextStatusId]?.label : null;
  const needsCount = nextStatusId === "picked_up" || nextStatusId === "delivered";
  const hasCardOnFile = !!order?.stripe_payment_method_id;
  // Only once the order's actually been picked up — collecting payment or
  // setting a total before that doesn't make sense, since the final
  // weight/item count isn't known yet.
  const showPaymentPanel = admin && !isPaid && ["picked_up", "ready_for_delivery"].includes(currentStatus);

  const tracking = order ? getItemTracking(order.status_history as any) : { received: null, returned: null, missing: null };
  const received = localTracking?.received ?? tracking.received;
  const returned = localTracking?.returned ?? tracking.returned;
  const missing = received != null && returned != null ? received - returned : null;

  async function handlePayment(method: "charge" | "manual") {
    if (!order) return;
    const amount = parseFloat(pendingPrice);
    if (!pendingPrice.trim() || isNaN(amount) || amount <= 0) { setPaymentError("Enter the confirmed order total"); return; }

    setPayingWith(method);
    setPaymentError(null);
    try {
      const res = await fetch(method === "charge" ? "/api/stripe/charge" : `/api/orders/${order.code}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method === "charge" ? { orderCode: order.code, amountCad: amount } : { amountCad: amount }),
      });
      const data = await res.json();
      if (!res.ok) { setPaymentError(data.error ?? "Payment failed"); return; }

      // Both endpoints auto-advance to Delivered when the order was already
      // Ready for Delivery — reflect that here so the owner doesn't need a
      // separate "Mark as Delivered" click.
      setLocalPaymentStatus("paid");
      if (data.status) setLocalStatus(data.status);
      setPendingPrice("");
      router.refresh();
    } catch {
      setPaymentError("Payment failed — check your connection and try again");
    } finally {
      setPayingWith(null);
    }
  }

  async function handleSavePrice() {
    if (!order) return;
    const amount = parseFloat(pendingPrice);
    if (!pendingPrice.trim() || isNaN(amount) || amount <= 0) { setPaymentError("Enter the confirmed order total"); return; }

    setSavingPrice(true);
    setPaymentError(null);
    try {
      const res = await fetch(`/api/orders/${order.code}/set-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCad: amount }),
      });
      const data = await res.json();
      if (!res.ok) { setPaymentError(data.error ?? "Could not save order total"); return; }
      setPriceSaved(true);
      router.refresh();
    } catch {
      setPaymentError("Could not save order total — check your connection and try again");
    } finally {
      setSavingPrice(false);
    }
  }

  async function handleSendNote() {
    if (!order) return;
    const message = noteMessage.trim();
    if (!message) { setNoteError("Enter a message"); return; }

    setSendingNote(true);
    setNoteError(null);
    try {
      const res = await fetch(`/api/orders/${order.code}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) { setNoteError(data.error ?? "Could not send note"); return; }
      setNoteSent(true);
      setNoteMessage("");
      router.refresh();
    } catch {
      setNoteError("Could not send note — check your connection and try again");
    } finally {
      setSendingNote(false);
    }
  }

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
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <StatusBadge status={currentStatus} pulse={!["delivered","cancelled"].includes(currentStatus)} size="sm" />
                  {admin && <PaymentBadge status={paymentStatus} size="sm" />}
                </div>
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

              {/* Notify customer — for garment discrepancies or anything staff
                  need to flag (a stain that won't come out, returning an item
                  unprocessed, etc.). Independent of status: doesn't require a
                  status change, and works no matter what stage the order is
                  at. Logged into status_history so it shows in the Activity
                  Log on both this drawer and the customer's tracking page. */}
              {admin && (
                <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 12, background: "#F4F4F5" }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#161616", marginBottom: 8 }}>
                    Notify customer
                  </p>
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#8C8C8C", marginBottom: 10 }}>
                    E.g. a garment discrepancy — a stain that won&apos;t fully remove, or an item being returned unprocessed.
                  </p>
                  <textarea
                    rows={3}
                    value={noteMessage}
                    onChange={e => { setNoteMessage(e.target.value); setNoteSent(false); }}
                    placeholder="We noticed a stain on your blue shirt that couldn't be fully removed…"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: "0.85rem", fontFamily: "Kodchasan, sans-serif", background: "#fff", resize: "vertical", boxSizing: "border-box" }}
                  />
                  {noteError && <p style={{ color: "#DC2626", fontSize: "0.8rem", marginTop: 6, fontFamily: "Kodchasan, sans-serif" }}>{noteError}</p>}
                  {noteSent && <p style={{ color: "#16A34A", fontSize: "0.8rem", marginTop: 6, fontFamily: "Kodchasan, sans-serif" }}>Sent to the customer by email/WhatsApp.</p>}
                  <button
                    onClick={handleSendNote} disabled={sendingNote || !noteMessage.trim()}
                    style={{ marginTop: 10, padding: "9px 18px", background: (sendingNote || !noteMessage.trim()) ? "#A1A1AA" : "#161616", color: "#fff", border: "none", borderRadius: 10, cursor: (sendingNote || !noteMessage.trim()) ? "not-allowed" : "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.82rem" }}
                  >
                    {sendingNote ? "Sending…" : "Send Note"}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "20px 28px", borderTop: "1px solid #F4F4F5", display: "flex", flexDirection: "column", gap: 10 }}>
              {showPaymentPanel && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4, padding: "14px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12 }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#92400E" }}>Collect payment</p>
                  {hasCardOnFile && (
                    <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "#6B6B6B" }}>
                      Card on file: {order?.card_brand?.toUpperCase() ?? "card"} ending in {order?.card_last4 ?? "····"}
                    </p>
                  )}
                  <input
                    type="number" min={0} step="0.01" inputMode="decimal"
                    placeholder="Confirmed order total (CAD)"
                    value={pendingPrice}
                    onChange={e => { setPendingPrice(e.target.value); setPriceSaved(false); }}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif", background: "#fff" }}
                  />
                  {paymentError && <p style={{ color: "#DC2626", fontSize: "0.8rem", fontFamily: "Kodchasan, sans-serif" }}>{paymentError}</p>}
                  <div style={{ display: "flex", gap: 8 }}>
                    {hasCardOnFile && (
                      <button
                        onClick={() => handlePayment("charge")} disabled={payingWith !== null}
                        style={{ flex: 1, padding: "10px", background: payingWith ? "#A1A1AA" : "#161616", color: "#fff", border: "none", borderRadius: 10, cursor: payingWith ? "not-allowed" : "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.82rem" }}
                      >
                        {payingWith === "charge" ? "Charging…" : "Charge Card"}
                      </button>
                    )}
                    <button
                      onClick={() => handlePayment("manual")} disabled={payingWith !== null}
                      style={{ flex: 1, padding: "10px", background: "#fff", color: "#161616", border: "1.5px solid #E5E7EB", borderRadius: 10, cursor: payingWith ? "not-allowed" : "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.82rem" }}
                    >
                      {payingWith === "manual" ? "Saving…" : "Mark Paid (Cash/E-Transfer)"}
                    </button>
                  </div>
                  <div style={{ borderTop: "1px solid #FDE68A", paddingTop: 8, marginTop: 2 }}>
                    {priceSaved ? (
                      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "#166534", fontWeight: 600 }}>
                        Saved — the customer can now pay online from their tracking page.
                      </p>
                    ) : (
                      <button
                        onClick={handleSavePrice} disabled={savingPrice}
                        style={{ width: "100%", padding: "9px", background: "transparent", color: "#8F2740", border: "1.5px dashed rgba(184,50,79,0.4)", borderRadius: 10, cursor: savingPrice ? "not-allowed" : "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem" }}
                      >
                        {savingPrice ? "Saving…" : "Save Amount — Let Customer Pay Online"}
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                  onClick={handleAdvance} disabled={advancing || payingWith !== null}
                  style={{
                    width: "100%", padding: "13px", background: (advancing || payingWith) ? "#A1A1AA" : "#161616",
                    color: "#fff", border: "none", borderRadius: 120, cursor: (advancing || payingWith) ? "not-allowed" : "pointer",
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
