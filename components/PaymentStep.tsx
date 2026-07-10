"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type Props = {
  clientSecret: string;
  amountCad: string;
  onSuccess: () => void;
  onBack: () => void;
};

export default function PaymentStep({ clientSecret, amountCad, onSuccess, onBack }: Props) {
  if (!stripePromise) return null; // shouldn't render without a publishable key configured

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm amountCad={amountCad} onSuccess={onSuccess} onBack={onBack} />
    </Elements>
  );
}

function PaymentForm({ amountCad, onSuccess, onBack }: Omit<Props, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Please check your card details.");
      setSubmitting(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try a different card.");
      setSubmitting(false);
      return;
    }

    onSuccess();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Confirm & pay</h2>
        <p className="text-sm text-gray-500 mt-1">
          We pre-authorize <span className="font-semibold text-gray-700">${amountCad}</span> now — the final
          charge is confirmed once your laundry is weighed in.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <PaymentElement />
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex gap-3 pt-1">
        <button className="btn-secondary flex-1" onClick={onBack} disabled={submitting}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn-primary flex-1 disabled:opacity-40" onClick={handlePay} disabled={!stripe || submitting}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Processing…
            </span>
          ) : (
            <>
              <Lock size={14} /> Pay & Confirm
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
