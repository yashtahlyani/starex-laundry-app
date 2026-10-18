"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, MapPin, CalendarClock, ArrowRight, AlertTriangle, CheckCircle, Truck } from "lucide-react";
import { StatusBadge, PaymentBadge, ProgressTrack, NEXT_STATUS, STATUS_META } from "./OrderBits";
import { getItemTracking } from "@/lib/itemTracking";
import { getDeliveryRequest } from "@/lib/deliveryRequest";
import { orderCodeColor } from "@/lib/orderCode";
import { calculateHst, isPerLbService } from "@/lib/pricing";
import { cancellationTerms } from "@/lib/cancellation";

const ease = [0.25, 0.4, 0.25, 1] as const;

const SERVICE_LABELS: Record<string, string> = {
  "wash-fold": "Wash & Fold",
  "express":   "Same-Day Express",
  "wash-press": "Wash & Press",
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
  const [pendingDetails, setPendingDetails] = useState<string>("");
  const [pendingWeight, setPendingWeight] = useState<string>("");
  const [countError, setCountError] = useState<string | null>(null);
  const [pendingPrice, setPendingPrice] = useState<string>("");
  // The drawer is handed a snapshot of the order taken when the row was
  // clicked, and router.refresh() re-renders the list behind it without
  // replacing that snapshot — so a just-saved total stayed invisible until
  // the drawer was closed and reopened (per client, 2026-09-25).
  const [localPrice, setLocalPrice] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [payingWith, setPayingWith] = useState<"charge" | "manual" | null>(null);
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceSaved, setPriceSaved] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [sendingNote, setSendingNote] = useState(false);
  const [noteSent, setNoteSent] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [pendingDiscrepancy, setPendingDiscrepancy] = useState("");
  const [weightError, setWeightError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundDone, setRefundDone] = useState<string | null>(null);

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
    setPendingDetails("");
    setPendingWeight("");
    setCountError(null);
    // Seed from the total already saved on this order, rather than blanking
    // it. Staff save an amount, the customer then says "just charge my card",
    // and the charge box came back empty — so Charge Card failed with "Enter
    // the confirmed order total" for an amount the owner could no longer see
    // and had to remember (per client, 2026-10-15: "I saved the amount
    // already ... he told me to charge his card and I don't know the amount").
    setPendingPrice(order?.price != null ? String(order.price) : "");
    setLocalPrice(null);
    setPaymentError(null);
    setPayingWith(null);
    setSavingPrice(false);
    setPriceSaved(false);
    setNoteMessage("");
    setSendingNote(false);
    setNoteSent(false);
    setNoteError(null);
    setPendingDiscrepancy("");
    setWeightError(null);
    setCancelOpen(false);
    setCancelReason("");
    setCancelling(false);
    setCancelError(null);
    setRefundOpen(false);
    setRefundAmount("");
    setRefundReason("");
    setRefunding(false);
    setRefundError(null);
    setRefundDone(null);
  }, [order?.id]);

  // Seed the charge box from the total already saved on this order, without
  // touching anything else the owner has typed — the bulk reset above owns
  // that and is keyed on the order id. Never overwrites a figure they have
  // entered themselves; only fills a box that is empty.
  useEffect(() => {
    if (order?.price == null) return;
    setPendingPrice(prev => (prev.trim() === "" ? String(order.price) : prev));
  }, [order?.price]);

  const currentStatus = localStatus ?? order?.status ?? "placed";
  const paymentStatus = localPaymentStatus ?? order?.payment_status ?? "unpaid";
  const isPaid = paymentStatus === "paid";
  const nextStatusId = NEXT_STATUS[currentStatus] ?? null;
  const nextLabel = nextStatusId ? STATUS_META[nextStatusId]?.label : null;
  const needsCount = nextStatusId === "picked_up" || nextStatusId === "delivered";
  // Wash & Fold, Express and Wash & Press are weighed, not counted — nobody
  // tallies 45 individual socks. Asking "how many items?" on those orders got
  // the owner typing "45 LB" into a number field and losing the unit (per
  // client, 2026-10-16: "I wanted to write 45 LB but it was written only 45
  // because no full key pad was available"). The field now states the unit
  // instead, so 45 on its own is complete and unambiguous.
  const byWeight = isPerLbService(order?.service ?? "");
  const unit = byWeight ? "lb" : "item";
  const fmtQty = (n: number) =>
    byWeight ? `${Number(n.toFixed(1))} lb` : `${n} item${n === 1 ? "" : "s"}`;
  // Weighing happens at Confirmed, not Picked Up — Picked Up is just the
  // courier collecting the bag, before anything's been verified at the
  // facility (per client, 2026-08-18).
  const needsWeight = nextStatusId === "confirmed";
  const hasCardOnFile = !!order?.stripe_payment_method_id;
  // Only from Confirmed onward — that's when staff have actually verified,
  // weighed, and can price the order. Setting a total before that (e.g. at
  // Picked Up, before verification) doesn't make sense.
  const showPaymentPanel = admin && !isPaid && ["confirmed", "ready_for_delivery"].includes(currentStatus);

  // What the order is actually worth right now: the amount just saved in this
  // drawer if there is one, otherwise whatever the server snapshot carried.
  const effectivePrice = localPrice ?? (order?.price != null ? Number(order.price) : null);

  const tracking = getItemTracking(order?.status_history as any);
  const deliveryRequest = getDeliveryRequest(order?.status_history as any);
  const received = localTracking?.received ?? tracking.received;
  const returned = localTracking?.returned ?? tracking.returned;
  const missing = received != null && returned != null ? received - returned : null;

  // Order codes are URL path segments, and six legacy orders carry codes like
  // "#SX2402". An unencoded "#" is read by the browser as a fragment, so the
  // request went to /api/orders/ and 404'd — every action in this drawer
  // silently failed on those orders. encodeURIComponent on all of them.
  async function handlePayment(method: "charge" | "manual") {
    if (!order) return;
    const amount = parseFloat(pendingPrice);
    if (!pendingPrice.trim() || isNaN(amount) || amount <= 0) { setPaymentError("Enter the confirmed order total"); return; }

    setPayingWith(method);
    setPaymentError(null);
    try {
      const res = await fetch(method === "charge" ? "/api/stripe/charge" : `/api/orders/${encodeURIComponent(order.code)}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method === "charge" ? { orderCode: order.code, amountCad: amount } : { amountCad: amount }),
      });
      const data = await res.json();
      if (!res.ok) { setPaymentError(data.error ?? "Payment failed"); return; }

      setLocalPaymentStatus("paid");
      if (data.status) setLocalStatus(data.status);
      setLocalPrice(amount);
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
      const res = await fetch(`/api/orders/${encodeURIComponent(order.code)}/set-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCad: amount }),
      });
      const data = await res.json();
      if (!res.ok) { setPaymentError(data.error ?? "Could not save order total"); return; }
      setPriceSaved(true);
      setLocalPrice(amount);
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
      const res = await fetch(`/api/orders/${encodeURIComponent(order.code)}/notify`, {
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

  // Same endpoint the customer's own cancel uses, so the recorded terms, the
  // note on the order and the email they receive are identical either way.
  const cancelTerms = cancellationTerms(order?.date ?? "", order?.time_slot ?? null);

  async function handleRefund() {
    if (!order) return;
    setRefunding(true);
    setRefundError(null);
    try {
      const amt = refundAmount.trim();
      const res = await fetch("/api/stripe/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: order.code,
          // Omitted means "refund whatever is left" — the common case, and
          // safer than making the owner retype an amount he could fat-finger.
          amountCad: amt ? Number(amt) : undefined,
          reason: refundReason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setRefundError(data.error ?? "Refund failed"); return; }
      setRefundDone(`Refunded $${Number(data.refundedCad).toFixed(2)} CAD`);
      if (data.fullyRefunded) setLocalPaymentStatus("unpaid");
      setRefundOpen(false);
      router.refresh();
    } catch {
      setRefundError("Refund failed — check your connection and try again");
    } finally {
      setRefunding(false);
    }
  }

  async function handleCancelOrder() {
    if (!order) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.code)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setCancelError(data.error ?? "Could not cancel this order"); return; }
      setLocalStatus("cancelled");
      setCancelOpen(false);
      router.refresh();
    } catch {
      setCancelError("Could not cancel — check your connection and try again");
    } finally {
      setCancelling(false);
    }
  }

  async function handleAdvance() {
    if (!order || !nextStatusId) return;

    let itemCount: number | undefined;
    if (needsCount) {
      if (!pendingCount.trim()) {
        setCountError(byWeight ? "Enter the weight in lb" : "Enter an item count");
        return;
      }
      // parseFloat, not parseInt: a 45.5 lb bag was silently truncated to 45.
      itemCount = byWeight ? parseFloat(pendingCount) : parseInt(pendingCount, 10);
      if (isNaN(itemCount) || itemCount < 0) {
        setCountError(byWeight ? "Enter a valid weight in lb" : "Enter a valid item count");
        return;
      }
    }
    if (needsWeight && !pendingWeight.trim()) {
      setWeightError("Enter the verified weight");
      return;
    }

    setAdvancing(true);
    setCountError(null);
    setWeightError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.code)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatusId,
          note: nextStatusId === "confirmed" ? (pendingDiscrepancy.trim() || null) : null,
          itemCount,
          itemDetails: needsCount ? (pendingDetails.trim() || undefined) : undefined,
          weight: nextStatusId === "confirmed" ? (pendingWeight.trim() || undefined) : undefined,
        }),
      });
      if (res.ok) {
        setLocalStatus(nextStatusId);
        if (itemCount != null) {
          setLocalTracking((prev) => nextStatusId === "picked_up"
            ? { ...prev, received: itemCount }
            : { ...prev, returned: itemCount });
        }
        setPendingCount(""); setPendingDetails(""); setPendingWeight(""); setPendingDiscrepancy("");
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
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <StatusBadge status={currentStatus} pulse={!["delivered","cancelled"].includes(currentStatus)} size="sm" />
                  {admin && <PaymentBadge status={paymentStatus} size="sm" />}
                  {order.rating != null && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", fontWeight: 600, color: order.rating <= 2 ? "#DC2626" : "#B45309" }}>
                      {order.rating}★
                    </span>
                  )}
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
                {effectivePrice != null && (
                  <Row
                    icon={Package}
                    label={isPaid ? "Amount paid" : "Amount"}
                    value={`$${calculateHst(effectivePrice).total.toFixed(2)} CAD incl. HST — subtotal $${effectivePrice.toFixed(2)} + HST $${calculateHst(effectivePrice).hst.toFixed(2)}`}
                  />
                )}
                {/* The window the customer asked for when they paid. It was
                    only ever in the status-history notes, so the owner was
                    phoning customers to ask for a time they had already
                    given (per client, 2026-10-18). */}
                {deliveryRequest && (
                  <Row icon={Truck} label="Delivery requested" value={deliveryRequest} />
                )}
                {order.notes && <Row icon={Package} label="Notes" value={order.notes} />}
                {admin && order.customer_name && <Row icon={Package} label="Customer" value={`${order.customer_name} · ${order.email} · ${order.phone}`} />}
              </div>

              {admin && (received != null || returned != null) && (
                <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 12, background: missing ? "#FEF2F2" : "#F4F4F5", border: missing ? "1px solid #FCA5A5" : "none" }}>
                  {missing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <AlertTriangle size={15} color="#DC2626" />
                      <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#DC2626" }}>
                        {byWeight ? `${fmtQty(missing)} less came back` : `${missing} item${missing !== 1 ? "s" : ""} missing`}
                      </p>
                    </div>
                  ) : null}
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8125rem", color: "#6B6B6B" }}>
                    Received: <strong style={{ color: "#161616" }}>{received != null ? fmtQty(received) : "—"}</strong>
                    {" · "}Returned: <strong style={{ color: "#161616" }}>{returned != null ? fmtQty(returned) : "—"}</strong>
                  </p>
                  {tracking.receivedDetails && (
                    <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "#6B6B6B", marginTop: 4 }}>
                      In: {tracking.receivedDetails}
                    </p>
                  )}
                  {tracking.returnedDetails && (
                    <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "#6B6B6B", marginTop: 2 }}>
                      Out: {tracking.returnedDetails}
                    </p>
                  )}
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
                    For anything outside a status change — general updates, questions, follow-ups. If it's a discrepancy at check-in, use the note field when marking Confirmed instead, so the customer gets one email, not two.
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
              {admin && isPaid && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#F0FDF4", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, marginBottom: 4 }}>
                  <CheckCircle size={15} color="#16A34A" style={{ flexShrink: 0 }} />
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>
                    Payment received{effectivePrice != null ? ` — $${calculateHst(effectivePrice).total.toFixed(2)} CAD incl. HST` : ""}
                  </p>
                </div>
              )}

              {/* Refunding from the console. Previously this meant logging
                  into Stripe, and the order here would still read "Paid"
                  afterwards (per client, 2026-10-18). */}
              {admin && isPaid && (
                refundOpen ? (
                  <div style={{ border: "1px solid #FDE68A", background: "#FFFBEB", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
                    <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "#92400E" }}>
                      Refund this payment?
                    </p>
                    <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#92400E" }}>
                      Goes back to the card the customer paid with, and can take 5–10 business days to appear.
                      {effectivePrice != null && ` Leave the amount blank to refund the full $${calculateHst(effectivePrice).total.toFixed(2)}.`}
                    </p>
                    <input
                      type="number" min={0} step="0.01" inputMode="decimal"
                      value={refundAmount}
                      onChange={e => { setRefundAmount(e.target.value); setRefundError(null); }}
                      placeholder={effectivePrice != null ? `Full refund — $${calculateHst(effectivePrice).total.toFixed(2)}` : "Amount incl. HST (CAD)"}
                      style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #FDE68A", fontSize: "0.82rem", fontFamily: "Kodchasan, sans-serif" }}
                    />
                    <input
                      value={refundReason}
                      onChange={e => setRefundReason(e.target.value)}
                      maxLength={200}
                      placeholder="Reason (e.g. charged twice, order cancelled)"
                      style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #FDE68A", fontSize: "0.82rem", fontFamily: "Kodchasan, sans-serif" }}
                    />
                    {refundError && <p style={{ color: "#DC2626", fontSize: "0.78rem", fontFamily: "Kodchasan, sans-serif" }}>{refundError}</p>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => { setRefundOpen(false); setRefundError(null); }}
                        disabled={refunding}
                        style={{ flex: 1, padding: "9px", background: "#fff", color: "#161616", border: "1.5px solid #E5E7EB", borderRadius: 10, cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem" }}
                      >
                        Don&apos;t refund
                      </button>
                      <button
                        onClick={handleRefund}
                        disabled={refunding}
                        style={{ flex: 1, padding: "9px", background: refunding ? "#A1A1AA" : "#B45309", color: "#fff", border: "none", borderRadius: 10, cursor: refunding ? "not-allowed" : "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem" }}
                      >
                        {refunding ? "Refunding…" : "Confirm refund"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setRefundOpen(true)}
                    style={{ width: "100%", padding: "9px", background: "transparent", color: "#B45309", border: "none", cursor: "pointer", fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", textDecoration: "underline", marginBottom: 4 }}
                  >
                    Refund this payment
                  </button>
                )
              )}

              {refundDone && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, marginBottom: 4 }}>
                  <CheckCircle size={15} color="#B45309" style={{ flexShrink: 0 }} />
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#92400E", fontWeight: 600 }}>
                    {refundDone} — the customer will see it in 5–10 business days.
                  </p>
                </div>
              )}
              {showPaymentPanel && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4, padding: "14px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12 }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#92400E" }}>Collect payment</p>

                  {/* The amount already saved on this order, stated outright.
                      Without it the owner had to remember the figure before
                      he could charge the card. */}
                  {effectivePrice != null && (
                    <div style={{ background: "#fff", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 12px" }}>
                      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#92400E", margin: 0 }}>
                        Amount saved for this order
                      </p>
                      <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#161616", margin: "2px 0 0" }}>
                        ${calculateHst(effectivePrice).total.toFixed(2)}
                        <span style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 400, fontSize: "0.75rem", color: "#6B6B6B" }}>
                          {" "}incl. HST
                        </span>
                      </p>
                      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#6B6B6B", margin: "2px 0 0" }}>
                        subtotal ${effectivePrice.toFixed(2)} + HST ${calculateHst(effectivePrice).hst.toFixed(2)} — this is what Charge Card will take
                      </p>
                    </div>
                  )}

                  {hasCardOnFile && (
                    <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "#6B6B6B" }}>
                      {/* Older orders stored placeholder values because the
                          card details were never read back from Stripe — say
                          "a saved card" rather than "ending in ····". */}
                      {order?.card_last4 && /^\d{4}$/.test(order.card_last4)
                        ? <>Card on file: {(order.card_brand || "card").toUpperCase()} ending in {order.card_last4}</>
                        : <>Card on file — saved by the customer at booking</>}
                    </p>
                  )}
                  <input
                    type="number" min={0} step="0.01" inputMode="decimal"
                    placeholder="Order subtotal — before HST (CAD)"
                    value={pendingPrice}
                    onChange={e => { setPendingPrice(e.target.value); setPriceSaved(false); }}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif", background: "#fff" }}
                  />
                  {(() => {
                    const n = parseFloat(pendingPrice);
                    if (!pendingPrice.trim() || isNaN(n) || n <= 0) return null;
                    const { hst, total } = calculateHst(n);
                    return (
                      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#92400E" }}>
                        + HST (13%): ${hst.toFixed(2)} = <strong>${total.toFixed(2)} total</strong>
                      </p>
                    );
                  })()}
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
                        Saved{effectivePrice != null ? `: $${effectivePrice.toFixed(2)} + HST = $${calculateHst(effectivePrice).total.toFixed(2)} CAD` : ""} — the customer can now pay online from their tracking page.
                      </p>
                    ) : (
                      <button
                        onClick={handleSavePrice} disabled={savingPrice}
                        style={{ width: "100%", padding: "9px", background: "transparent", color: "#B30F14", border: "1.5px dashed rgba(184,50,79,0.4)", borderRadius: 10, cursor: savingPrice ? "not-allowed" : "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem" }}
                      >
                        {savingPrice ? "Saving…" : "Save Amount — Let Customer Pay Online"}
                      </button>
                    )}
                  </div>
                </div>
              )}
              {admin && nextLabel && needsCount && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
                  {/* The unit lives in the field, not in the owner's head.
                      step="0.1" matters on weight orders — the default step
                      of 1 rejected 45.5 lb in the browser and parseInt would
                      have truncated it anyway. */}
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type="number"
                      min={0}
                      step={byWeight ? "0.1" : "1"}
                      inputMode={byWeight ? "decimal" : "numeric"}
                      placeholder={byWeight
                        ? (nextStatusId === "picked_up" ? "Weight collected" : "Weight returned")
                        : (nextStatusId === "picked_up" ? "How many items? (count)" : "How many items came back? (count)")}
                      value={pendingCount}
                      onChange={e => { setPendingCount(e.target.value); setCountError(null); }}
                      style={{
                        width: "100%", padding: byWeight ? "10px 46px 10px 14px" : "10px 14px",
                        borderRadius: 10, border: "1px solid #E5E7EB", fontSize: "0.875rem",
                        fontFamily: "Kodchasan, sans-serif", boxSizing: "border-box",
                      }}
                    />
                    {byWeight && (
                      <span style={{
                        position: "absolute", right: 14, fontFamily: "Poppins, sans-serif",
                        fontWeight: 700, fontSize: "0.82rem", color: "#8C8C8C", pointerEvents: "none",
                      }}>
                        lb
                      </span>
                    )}
                  </div>
                  {/* type="text", so phones open the full keyboard, not the
                      number pad — staff need to write out what the items
                      actually are, not just how many (per client,
                      2026-09-25). The count above stays, because the
                      missing-item check is arithmetic on those two numbers. */}
                  <textarea
                    rows={2}
                    inputMode="text"
                    maxLength={500}
                    placeholder={byWeight
                      ? (nextStatusId === "picked_up"
                          ? "What was collected (optional) — e.g. 2 bags, 1 duvet, 1 delicate item"
                          : "What was returned (optional) — e.g. 2 bags, 1 duvet")
                      : (nextStatusId === "picked_up"
                          ? "Items received from customer — e.g. 3 shirts, 2 trousers, 1 bedsheet"
                          : "Items returned to customer — e.g. 3 shirts, 2 trousers, 1 bedsheet")}
                    value={pendingDetails}
                    onChange={e => setPendingDetails(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif", resize: "vertical", boxSizing: "border-box" }}
                  />
                  {countError && <p style={{ color: "#DC2626", fontSize: "0.8rem", fontFamily: "Kodchasan, sans-serif" }}>{countError}</p>}
                </div>
              )}
              {admin && nextStatusId === "confirmed" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
                  <input
                    type="text" placeholder="Weight (e.g. 8.2 lbs)"
                    value={pendingWeight}
                    onChange={e => { setPendingWeight(e.target.value); setWeightError(null); }}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}
                  />
                  {weightError && <p style={{ color: "#DC2626", fontSize: "0.8rem", fontFamily: "Kodchasan, sans-serif" }}>{weightError}</p>}
                  <textarea
                    rows={2}
                    placeholder="Any discrepancy to flag? (optional) — e.g. a stain that won't fully remove"
                    value={pendingDiscrepancy}
                    onChange={e => setPendingDiscrepancy(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: "0.85rem", fontFamily: "Kodchasan, sans-serif", resize: "vertical", boxSizing: "border-box" }}
                  />
                  {pendingDiscrepancy.trim() && (
                    <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#8C8C8C" }}>
                      Sent to the customer in the same &quot;Confirmed&quot; email — no need to also use Notify customer below.
                    </p>
                  )}
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

              {/* Cancelling on a customer's behalf. The status dropdown could
                  already set "cancelled", but it recorded no reason and sent
                  no proper cancellation notice — per client, 2026-10-18:
                  "we can also cancel the order from our side also if the
                  customer tells us to do so". Goes through the same endpoint
                  as the customer's own cancel, so the terms, the note and the
                  customer email are identical either way. */}
              {admin && !["delivered", "cancelled"].includes(currentStatus) && (
                cancelOpen ? (
                  <div style={{ border: "1px solid #FCA5A5", background: "#FEF2F2", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "#991B1B" }}>
                      Cancel this order?
                    </p>
                    <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#991B1B" }}>
                      The customer is emailed and messaged automatically. {cancelTerms.free
                        ? "12+ hours' notice — no fee applies."
                        : `${cancelTerms.headline} — you decide whether to charge it.`}
                    </p>
                    <input
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      maxLength={300}
                      placeholder="Reason (e.g. customer called to cancel)"
                      style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #FCA5A5", fontSize: "0.82rem", fontFamily: "Kodchasan, sans-serif" }}
                    />
                    {cancelError && <p style={{ color: "#DC2626", fontSize: "0.78rem", fontFamily: "Kodchasan, sans-serif" }}>{cancelError}</p>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => { setCancelOpen(false); setCancelError(null); }}
                        disabled={cancelling}
                        style={{ flex: 1, padding: "9px", background: "#fff", color: "#161616", border: "1.5px solid #E5E7EB", borderRadius: 10, cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem" }}
                      >
                        Keep order
                      </button>
                      <button
                        onClick={handleCancelOrder}
                        disabled={cancelling}
                        style={{ flex: 1, padding: "9px", background: cancelling ? "#A1A1AA" : "#DC2626", color: "#fff", border: "none", borderRadius: 10, cursor: cancelling ? "not-allowed" : "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem" }}
                      >
                        {cancelling ? "Cancelling…" : "Confirm cancel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCancelOpen(true)}
                    style={{ width: "100%", padding: "9px", background: "transparent", color: "#B91C1C", border: "none", cursor: "pointer", fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", textDecoration: "underline" }}
                  >
                    Cancel this order
                  </button>
                )
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
