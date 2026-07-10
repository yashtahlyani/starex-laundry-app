"use client";

import { useState } from "react";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
];

export default function ContactUpdater({
  contactId,
  currentStatus,
  email,
}: {
  contactId: string;
  currentStatus: string;
  email: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function update(newStatus: string) {
    setSaving(true);
    try {
      await fetch(`/api/contact/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 items-end">
      <select
        className="text-xs border rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
        value={status}
        disabled={saving}
        onChange={(e) => update(e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <a href={`mailto:${email}`} className="text-xs text-brand hover:underline">
        Reply by email →
      </a>
      {saved && <span className="text-xs text-green-600">Saved ✓</span>}
    </div>
  );
}
