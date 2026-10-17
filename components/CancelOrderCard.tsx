"use client";

import { useState } from "react";
import { XCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { cancellationTerms } from "@/lib/cancellation";
import { PHONE, PHONE_HREF } from "@/lib/pricing";

/**
 * Lets a customer cancel a pickup that hasn't been collected yet.
 *
 * The refund policy already said they could cancel "through your account",
 * but there was no control anywhere on the site — a customer emailed to say
 * so (18 Oct). This is that control.
 *
 * Two deliberate choices:
 *  - It states the fee band from the published policy BEFORE they confirm,
 *    rather than surprising them afterwards. Nothing is charged here; the
 *    policy says a fee "may" apply and that stays the owner's call.
 *  - It asks a guest for the email on the order. The order code travels over
 *    email and WhatsApp and is short enough to guess, and stopping a van is
 *    destructive — so cancelling needs one thing only the real customer has.
 */
export default function CancelOrderCard({
  orderCode,
  date,
  timeSlot,
  isSignedInOwner,
  onCancelled,
}: {
  orderCode: string;
  date: string;
  timeSlot: string | null;
  isSignedInOwner: boolean;
  onCancelled: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const terms = cancellationTerms(date, timeSlot);

  async function submit() {
    if (!isSignedInOwner && !email.trim()) {
      setError("Please enter the email address on this order.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderCode)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined, email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not cancel this order."); return; }
      onCancelled();
    } catch {
      setError("Could not reach the server — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="card rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold font-heading text-[#161616]">Need to cancel this pickup?</p>
            <p className="text-xs text-[#8C8C8C] font-body mt-1">
              You can cancel online any time before we collect your items.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="text-sm font-semibold font-heading text-[#B30F14] underline underline-offset-2 shrink-0"
          >
            Cancel pickup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-5 border border-[#FCA5A5]">
      <div className="flex items-center gap-2 mb-3">
        <XCircle size={16} className="text-[#DC2626]" />
        <p className="text-sm font-bold font-heading text-[#161616]">Cancel order {orderCode}</p>
      </div>

      {/* The terms, before they commit — not after. */}
      <div className={`rounded-xl p-4 mb-4 ${terms.free ? "bg-[#F0FDF4] border border-[#BBF7D0]" : "bg-[#FFFBEB] border border-[#FDE68A]"}`}>
        <div className="flex items-start gap-2">
          {!terms.free && <AlertTriangle size={15} className="text-[#B45309] shrink-0 mt-0.5" />}
          <div>
            <p className={`text-sm font-bold font-heading ${terms.free ? "text-[#166534]" : "text-[#92400E]"}`}>
              {terms.headline}
            </p>
            <p className={`text-xs font-body mt-1 leading-relaxed ${terms.free ? "text-[#166534]" : "text-[#92400E]"}`}>
              {terms.detail}
            </p>
          </div>
        </div>
      </div>

      {!isSignedInOwner && (
        <div className="mb-3">
          <label className="block text-xs font-semibold font-heading text-[#161616] mb-1">
            Confirm the email address on this order
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null); }}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-[#E4E4E7] bg-white px-4 py-2.5 text-sm font-body"
          />
        </div>
      )}

      <div className="mb-3">
        <label className="block text-xs font-semibold font-heading text-[#161616] mb-1">
          Reason <span className="font-normal text-[#8C8C8C]">(optional — helps us improve)</span>
        </label>
        <textarea
          rows={2}
          maxLength={300}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. plans changed, booked the wrong day"
          className="w-full rounded-xl border border-[#E4E4E7] bg-white px-4 py-2.5 text-sm font-body resize-y"
        />
      </div>

      {error && (
        <p className="text-sm text-[#DC2626] font-body mb-3">{error}</p>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setOpen(false); setError(null); }}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] px-4 py-2 text-sm font-semibold font-heading text-[#161616]"
        >
          <ArrowLeft size={13} /> Keep my pickup
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-full bg-[#DC2626] px-5 py-2 text-sm font-semibold font-heading text-white disabled:opacity-60"
        >
          {busy ? "Cancelling…" : "Yes, cancel this pickup"}
        </button>
      </div>

      <p className="text-xs text-[#8C8C8C] font-body mt-3">
        Prefer to talk to someone? Call <a href={PHONE_HREF} className="text-[#B30F14] underline">{PHONE}</a>.
      </p>
    </div>
  );
}
