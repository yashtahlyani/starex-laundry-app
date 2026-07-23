"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, CheckCircle, Lock } from "lucide-react";

function PayForm({ orderCode, amountCad, onPaid }: { orderCode: string; amountCad: number; onPaid: (status: string) => void }) {
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
        body: JSON.stringify({ orderCode, paymentIntentId: paymentIntent.id }),
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

export default function PayNowCard({ orderCode, amountCad, onPaid }: { orderCode: string; amountCad: number; onPaid?: (status: string) => void }) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "error">("loading");
  const [paid, setPaid] = useState<"delivered" | "paid" | null>(null);

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
            {paid === "delivered" ? "Your order is complete." : "We'll update your order shortly."}
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
        <CreditCard size={16} color="#8F2740" />
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
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PayForm orderCode={orderCode} amountCad={amountCad} onPaid={(s) => { setPaid(s === "delivered" ? "delivered" : "paid"); onPaid?.(s); }} />
        </Elements>
      )}
    </div>
  );
}
