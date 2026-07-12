"use client";

import { useState } from "react";

const STATUSES = [
  { value: "placed",           label: "Placed" },
  { value: "confirmed",        label: "Confirmed" },
  { value: "picked_up",        label: "Picked Up" },
  { value: "washing",          label: "Cleaning" },
  { value: "folding",          label: "Folding" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered",        label: "Delivered" },
  { value: "cancelled",        label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  placed:           "bg-blue-50 text-blue-700",
  confirmed:        "bg-teal-50 text-teal-700",
  picked_up:        "bg-yellow-50 text-yellow-800",
  washing:          "bg-orange-50 text-orange-700",
  folding:          "bg-purple-50 text-purple-700",
  out_for_delivery: "bg-green-50 text-green-700",
  delivered:        "bg-gray-100 text-gray-500",
  cancelled:        "bg-red-50 text-red-700",
};

export default function StatusUpdater({ orderCode, currentStatus }: { orderCode: string; currentStatus: string }) {
  const [status, setStatus]   = useState(currentStatus);
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [error,  setError]    = useState<string | null>(null);

  async function handleUpdate(newStatus: string) {
    if (newStatus === status) return;
    setSaving(true); setSaved(false); setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderCode)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Update failed"); }
      setStatus(newStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
        {STATUSES.find(s => s.value === status)?.label ?? status}
      </span>
      <select className="text-xs border rounded px-2 py-1 bg-white disabled:opacity-50" value={status} disabled={saving} onChange={e => handleUpdate(e.target.value)}>
        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      {saving && <span className="text-xs text-gray-400">Saving…</span>}
      {saved  && <span className="text-xs text-green-600">Saved!</span>}
      {error  && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
