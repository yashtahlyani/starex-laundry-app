"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Lock, CheckCircle } from "lucide-react";

export type SavedCard = {
  stripeCustomerId: string;
  stripePaymentMethodId: string;
  cardBrand: string;
  cardLast4: string;
};

const cardElementOptions = {
  style: {
    base: {
      fontFamily: "Kodchasan, sans-serif",
      fontSize: "15px",
      color: "#161616",
      "::placeholder": { color: "#A1A1AA" },
    },
    invalid: { color: "#EF4444" },
  },
};

function CardForm({ name, email, onSaved }: { name: string; email: string; onSaved: (card: SavedCard) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedCard | null>(null);

  async function handleSaveCard() {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start card setup");

      const result = await stripe.confirmCardSetup(data.clientSecret, {
        payment_method: { card: cardElement, billing_details: { name, email } },
      });
      if (result.error) throw new Error(result.error.message ?? "Card could not be saved");

      const pm = result.setupIntent?.payment_method;
      const pmId = typeof pm === "string" ? pm : pm?.id;
      const card = typeof pm === "object" ? pm?.card : undefined;
      if (!pmId) throw new Error("Card could not be saved");

      const savedCard: SavedCard = {
        stripeCustomerId: data.customerId,
        stripePaymentMethodId: pmId,
        cardBrand: card?.brand ?? "card",
        cardLast4: card?.last4 ?? "····",
      };
      setSaved(savedCard);
      onSaved(savedCard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong saving your card");
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F0FDF4", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "12px 16px" }}>
        <CheckCircle size={16} color="#16A34A" style={{ flexShrink: 0 }} />
        <span style={{ color: "#166534", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>
          Card saved — {saved.cardBrand.toUpperCase()} ending in {saved.cardLast4}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ border: "1.5px solid #E4E4E7", borderRadius: 12, padding: "14px 16px", background: "#ffffff" }}>
        <CardElement options={cardElementOptions} />
      </div>
      {error && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: 8, fontFamily: "Kodchasan, sans-serif" }}>{error}</p>}
      <button
        type="button"
        onClick={handleSaveCard}
        disabled={!stripe || submitting || !name.trim() || !email.trim()}
        className="btn-ghost"
        style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, opacity: (!stripe || submitting) ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? "Saving…" : <><Lock size={13} /> Save Card</>}
      </button>
    </div>
  );
}

export default function StripeCardStep({ name, email, onSaved, onConfigResolved }: { name: string; email: string; onSaved: (card: SavedCard) => void; onConfigResolved?: (configured: boolean) => void }) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    fetch("/api/stripe/config")
      .then(r => r.json())
      .then(data => {
        if (data.configured && data.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
          setStatus("ready");
          onConfigResolved?.(true);
        } else {
          setStatus("unavailable");
          onConfigResolved?.(false);
        }
      })
      .catch(() => { setStatus("unavailable"); onConfigResolved?.(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Payments aren't switched on yet for this business — booking proceeds
  // exactly as it always has, with payment collected after the order is
  // weighed. Nothing renders here until real Stripe keys are set.
  if (status !== "ready" || !stripePromise) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#161616", marginBottom: 6 }}>
        <CreditCard size={13} style={{ display: "inline", marginRight: 6 }} />Card on File
      </label>
      <p style={{ color: "#8C8C8C", fontSize: "0.8rem", marginBottom: 10, fontFamily: "Kodchasan, sans-serif" }}>
        Nothing is charged now — we save your card and charge the confirmed amount only after your order is weighed.
      </p>
      <Elements stripe={stripePromise}>
        <CardForm name={name} email={email} onSaved={onSaved} />
      </Elements>
    </div>
  );
}
