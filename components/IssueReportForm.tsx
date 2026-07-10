"use client";

import { useState } from "react";
import { AlertTriangle, X, Send } from "lucide-react";

const ISSUE_TYPES = [
  { value: "lost_item", label: "Lost Item" },
  { value: "damage", label: "Item Damaged" },
  { value: "late_delivery", label: "Late Delivery" },
  { value: "billing", label: "Billing Issue" },
  { value: "quality", label: "Quality Issue" },
  { value: "other", label: "Other" },
];

export default function IssueReportForm({ orderCode }: { orderCode: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [issueType, setIssueType] = useState("other");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode, customerName: name, customerEmail: email, issueType, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-600 transition-colors mx-auto"
      >
        <AlertTriangle size={14} />
        Report an issue with this order
      </button>
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-5 text-center">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <Send size={18} className="text-green-600" />
        </div>
        <p className="font-semibold text-gray-900 mb-1">Issue Submitted</p>
        <p className="text-sm text-gray-500">Our team will review and get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-red-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          Report an Issue
        </p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Your Name</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Issue Type</label>
          <select
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:border-brand focus:outline-none"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            {ISSUE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            rows={3}
            placeholder="Describe the issue in detail…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !name || !email || !description}
          className="w-full btn-primary text-sm py-2.5 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Issue Report"}
        </button>
      </form>
    </div>
  );
}
