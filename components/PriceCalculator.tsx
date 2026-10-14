"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ArrowRight } from "lucide-react";
import { MINIMUM_ORDER, HST_LABEL, HST_RATE, PLANS, calculateHst, itemKey, lookupCatalogItem } from "@/lib/pricing";

// This calculator used to carry its own copy of the prices, which is how it
// came to be quoting $6.99 shirts and $9.99 trousers for three days after the
// 10 Oct price cut (reported by the client, 13 Oct). It now names the items it
// wants and reads every price straight out of the catalog in lib/pricing.ts,
// so a price can only ever be changed in one place.
type Pick = { tab: string; name: string };

function resolve(picks: Pick[]) {
  return picks
    .map(p => {
      const key = itemKey(p.tab, p.name);
      const found = lookupCatalogItem(key);
      // An item renamed in the catalog simply drops out of the calculator
      // rather than rendering a crash or a stale price.
      return found ? { key, label: found.item.name, price: found.item.price, from: !!found.item.from } : null;
    })
    .filter(Boolean) as { key: string; label: string; price: number; from: boolean }[];
}

// A representative slice of the catalog — enough per category to give a
// realistic estimate without turning this into a second full price list.
const DRY_CLEAN_ITEMS = resolve([
  { tab: "dry-clean", name: "Shirt / T-Shirt" },
  { tab: "dry-clean", name: "Pant / Skirt / Bottom" },
  { tab: "dry-clean", name: "Sweater" },
  { tab: "dry-clean", name: "Dress Casual" },
  { tab: "dry-clean", name: "Coat / Jacket" },
  { tab: "dry-clean", name: "2 Pcs Suit" },
]);

const HOUSEHOLD_ITEMS = resolve([
  { tab: "household", name: "Pillow" },
  { tab: "household", name: "Sleeping Bag" },
  { tab: "household", name: "Single Blanket" },
  { tab: "household", name: "Queen Duvet / Comforter / Quilt" },
]);

const IRONING_ITEMS = resolve([
  { tab: "ironing", name: "T-Shirt / Shorts / Skirts" },
  { tab: "ironing", name: "Shirt / Blouse" },
  { tab: "ironing", name: "Saree / Complex Fancy Dress" },
]);

// The by-weight services, also read from the catalog so Wash & Press can't go
// missing here the way it did when it was added on 10 Oct.
const WEIGHT_PLANS = PLANS.filter(p => p.unit === "per lb" && typeof p.price === "number") as
  { id: string; label: string; unit: string; price: number; turnaround: string }[];

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="Decrease"
        style={{
          width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(20,20,20,0.15)",
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, color: "#4A4A4A",
        }}
      >
        <Minus size={13} />
      </button>
      <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#161616", minWidth: 18, textAlign: "center" }}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
        style={{
          width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(237,29,36,0.3)",
          background: "#FDF0F1", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, color: "#ED1D24",
        }}
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

function CategoryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "22px 24px", border: "1px solid rgba(20,20,20,0.07)" }}>
      <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#ED1D24", marginBottom: 14 }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function ItemRow({ label, price, value, onChange }: { label: string; price: number; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div>
        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem", color: "#161616", fontWeight: 500 }}>{label}</p>
        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#8C8C8C" }}>${price.toFixed(2)} each</p>
      </div>
      <Stepper value={value} onChange={onChange} />
    </div>
  );
}

export default function PriceCalculator() {
  const [lbs, setLbs] = useState(0);
  const [planId, setPlanId] = useState(WEIGHT_PLANS[0]?.id ?? "wash-fold");
  const [qty, setQty] = useState<Record<string, number>>({});

  const setItem = (key: string, v: number) => setQty((p) => ({ ...p, [key]: v }));

  const allItems = [...DRY_CLEAN_ITEMS, ...HOUSEHOLD_ITEMS, ...IRONING_ITEMS];
  const plan = WEIGHT_PLANS.find(p => p.id === planId) ?? WEIGHT_PLANS[0];

  const { itemsSubtotal, washSubtotal, totalItems, subtotal, hst, total, belowMinimum } = useMemo(() => {
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const itemsSubtotal = round2(allItems.reduce((sum, it) => sum + (qty[it.key] ?? 0) * it.price, 0));
    const washSubtotal = round2(lbs * (plan?.price ?? 0));
    const totalItems = allItems.reduce((sum, it) => sum + (qty[it.key] ?? 0), 0);
    const rawSubtotal = round2(itemsSubtotal + washSubtotal);
    const subtotal = Math.max(rawSubtotal, rawSubtotal > 0 ? MINIMUM_ORDER.standardCad : 0);
    // The headline figure used to be the pre-tax subtotal with "+HST" beneath
    // it, so the number a customer remembered was 13% under what they'd pay.
    // The booking flow now shows tax explicitly; this matches it.
    const { hst, total } = calculateHst(subtotal);
    return { itemsSubtotal, washSubtotal, totalItems, subtotal, hst, total, belowMinimum: rawSubtotal > 0 && rawSubtotal < MINIMUM_ORDER.standardCad };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty, lbs, planId]);

  return (
    <div style={{ background: "#F2F2F2", borderRadius: 24, padding: "36px" }} className="calc-wrap">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28 }} className="calc-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CategoryCard title="By Weight">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {WEIGHT_PLANS.map(p => {
                const on = p.id === planId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    style={{
                      padding: "7px 13px", borderRadius: 999,
                      border: `1.5px solid ${on ? "#ED1D24" : "rgba(20,20,20,0.15)"}`,
                      background: on ? "#FDF0F1" : "#fff", color: on ? "#B30F14" : "#4A4A4A",
                      fontFamily: "Kodchasan, sans-serif", fontWeight: on ? 700 : 500, fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    {p.label} · ${p.price.toFixed(2)}/lb
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem", color: "#161616", fontWeight: 500 }}>Approx. weight (lbs)</p>
                <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#8C8C8C" }}>${(plan?.price ?? 0).toFixed(2)} per lb</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button type="button" onClick={() => setLbs(Math.max(0, lbs - 5))} aria-label="Decrease"
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(20,20,20,0.15)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#4A4A4A" }}>
                  <Minus size={13} />
                </button>
                <input
                  type="number" min={0} inputMode="numeric" value={lbs || ""}
                  onChange={(e) => setLbs(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  style={{ width: 52, textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#161616", border: "1px solid rgba(20,20,20,0.12)", borderRadius: 8, padding: "4px 2px", background: "#fff" }}
                />
                <button type="button" onClick={() => setLbs(lbs + 5)} aria-label="Increase"
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(237,29,36,0.3)", background: "#FDF0F1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ED1D24" }}>
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </CategoryCard>

          <CategoryCard title="Dry Cleaning">
            {DRY_CLEAN_ITEMS.map((it) => (
              <ItemRow key={it.key} label={it.label} price={it.price} value={qty[it.key] ?? 0} onChange={(v) => setItem(it.key, v)} />
            ))}
          </CategoryCard>

          <CategoryCard title="Household">
            {HOUSEHOLD_ITEMS.map((it) => (
              <ItemRow key={it.key} label={it.label} price={it.price} value={qty[it.key] ?? 0} onChange={(v) => setItem(it.key, v)} />
            ))}
          </CategoryCard>

          <CategoryCard title="Ironing & Press">
            {IRONING_ITEMS.map((it) => (
              <ItemRow key={it.key} label={it.label} price={it.price} value={qty[it.key] ?? 0} onChange={(v) => setItem(it.key, v)} />
            ))}
          </CategoryCard>
        </div>

        {/* Sticky running total */}
        <div style={{ position: "sticky", top: 100, alignSelf: "start" }}>
          <div style={{ background: "#161616", borderRadius: 20, padding: "28px 24px", color: "#fff" }}>
            <p style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 10 }}>
              Estimated Total
            </p>
            <motion.p
              key={total.toFixed(2)}
              initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2.5rem", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 4 }}
            >
              ${total.toFixed(2)}
            </motion.p>
            <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginBottom: 18 }}>
              {total > 0 ? `Including HST — item prices shown ${HST_LABEL}` : `Prices shown ${HST_LABEL}`}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
              {lbs > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif", color: "rgba(255,255,255,0.8)" }}>
                  <span>{plan?.label} ({lbs} lb)</span><span>${washSubtotal.toFixed(2)}</span>
                </div>
              )}
              {totalItems > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif", color: "rgba(255,255,255,0.8)" }}>
                  <span>{totalItems} item{totalItems !== 1 ? "s" : ""}</span><span>${itemsSubtotal.toFixed(2)}</span>
                </div>
              )}
              {lbs === 0 && totalItems === 0 && (
                <p style={{ fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif", color: "rgba(255,255,255,0.55)" }}>
                  Add a weight or item quantities above to see your estimate.
                </p>
              )}
            </div>

            {total > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif", color: "rgba(255,255,255,0.8)" }}>
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontFamily: "Kodchasan, sans-serif", color: "rgba(255,255,255,0.8)" }}>
                  <span>HST ({Math.round(HST_RATE * 100)}%)</span><span>${hst.toFixed(2)}</span>
                </div>
              </div>
            )}

            {belowMinimum && (
              <p style={{ fontSize: "0.78rem", fontFamily: "Kodchasan, sans-serif", color: "#FBBF77", marginBottom: 16, lineHeight: 1.5 }}>
                ${MINIMUM_ORDER.standardCad} minimum order value applied.
              </p>
            )}

            <a
              href="/book"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "#ED1D24", color: "#fff", textDecoration: "none",
                padding: "13px", borderRadius: 120, fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem",
              }}
            >
              Book This Estimate <ArrowRight size={15} />
            </a>
            <p style={{ fontSize: "0.72rem", fontFamily: "Kodchasan, sans-serif", color: "rgba(255,255,255,0.45)", marginTop: 12, lineHeight: 1.5 }}>
              This is an estimate only — final price is confirmed at pickup once we weigh/inspect your items.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .calc-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .calc-wrap { padding: 24px 18px !important; }
        }
      `}</style>
    </div>
  );
}
