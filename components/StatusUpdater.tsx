"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "placed",              label: "Placed" },
  { value: "confirmed",           label: "Confirmed" },
  { value: "picked_up",           label: "Picked Up" },
  { value: "in_process",          label: "In Process" },
  { value: "ready_for_delivery",  label: "Ready for Delivery" },
  { value: "payment_pending",     label: "Payment Pending" },
  { value: "delivered",           label: "Delivered" },
  { value: "cancelled",           label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  placed:              "bg-blue-50 text-blue-700",
  confirmed:           "bg-teal-50 text-teal-700",
  picked_up:           "bg-yellow-50 text-yellow-800",
  in_process:          "bg-orange-50 text-orange-700",
  ready_for_delivery:  "bg-green-50 text-green-700",
  payment_pending:     "bg-amber-100 text-amber-800",
  delivered:           "bg-gray-100 text-gray-500",
  cancelled:           "bg-red-50 text-red-700",
};

// These two transitions are when item-count reconciliation actually happens:
// count what's received at pickup, count what's handed back at delivery.
const NEEDS_ITEM_COUNT: Record<string, { itemLabel: string; askWeight: boolean }> = {
  picked_up: { itemLabel: "Items received from customer", askWeight: true },
  delivered: { itemLabel: "Items returned to customer", askWeight: false },
};

export default function StatusUpdater({ orderCode, currentStatus }: { orderCode: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus]   = useState(currentStatus);
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [error,  setError]    = useState<string | null>(null);

  // When set, we're mid-way through confirming a picked_up/delivered transition
  // that needs an item count (and optionally weight) before it commits.
  const [pending, setPending] = useState<{ status: string; itemCount: string; weight: string } | null>(null);

  async function commitUpdate(newStatus: string, extra?: { itemCount?: number; weight?: string }) {
    if (newStatus === status) return;
    setSaving(true); setSaved(false); setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderCode)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extra }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Update failed"); }
      setStatus(newStatus);
      setSaved(true);
      setPending(null);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  function handleSelect(newStatus: string) {
    if (newStatus === status) return;
    if (NEEDS_ITEM_COUNT[newStatus]) {
      setError(null);
      setPending({ status: newStatus, itemCount: "", weight: "" });
    } else {
      commitUpdate(newStatus);
    }
  }

  function confirmPending() {
    if (!pending) return;
    const itemCount = pending.itemCount.trim() ? parseInt(pending.itemCount, 10) : undefined;
    if (pending.itemCount.trim() && (itemCount === undefined || isNaN(itemCount) || itemCount < 0)) {
      setError("Enter a valid item count");
      return;
    }
    commitUpdate(pending.status, {
      itemCount,
      weight: pending.weight.trim() || undefined,
    });
  }

  if (pending) {
    const meta = NEEDS_ITEM_COUNT[pending.status];
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5" style={{ minWidth: 220 }}>
        <p className="text-xs font-semibold text-gray-700">{STATUSES.find(s => s.value === pending.status)?.label}</p>
        <label className="text-xs text-gray-500">
          {meta.itemLabel}
          <input
            type="number" min={0} inputMode="numeric" placeholder="e.g. 15"
            className="mt-0.5 w-full text-xs border rounded px-2 py-1 bg-white"
            value={pending.itemCount}
            onChange={e => setPending({ ...pending, itemCount: e.target.value })}
          />
        </label>
        {meta.askWeight && (
          <label className="text-xs text-gray-500">
            Weight (optional)
            <input
              type="text" placeholder="e.g. 8.2 lbs"
              className="mt-0.5 w-full text-xs border rounded px-2 py-1 bg-white"
              value={pending.weight}
              onChange={e => setPending({ ...pending, weight: e.target.value })}
            />
          </label>
        )}
        {error && <span className="text-xs text-red-600">{error}</span>}
        <div className="flex gap-2">
          <button onClick={confirmPending} disabled={saving} className="btn-primary text-xs px-3 py-1.5 flex-1 disabled:opacity-50">
            {saving ? "Saving…" : "Confirm"}
          </button>
          <button onClick={() => { setPending(null); setError(null); }} disabled={saving} className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-500 hover:bg-white">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
        {STATUSES.find(s => s.value === status)?.label ?? status}
      </span>
      <select className="text-xs border rounded px-2 py-1 bg-white disabled:opacity-50" value={status} disabled={saving} onChange={e => handleSelect(e.target.value)}>
        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      {saving && <span className="text-xs text-gray-400">Saving…</span>}
      {saved  && <span className="text-xs text-green-600">Saved!</span>}
      {error  && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
