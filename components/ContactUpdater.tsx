"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "new",     label: "New" },
  { value: "read",    label: "Read" },
  { value: "replied", label: "Replied" },
];

export default function ContactUpdater({ contactId, currentStatus, email }: { contactId: string; currentStatus: string; email: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  async function handleUpdate(newStatus: string) {
    if (newStatus === status) return;
    setSaving(true); setSaved(false); setError(null);
    try {
      const res = await fetch(`/api/admin/contacts/${encodeURIComponent(contactId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Update failed"); }
      setStatus(newStatus);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <select className="text-xs border rounded px-2 py-1 bg-white disabled:opacity-50" value={status} disabled={saving} onChange={e => handleUpdate(e.target.value)}>
        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <a href={`mailto:${email}`} className="text-xs text-teal-600 hover:underline">Reply via email</a>
      {saving && <span className="text-xs text-gray-400">Saving…</span>}
      {saved  && <span className="text-xs text-green-600">Saved!</span>}
      {error  && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
