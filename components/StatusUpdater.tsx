"use client";

import { useState } from "react";

const STATUSES = [
  { value: "scheduled", label: "Scheduled" },
  { value: "picked_up", label: "Picked Up" },
  { value: "in_progress", label: "In Progress" },
  { value: "ready", label: "Ready" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  picked_up: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

export default function StatusUpdater({
  orderCode,
  currentStatus,
}: {
  orderCode: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(newStatus: string) {
    if (newStatus === status) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderCode)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Update failed");
      }
      setStatus(newStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  const colorClass = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
        {STATUSES.find((s) => s.value === status)?.label ?? status}
      </span>
      <select
        className="text-xs border rounded px-2 py-1 bg-white disabled:opacity-50"
        value={status}
        disabled={saving}
        onChange={(e) => handleUpdate(e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {saving && <span className="text-xs text-gray-400">Saving…</span>}
      {saved && <span className="text-xs text-green-600">Saved + notified</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
