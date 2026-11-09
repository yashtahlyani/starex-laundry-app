"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, CheckCircle } from "lucide-react";
import { PLANS, PICKUP_WINDOWS, DETAILING_WINDOWS } from "@/lib/pricing";

/**
 * Staff creating a booking for a customer who phoned, messaged or walked in
 * (per client, 2026-11-09: "give Admin the right to create a new booking
 * with email ID provided by the customers").
 *
 * Posts to the same /api/bookings as the public form, so the order gets the
 * same code, the same confirmation to the customer and the same alert to the
 * owner. Nothing here revalidates the input beyond keeping the button
 * disabled: the endpoint is the authority on what a valid booking is, and a
 * second copy of those rules here would drift from it.
 *
 * No card is collected. Since 7 Nov a booking never needs one — the customer
 * pays when the order is ready, by card or e-Transfer — which is exactly what
 * makes taking an order over the phone possible at all.
 */

const todayInToronto = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date());

// Widened to string: inferred from PLANS[0] it narrows to that one id, and
// then comparing against any other service is a type error.
type BookingForm = {
  name: string; email: string; phone: string; address: string;
  service: string; date: string; timeSlot: string; notes: string;
};

const EMPTY: BookingForm = {
  name: "", email: "", phone: "", address: "",
  service: PLANS[0]?.id ?? "", date: "", timeSlot: "", notes: "",
};

export default function AdminNewBooking() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const isDetailing = form.service === "detailing";
  const windows = isDetailing ? DETAILING_WINDOWS : PICKUP_WINDOWS;

  const set = (k: keyof BookingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const ready =
    form.name.trim() && form.email.trim() && form.phone.trim() &&
    form.address.trim() && form.service && form.date && form.timeSlot;

  async function submit() {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: form.service,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          date: form.date,
          timeSlot: form.timeSlot,
          notes: form.notes.trim() || undefined,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Could not create the booking");
      setDone(d.orderCode ?? d.code ?? "created");
      setForm({ ...EMPTY });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const field: React.CSSProperties = {
    width: "100%", border: "1.5px solid #E4E4E7", borderRadius: 10,
    padding: "10px 12px", fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem",
    color: "#161616", background: "#fff",
  };
  const label: React.CSSProperties = {
    display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600,
    fontSize: "0.78rem", color: "#4A4A4A", marginBottom: 5,
  };

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setDone(null); }} className="btn-primary"
        style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", fontSize: "0.85rem" }}>
        <Plus size={15} /> New booking
      </button>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E4E4E7", borderRadius: 16, padding: 20, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#161616" }}>
          New booking for a customer
        </h2>
        <button onClick={() => setOpen(false)} aria-label="Close"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#8C8C8C", display: "inline-flex" }}>
          <X size={18} />
        </button>
      </div>

      {done ? (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#F0FDF4", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "13px 15px" }}>
          <CheckCircle size={17} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#166534" }}>
              Booking created — {done}
            </p>
            <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#166534", marginTop: 2 }}>
              The customer has been emailed their confirmation. They can pay when the order is ready.
            </p>
            <button onClick={() => setDone(null)} className="btn-ghost"
              style={{ marginTop: 10, padding: "7px 13px", fontSize: "0.8rem" }}>
              Add another
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={label}>Customer name</label>
              <input style={field} value={form.name} onChange={set("name")} placeholder="Full name" />
            </div>
            <div>
              <label style={label}>Email (from the customer)</label>
              <input style={field} type="email" value={form.email} onChange={set("email")} placeholder="name@example.com" />
            </div>
            <div>
              <label style={label}>Phone</label>
              <input style={field} value={form.phone} onChange={set("phone")} placeholder="416 555 1234" />
            </div>
            <div>
              <label style={label}>Service</label>
              <select style={field} value={form.service} onChange={set("service")}>
                {PLANS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Pickup date</label>
              <input style={field} type="date" value={form.date} min={todayInToronto()} onChange={set("date")} />
            </div>
            <div>
              <label style={label}>Pickup window</label>
              <select style={field} value={form.timeSlot} onChange={set("timeSlot")}>
                <option value="">Choose a window…</option>
                {windows.map(w => <option key={w.label} value={w.label}>{w.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={label}>Pickup address</label>
            <input style={field} value={form.address} onChange={set("address")} placeholder="Street, unit, city" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>Notes (optional)</label>
            <textarea style={{ ...field, minHeight: 64, resize: "vertical" }} value={form.notes} onChange={set("notes")}
              placeholder="Anything the customer mentioned on the phone" />
          </div>

          <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "#6B6B6B", marginBottom: 12, lineHeight: 1.6 }}>
            No card is taken here. The customer gets the same confirmation email as an online booking,
            and pays by card or e-Transfer once the order is ready.
          </p>

          {error && (
            <p style={{ color: "#EF4444", fontSize: "0.82rem", marginBottom: 10, fontFamily: "Kodchasan, sans-serif" }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={submit} disabled={!ready || busy} className="btn-primary"
              style={{ padding: "10px 18px", fontSize: "0.85rem", opacity: (!ready || busy) ? 0.5 : 1, cursor: (!ready || busy) ? "not-allowed" : "pointer" }}>
              {busy ? "Creating…" : "Create booking"}
            </button>
            <button onClick={() => setOpen(false)} className="btn-ghost" style={{ padding: "10px 18px", fontSize: "0.85rem" }}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
