"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { CATALOG, CATALOG_FOR_SERVICE, itemKey, type ItemSelection } from "@/lib/pricing";

/**
 * Quantity picker over the price catalog, so a customer can build their order
 * and see the bill before committing (per client, 2026-10-13).
 *
 * Dry cleaning spans ~28 items across two tabs, which is more than anyone
 * wants to scroll on a phone, so there's a filter box and the sections stay
 * collapsible by tab.
 */
export default function ItemPicker({
  serviceId,
  selection,
  onChange,
}: {
  serviceId: string;
  selection: ItemSelection;
  onChange: (next: ItemSelection) => void;
}) {
  const [query, setQuery] = useState("");
  const tabIds = CATALOG_FOR_SERVICE[serviceId] ?? [];

  const setQty = (key: string, qty: number) => {
    const next = { ...selection };
    if (qty <= 0) delete next[key];
    else next[key] = Math.min(qty, 99);
    onChange(next);
  };

  const q = query.trim().toLowerCase();
  const tabs = useMemo(() => tabIds.map(id => {
    const tab = CATALOG.find(t => t.id === id);
    if (!tab) return null;
    const sections = tab.sections
      .map(s => ({ ...s, items: s.items.filter(i => !q || i.name.toLowerCase().includes(q)) }))
      .filter(s => s.items.length > 0);
    return sections.length ? { tab, sections } : null;
  }).filter(Boolean) as { tab: (typeof CATALOG)[number]; sections: (typeof CATALOG)[number]["sections"] }[],
  [tabIds.join(","), q]);

  const totalPicked = Object.values(selection).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 18 }}>
        <Search size={15} color="#8C8C8C" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search items — shirt, suit, duvet…"
          style={{
            width: "100%", padding: "12px 16px 12px 38px",
            border: "1.5px solid #E4E4E7", borderRadius: 12,
            fontSize: "0.9rem", color: "#161616", fontFamily: "Kodchasan, sans-serif",
            outline: "none", background: "#ffffff", boxSizing: "border-box",
          }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#ED1D24"}
          onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E4E4E7"}
        />
      </div>

      {tabs.length === 0 && (
        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem", color: "#8C8C8C" }}>
          Nothing matches &ldquo;{query}&rdquo;. Clear the search to see all items, or just add a note at the
          next step and we&apos;ll price it at pickup.
        </p>
      )}

      {tabs.map(({ tab, sections }) => (
        <div key={tab.id} style={{ marginBottom: 26 }}>
          {(CATALOG_FOR_SERVICE[serviceId]?.length ?? 0) > 1 && (
            <p style={{
              fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.72rem",
              letterSpacing: "0.06em", textTransform: "uppercase", color: "#B30F14", marginBottom: 10,
            }}>
              {tab.id === serviceId ? tab.label : `Also available: ${tab.label}`}
            </p>
          )}
          {sections.map(section => (
            <div key={section.title} style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#6B6B6B", marginBottom: 6 }}>
                {section.title}
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {section.items.map(item => {
                  const key = itemKey(tab.id, item.name);
                  const qty = selection[key] ?? 0;
                  return (
                    <div key={key} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "9px 0", borderBottom: "1px solid #F1F1F1",
                      background: qty > 0 ? "rgba(237,29,36,0.03)" : "transparent",
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.86rem", color: "#161616", margin: 0 }}>
                          {item.name}
                        </p>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#6B6B6B", margin: 0 }}>
                          {item.from ? "From " : ""}${item.price.toFixed(2)}
                          {/* Multi-piece outfits use more than one of the
                              combo's 5 slots. Saying so on the row is what
                              stops it being an argument at the door. */}
                          {(item.pieces ?? 1) > 1 && (
                            <span style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 400, color: "#B45309" }}>
                              {" "}· counts as {item.pieces} pieces
                            </span>
                          )}
                          {item.comboExcluded && (
                            <span style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 400, color: "#B45309" }}>
                              {" "}· not in the combo
                            </span>
                          )}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          aria-label={`Remove one ${item.name}`}
                          onClick={() => setQty(key, qty - 1)}
                          disabled={qty === 0}
                          style={stepBtn(qty > 0)}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{
                          minWidth: 22, textAlign: "center", fontFamily: "Poppins, sans-serif",
                          fontWeight: 700, fontSize: "0.9rem", color: qty > 0 ? "#161616" : "#C4BCB8",
                        }}>
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Add one ${item.name}`}
                          onClick={() => setQty(key, qty + 1)}
                          style={stepBtn(true)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      {totalPicked > 0 && (
        <button
          type="button"
          onClick={() => onChange({})}
          style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#8C8C8C", textDecoration: "underline",
          }}
        >
          Clear all {totalPicked} item{totalPicked === 1 ? "" : "s"}
        </button>
      )}
    </div>
  );
}

function stepBtn(enabled: boolean): React.CSSProperties {
  return {
    width: 30, height: 30, borderRadius: 8,
    border: `1.5px solid ${enabled ? "#E4E4E7" : "#F1F1F1"}`,
    background: "#ffffff", color: enabled ? "#161616" : "#D4D4D8",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: enabled ? "pointer" : "not-allowed", flexShrink: 0,
  };
}
