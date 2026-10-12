"use client";

import { PLANS, MINIMUM_ORDER } from "@/lib/pricing";

// Rough, deliberately conservative guides. Nobody owns a laundry scale, so
// without these a weight box just produces a wild guess and an estimate that
// misleads. Each is phrased as a range and rounded down.
const PRESETS = [
  { lbs: 10, label: "10 lb", hint: "A small load" },
  { lbs: 15, label: "15 lb", hint: "A full kitchen bag" },
  { lbs: 20, label: "20 lb", hint: "A week for one person" },
  { lbs: 30, label: "30 lb", hint: "A week for a couple" },
  { lbs: 45, label: "45 lb", hint: "A family week" },
  { lbs: 60, label: "60 lb", hint: "A big catch-up load" },
];

export default function WeightPicker({
  serviceId,
  weightLbs,
  onChange,
}: {
  serviceId: string;
  weightLbs: number | null;
  onChange: (lbs: number | null) => void;
}) {
  const plan = PLANS.find(p => p.id === serviceId);
  const rate = plan?.price ?? 0;
  // Below this the minimum order value is what you pay, so the per-pound rate
  // is irrelevant — worth saying plainly rather than letting someone discover
  // it on the bill.
  const breakEvenLbs = rate > 0 ? Math.ceil(MINIMUM_ORDER.standardCad / rate) : 0;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
        {PRESETS.map(p => {
          const selected = weightLbs === p.lbs;
          return (
            <button
              key={p.lbs}
              type="button"
              onClick={() => onChange(selected ? null : p.lbs)}
              style={{
                padding: "12px 10px", textAlign: "left",
                border: `1.5px solid ${selected ? "#ED1D24" : "#E4E4E7"}`,
                borderRadius: 12, background: selected ? "#FFF5F6" : "#ffffff",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.95rem", color: selected ? "#B30F14" : "#161616", margin: 0 }}>
                {p.label}
              </p>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#8C8C8C", margin: "2px 0 0" }}>
                {p.hint}
              </p>
            </button>
          );
        })}
      </div>

      <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#161616", marginBottom: 6 }}>
        Or enter your own estimate
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="number"
          min={0}
          max={400}
          inputMode="numeric"
          value={weightLbs ?? ""}
          onChange={e => {
            const v = e.target.value;
            if (v === "") return onChange(null);
            const n = Math.max(0, Math.min(400, Math.round(Number(v))));
            onChange(Number.isFinite(n) ? n : null);
          }}
          placeholder="e.g. 22"
          style={{
            width: 120, padding: "11px 14px", border: "1.5px solid #E4E4E7", borderRadius: 12,
            fontSize: "0.95rem", color: "#161616", fontFamily: "Kodchasan, sans-serif",
            outline: "none", background: "#ffffff", boxSizing: "border-box",
          }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#ED1D24"}
          onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E4E4E7"}
        />
        <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.9rem", color: "#6B6B6B" }}>
          lb &nbsp;×&nbsp; ${rate.toFixed(2)}/lb
        </span>
      </div>

      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#6B6B6B", marginTop: 14, lineHeight: 1.6 }}>
        A rough number is fine — we weigh everything at pickup and the price is confirmed from the real
        weight, not this estimate. Under about {breakEvenLbs} lb the ${MINIMUM_ORDER.standardCad} minimum
        order value is what applies.
      </p>
    </div>
  );
}
