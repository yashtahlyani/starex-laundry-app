"use client";

import { useEffect, useId, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, CheckCircle, Lock } from "lucide-react";

// Paying and getting the order delivered are two different conversations —
// customers used to pay, then have to phone or message separately to agree a
// delivery time, and staff had no idea payment had even landed (per client,
// 2026-09-25). Captured here at the moment of payment and emailed straight to
// the owner, so the delivery window arrives with the money.
function DeliveryRequestFields({
  date, time, onDateChange, onTimeChange,
}: {
  date: string; time: string;
  onDateChange: (v: string) => void; onTimeChange: (v: string) => void;
}) {
  // The dashboard renders one of these per unpaid order, so a hardcoded id
  // would repeat down the page and point every label at the first field.
  const dateId = useId();
  // Eastern-time "today", not the browser's local date — a customer travelling
  // in another timezone must not be offered (or blocked from) a delivery date
  // that doesn't line up with the days Starex actually operates.
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB",
    fontSize: "0.85rem", fontFamily: "Kodchasan, sans-serif", background: "#fff",
    color: "#161616", boxSizing: "border-box",
  };
  return (
    <div style={{ background: "#FAFAFA", border: "1px solid #EFEFEF", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
      <label htmlFor={dateId} style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "#161616", marginBottom: 2 }}>
        When would you like it delivered?
      </label>
      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#8C8C8C", marginBottom: 10 }}>
        Optional — we&apos;ll send this to our team with your payment and confirm the time with you.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          id={dateId} type="date" min={today} value={date}
          onChange={e => onDateChange(e.target.value)}
          aria-label="Preferred delivery date"
          style={{ ...inputStyle, flex: "1 1 140px" }}
        />
        <input
          type="text" value={time} maxLength={120}
          onChange={e => onTimeChange(e.target.value)}
          placeholder="Time — e.g. after 6 pm"
          aria-label="Preferred delivery time"
          style={{ ...inputStyle, flex: "1 1 160px" }}
        />
      </div>
    </div>
  );
}

// Turns the two fields into the one line the owner reads in their inbox.
// Empty when the customer skipped both, which the email handles explicitly.
export function buildDeliveryRequest(date: string, time: string): string {
  const parts: string[] = [];
  if (date.trim()) {
    // Built in UTC and formatted in UTC so the chosen calendar date survives
    // intact. Parsing "YYYY-MM-DDT00:00:00" uses whatever zone the runtime is
    // in, which is how every booking email ended up a day early (see
    // formatDate in lib/notifications.ts).
    const [year, month, day] = date.split("-").map(Number);
    parts.push(new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-CA", {
      timeZone: "UTC", weekday: "long", month: "long", day: "numeric",
    }));
  }
  if (time.trim()) parts.push(time.trim());
  return parts.join(" · ");
}

function PayForm({ orderCode, amountCad, deliveryRequest, onPaid }: { orderCode: string; amountCad: number; deliveryRequest: string; onPaid: (status: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (confirmError) throw new Error(confirmError.message ?? "Payment failed");
      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        throw new Error("Payment could not be confirmed — please try again");
      }

      // Stripe.js confirming success client-side is not proof enough on its
      // own — the server re-verifies directly with Stripe before marking the
      // order paid (see /api/stripe/confirm-payment).
      const res = await fetch("/api/stripe/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode, paymentIntentId: paymentIntent.id, deliveryRequest }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment succeeded but couldn't be recorded — contact us");

      onPaid(data.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handlePay}>
      <PaymentElement />
      {error && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: 12, fontFamily: "Kodchasan, sans-serif" }}>{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center", marginTop: 16, opacity: (!stripe || submitting) ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? "Processing…" : <><Lock size={14} /> Pay ${amountCad.toFixed(2)} CAD</>}
      </button>
    </form>
  );
}

function QuickPayButton({
  stripePromise, clientSecret, amountCad, savedCard, onUseDifferentCard, onPaid, orderCode, deliveryRequest,
}: {
  stripePromise: Promise<Stripe | null>; clientSecret: string; amountCad: number;
  savedCard: { brand: string | null; last4: string | null }; onUseDifferentCard: () => void;
  onPaid: (status: string) => void; orderCode: string; deliveryRequest: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The card is already attached to this PaymentIntent server-side, so
  // confirming just needs the raw Stripe instance — no Elements/PaymentElement
  // form required, which is what lets this be a true one-click "Pay" instead
  // of making the customer re-type the card they already saved at booking.
  async function handlePay() {
    setSubmitting(true);
    setError(null);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Payments aren't available right now");
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
      if (confirmError) throw new Error(confirmError.message ?? "Payment failed");
      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        throw new Error("Payment could not be confirmed — please try again");
      }
      const res = await fetch("/api/stripe/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode, paymentIntentId: paymentIntent.id, deliveryRequest }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment succeeded but couldn't be recorded — contact us");
      onPaid(data.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={submitting}
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? "Processing…" : <><Lock size={14} /> Pay ${amountCad.toFixed(2)} CAD — {savedCard.brand?.toUpperCase() ?? "card"} ending in {savedCard.last4 ?? "····"}</>}
      </button>
      {error && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: 12, fontFamily: "Kodchasan, sans-serif" }}>{error}</p>}
      <button
        onClick={onUseDifferentCard}
        disabled={submitting}
        style={{ background: "none", border: "none", padding: 0, marginTop: 10, color: "#6B6B6B", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif", textDecoration: "underline", cursor: "pointer" }}
      >
        Use a different card
      </button>
    </div>
  );
}

export default function PayNowCard({ orderCode, amountCad: subtotalCad, onPaid }: { orderCode: string; amountCad: number; onPaid?: (status: string) => void }) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [savedCard, setSavedCard] = useState<{ brand: string | null; last4: string | null } | null>(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "error">("loading");
  const [paid, setPaid] = useState<"delivered" | "paid" | null>(null);
  // Starts as the pre-tax subtotal (what the parent page has on hand before
  // this component loads); replaced with the real tax-inclusive total the
  // moment the PaymentIntent comes back — that's the actual amount charged,
  // and the only thing that should ever appear on the "Pay $X" button.
  const [amountCad, setAmountCad] = useState(subtotalCad);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const deliveryRequest = buildDeliveryRequest(deliveryDate, deliveryTime);

  useEffect(() => {
    fetch("/api/stripe/config")
      .then(r => r.json())
      .then(async (config) => {
        if (!config.configured || !config.publishableKey) { setStatus("unavailable"); return; }
        setStripePromise(loadStripe(config.publishableKey));
        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderCode }),
        });
        const data = await res.json();
        if (!res.ok) { setStatus("error"); return; }
        setClientSecret(data.clientSecret);
        setSavedCard(data.savedCard ?? null);
        if (typeof data.amountCad === "number") setAmountCad(data.amountCad);
        setStatus("ready");
      })
      .catch(() => setStatus("unavailable"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode]);

  if (paid) {
    return (
      <div className="card rounded-2xl p-5" style={{ display: "flex", alignItems: "center", gap: 12, background: "#F0FDF4", border: "1px solid rgba(34,197,94,0.3)" }}>
        <CheckCircle size={22} color="#16A34A" style={{ flexShrink: 0 }} />
        <div>
          <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9375rem", color: "#166534" }}>Payment received — thank you!</p>
          <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8125rem", color: "#166534" }}>
            {deliveryRequest
              ? `We've sent your delivery request (${deliveryRequest}) to our team — we'll confirm it with you shortly.`
              : paid === "delivered" ? "Your order is complete." : "We'll update your order shortly."}
          </p>
        </div>
      </div>
    );
  }

  // Not configured yet, or no confirmed price to pay — nothing to show. The
  // owner still has manual "Charge Card" / "Mark Paid" as a fallback.
  if (status === "unavailable" || status === "loading") return null;

  return (
    <div className="card rounded-2xl p-5">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <CreditCard size={16} color="#B30F14" />
        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9375rem", color: "#161616" }}>Payment due</p>
      </div>
      <p style={{ color: "#6B6B6B", fontSize: "0.8125rem", marginBottom: 16, fontFamily: "Kodchasan, sans-serif" }}>
        Your order total is confirmed — pay securely below to complete it.
      </p>
      {status === "error" && (
        <p style={{ color: "#EF4444", fontSize: "0.85rem", fontFamily: "Kodchasan, sans-serif" }}>
          Couldn&apos;t start the payment. Please refresh, or contact us to pay another way.
        </p>
      )}
      {status === "ready" && clientSecret && stripePromise && (
        <DeliveryRequestFields
          date={deliveryDate} time={deliveryTime}
          onDateChange={setDeliveryDate} onTimeChange={setDeliveryTime}
        />
      )}
      {status === "ready" && clientSecret && stripePromise && savedCard && !useNewCard && (
        <QuickPayButton
          stripePromise={stripePromise}
          clientSecret={clientSecret}
          amountCad={amountCad}
          savedCard={savedCard}
          orderCode={orderCode}
          deliveryRequest={deliveryRequest}
          onUseDifferentCard={() => setUseNewCard(true)}
          onPaid={(s) => { setPaid(s === "delivered" ? "delivered" : "paid"); onPaid?.(s); }}
        />
      )}
      {status === "ready" && clientSecret && stripePromise && (!savedCard || useNewCard) && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PayForm orderCode={orderCode} amountCad={amountCad} deliveryRequest={deliveryRequest} onPaid={(s) => { setPaid(s === "delivered" ? "delivered" : "paid"); onPaid?.(s); }} />
        </Elements>
      )}
    </div>
  );
}
