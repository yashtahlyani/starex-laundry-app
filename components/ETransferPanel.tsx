"use client";

import { useState } from "react";
import { CheckCircle, Send, Copy, Check } from "lucide-react";
import { ETRANSFER } from "@/lib/site";

/**
 * Interac e-Transfer, offered alongside card at payment time (per client,
 * 2026-11-07).
 *
 * The money moves between the customer's bank and the business's inbox,
 * entirely outside this system, so nothing here can know when it arrives.
 * The button therefore only says the customer has sent it — it does not mark
 * the order paid. Staff confirm that once the transfer actually lands.
 * Anything else would let anyone holding an order code clear their own
 * balance, and would show "Payment received" to staff for money that may
 * never turn up.
 *
 * The address, amount and order number are each copyable, because the
 * customer is about to retype them into a banking app and a typo in the
 * address sends real money to a stranger.
 */
export default function ETransferPanel({
  orderCode, amountCad, deliveryRequest,
}: { orderCode: string; amountCad: number; deliveryRequest: string }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard is blocked in some browsers; the value is on screen anyway.
    }
  }

  async function tellThem() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderCode)}/etransfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryRequest }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Could not let us know — please call 437-607-7251.");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#F0FDF4", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "13px 15px" }}>
        <CheckCircle size={17} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.83rem", color: "#166534", lineHeight: 1.6 }}>
          Thanks — we&apos;ve told the team to look out for it. Your order stays marked unpaid until
          the transfer arrives, and we&apos;ll confirm as soon as it does.
        </p>
      </div>
    );
  }

  const row = (label: string, value: string) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: "1px solid #ECECEE" }}>
      <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "#6B6B6B", flexShrink: 0 }}>{label}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, minWidth: 0 }}>
        <strong style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.84rem", color: "#161616", wordBreak: "break-all", textAlign: "right" }}>
          {value}
        </strong>
        <button
          type="button" onClick={() => copy(label, value)} aria-label={`Copy ${label}`}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "inline-flex", color: "#B30F14", flexShrink: 0 }}
        >
          {copied === label ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </span>
    </div>
  );

  return (
    <div>
      <div style={{ background: "#FAFAFA", border: "1px solid #E4E4E7", borderRadius: 12, padding: "2px 14px 8px", marginBottom: 12 }}>
        {row("Send to", ETRANSFER.email)}
        {row("Amount", `$${amountCad.toFixed(2)} CAD`)}
        {row("Message", orderCode)}
      </div>
      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "#6B6B6B", marginBottom: 12, lineHeight: 1.6 }}>
        Send the e-Transfer from your own bank or banking app. {ETRANSFER.memoHint} Then tap below so
        we know to look out for it.
      </p>
      {error && (
        <p style={{ color: "#EF4444", fontSize: "0.8rem", marginBottom: 10, fontFamily: "Kodchasan, sans-serif" }}>{error}</p>
      )}
      <button
        type="button" onClick={tellThem} disabled={busy} className="btn-primary"
        style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: busy ? 0.6 : 1, cursor: busy ? "not-allowed" : "pointer" }}
      >
        <Send size={14} /> {busy ? "Letting them know…" : "I've sent the e-Transfer"}
      </button>
    </div>
  );
}
