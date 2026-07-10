"use client";

import { useState } from "react";

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function IssueUpdater({
  issueId,
  currentStatus,
  currentPriority,
}: {
  issueId: string;
  currentStatus: string;
  currentPriority: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [priority, setPriority] = useState(currentPriority);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(newStatus?: string, newPriority?: string) {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus ?? status,
          priority: newPriority ?? priority,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Update failed");
      }
      if (newStatus) setStatus(newStatus);
      if (newPriority) setPriority(newPriority);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        className="text-xs border rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
        value={status}
        disabled={saving}
        onChange={(e) => update(e.target.value, undefined)}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <select
        className="text-xs border rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
        value={priority}
        disabled={saving}
        onChange={(e) => update(undefined, e.target.value)}
      >
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-gray-400">Saving…</span>}
      {saved && <span className="text-xs text-green-600">Saved ✓</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
