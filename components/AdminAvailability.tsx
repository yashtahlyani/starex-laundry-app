"use client";

import { useEffect, useState } from "react";
import { Ban, CalendarOff, X, Plus, AlertTriangle } from "lucide-react";
import { PICKUP_WINDOWS, DETAILING_WINDOWS } from "@/lib/pricing";

/**
 * The owner's two gates on booking (per client, 2026-11-19): a blocklist of
 * customers who may not book online, and holiday mode for closing a date or
 * a single pickup window.
 *
 * Kept closed behind one button. The admin is a working screen the owner
 * looks at every morning for orders; two more permanently open panels on it
 * would push the orders down the page to make room for something he touches
 * once a month.
 */

type Blocked = { id: string; email: string | null; phone_last10: string | null; name: string | null; reason: string | null; created_at: string };
type Closed = { id: string; date: string; time_slot: string | null; reason: string | null };

const todayInToronto = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date());

const field: React.CSSProperties = {
  border: "1.5px solid #E4E4E7", borderRadius: 10, padding: "9px 11px",
  fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem", color: "#161616", background: "#fff",
};
const label: React.CSSProperties = {
  display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600,
  fontSize: "0.75rem", color: "#4A4A4A", marginBottom: 4,
};

export default function AdminAvailability() {
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [closed, setClosed] = useState<Closed[]>([]);
  const [setupNeeded, setSetupNeeded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [cust, setCust] = useState({ name: "", email: "", phone: "", reason: "" });
  const [day, setDay] = useState({ date: "", timeSlot: "", reason: "" });

  const windows = [...PICKUP_WINDOWS.map(w => w.label), ...DETAILING_WINDOWS.map(w => w.label)];

  async function load() {
    setError(null);
    try {
      const [b, h] = await Promise.all([
        fetch("/api/admin/blocklist").then(r => r.json().then(d => ({ ok: r.ok, d }))),
        fetch("/api/admin/holidays").then(r => r.json().then(d => ({ ok: r.ok, d }))),
      ]);
      if (b.d?.setupNeeded || h.d?.setupNeeded) {
        setSetupNeeded(b.d?.error ?? h.d?.error);
        return;
      }
      setSetupNeeded(null);
      if (b.ok) setBlocked(b.d.blocked ?? []);
      if (h.ok) setClosed(h.d.closed ?? []);
    } catch {
      setError("Couldn't load. Please refresh.");
    }
  }

  useEffect(() => { if (open) load(); }, [open]);

  async function send(url: string, init: RequestInit, onDone: () => void) {
    setBusy(true); setError(null);
    try {
      const res = await fetch(url, init);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "That didn't work");
      onDone();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost"
        style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", fontSize: "0.85rem" }}>
        <CalendarOff size={15} /> Blocked customers &amp; holidays
      </button>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E4E4E7", borderRadius: 16, padding: 20, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#161616" }}>
          Blocked customers &amp; holidays
        </h2>
        <button onClick={() => setOpen(false)} aria-label="Close"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#8C8C8C", display: "inline-flex" }}>
          <X size={18} />
        </button>
      </div>

      {setupNeeded && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#FFF7ED", border: "1px solid rgba(234,88,12,0.3)", borderRadius: 12, padding: "13px 15px" }}>
          <AlertTriangle size={17} color="#C2410C" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.83rem", color: "#9A3412", lineHeight: 1.6 }}>
            {setupNeeded}
          </p>
        </div>
      )}

      {error && (
        <p style={{ color: "#EF4444", fontSize: "0.82rem", marginBottom: 12, fontFamily: "Kodchasan, sans-serif" }}>{error}</p>
      )}

      {!setupNeeded && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 24 }}>

          {/* ── Blocked customers ─────────────────────────────────────── */}
          <section>
            <h3 style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#161616", marginBottom: 4 }}>
              <Ban size={14} color="#B30F14" /> Blocked from booking online
            </h3>
            <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.76rem", color: "#6B6B6B", marginBottom: 12, lineHeight: 1.6 }}>
              They are asked to call instead, and are not told they are on a list.
              You can still create an order for them yourself.
            </p>

            <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><label style={label}>Name</label>
                  <input style={{ ...field, width: "100%" }} value={cust.name} onChange={e => setCust({ ...cust, name: e.target.value })} placeholder="For your list" /></div>
                <div><label style={label}>Phone</label>
                  <input style={{ ...field, width: "100%" }} value={cust.phone} onChange={e => setCust({ ...cust, phone: e.target.value })} placeholder="416 555 1234" /></div>
              </div>
              <div><label style={label}>Email</label>
                <input style={{ ...field, width: "100%" }} value={cust.email} onChange={e => setCust({ ...cust, email: e.target.value })} placeholder="name@example.com" /></div>
              <div><label style={label}>Reason (only you see this)</label>
                <input style={{ ...field, width: "100%" }} value={cust.reason} onChange={e => setCust({ ...cust, reason: e.target.value })} placeholder="e.g. unpaid order STX-123456" /></div>
            </div>
            <button
              className="btn-primary" disabled={busy || (!cust.email.trim() && !cust.phone.trim())}
              style={{ padding: "8px 14px", fontSize: "0.8rem", opacity: (busy || (!cust.email.trim() && !cust.phone.trim())) ? 0.5 : 1 }}
              onClick={() => send("/api/admin/blocklist", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cust),
              }, () => setCust({ name: "", email: "", phone: "", reason: "" }))}
            >
              <Plus size={13} style={{ marginRight: 5 }} /> Block this customer
            </button>

            <ul style={{ listStyle: "none", marginTop: 14, display: "grid", gap: 6 }}>
              {blocked.length === 0 && (
                <li style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#8C8C8C" }}>Nobody is blocked.</li>
              )}
              {blocked.map(b => (
                <li key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, border: "1px solid #EEE", borderRadius: 10, padding: "9px 11px" }}>
                  <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#4A4A4A", minWidth: 0 }}>
                    <strong style={{ color: "#161616" }}>{b.name || b.email || b.phone_last10}</strong>
                    <span style={{ display: "block", color: "#8C8C8C", fontSize: "0.74rem", wordBreak: "break-all" }}>
                      {[b.email, b.phone_last10 && `…${b.phone_last10}`].filter(Boolean).join(" · ")}
                      {b.reason ? ` — ${b.reason}` : ""}
                    </span>
                  </span>
                  <button onClick={() => send(`/api/admin/blocklist?id=${b.id}`, { method: "DELETE" }, () => {})}
                    className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.74rem", flexShrink: 0 }}>Unblock</button>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Holiday mode ──────────────────────────────────────────── */}
          <section>
            <h3 style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#161616", marginBottom: 4 }}>
              <CalendarOff size={14} color="#B30F14" /> Holiday mode — closed dates
            </h3>
            <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.76rem", color: "#6B6B6B", marginBottom: 12, lineHeight: 1.6 }}>
              Customers can&apos;t book these. Leave the window on &ldquo;Whole day&rdquo; to close the
              day completely. Orders already booked are not affected.
            </p>

            <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><label style={label}>Date</label>
                  <input type="date" min={todayInToronto()} style={{ ...field, width: "100%" }}
                    value={day.date} onChange={e => setDay({ ...day, date: e.target.value })} /></div>
                <div><label style={label}>Window</label>
                  <select style={{ ...field, width: "100%" }} value={day.timeSlot} onChange={e => setDay({ ...day, timeSlot: e.target.value })}>
                    <option value="">Whole day</option>
                    {windows.map(w => <option key={w} value={w}>{w}</option>)}
                  </select></div>
              </div>
              <div><label style={label}>Reason (only you see this)</label>
                <input style={{ ...field, width: "100%" }} value={day.reason} onChange={e => setDay({ ...day, reason: e.target.value })} placeholder="e.g. Diwali, staff off" /></div>
            </div>
            <button
              className="btn-primary" disabled={busy || !day.date}
              style={{ padding: "8px 14px", fontSize: "0.8rem", opacity: (busy || !day.date) ? 0.5 : 1 }}
              onClick={() => send("/api/admin/holidays", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(day),
              }, () => setDay({ date: "", timeSlot: "", reason: "" }))}
            >
              <Plus size={13} style={{ marginRight: 5 }} /> Close this date
            </button>

            <ul style={{ listStyle: "none", marginTop: 14, display: "grid", gap: 6 }}>
              {closed.length === 0 && (
                <li style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#8C8C8C" }}>No closed dates coming up.</li>
              )}
              {closed.map(c => (
                <li key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, border: "1px solid #EEE", borderRadius: 10, padding: "9px 11px" }}>
                  <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#4A4A4A" }}>
                    <strong style={{ color: "#161616" }}>{c.date}</strong>
                    <span style={{ display: "block", color: "#8C8C8C", fontSize: "0.74rem" }}>
                      {c.time_slot ?? "Whole day"}{c.reason ? ` — ${c.reason}` : ""}
                    </span>
                  </span>
                  <button onClick={() => send(`/api/admin/holidays?id=${c.id}`, { method: "DELETE" }, () => {})}
                    className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.74rem", flexShrink: 0 }}>Reopen</button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
