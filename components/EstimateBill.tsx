"use client";

import { DRY_CLEAN_COMBO, HST_RATE, MINIMUM_ORDER, type Estimate } from "@/lib/pricing";

const money = (n: number) => `$${n.toFixed(2)}`;

const row: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12,
};

/**
 * The itemized bill a customer sees before they press the order button
 * (per client, 2026-10-13).
 *
 * Deliberately shows the minimum-order top-up as its own line rather than
 * folding it into the subtotal: someone booking a single $4.99 shirt is
 * charged $40, and finding that out at pickup instead of here is exactly the
 * kind of surprise that produces a refund request.
 */
export default function EstimateBill({
  estimate,
  compact = false,
}: {
  estimate: Estimate;
  compact?: boolean;
}) {
  const e = estimate;

  if (e.mode === "inspection") {
    return (
      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem", color: "#6B6B6B", margin: 0 }}>
        Car &amp; Sofa Detailing is quoted on inspection — we&apos;ll confirm the price when we see the job.
        A {money(MINIMUM_ORDER.detailingCad)} minimum applies.
      </p>
    );
  }

  if (e.isEmpty) {
    return (
      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem", color: "#8C8C8C", margin: 0 }}>
        {e.mode === "weight"
          ? "Tell us roughly how much laundry you have and we'll estimate the bill."
          : "Add the pieces you're sending and your estimated bill appears here."}
      </p>
    );
  }

  const fs = compact ? "0.78rem" : "0.875rem";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 7 : 9 }}>
      {e.lines.map(l => {
        const fullyCovered = l.comboCovered >= l.qty;
        return (
          <div key={l.key} style={row}>
            <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: fs, color: "#4A4A4A" }}>
              {/* In weight mode `qty` is pounds and the label already spells
                  the weight out, so prefixing it would read "30x ... 30 lb". */}
              {e.mode === "items" && <>{l.qty}&times; </>}{l.name}
              {l.comboCovered > 0 && (
                <span style={{ color: "#B30F14", fontWeight: 700 }}>
                  {" "}· {l.comboCovered} in combo
                </span>
              )}
              {l.pieces > 1 && (
                <span style={{ color: "#8C8C8C" }}>
                  {" "}({l.pieces} pieces each)
                </span>
              )}
              {l.from && !fullyCovered && <span style={{ color: "#8C8C8C" }}> (from)</span>}
            </span>
            <span style={{
              fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: fs,
              color: fullyCovered ? "#8C8C8C" : "#161616", whiteSpace: "nowrap",
            }}>
              {fullyCovered ? "included" : money(l.lineTotal)}
            </span>
          </div>
        );
      })}

      {e.combo && (
        <div style={row}>
          <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: fs, color: "#B30F14", fontWeight: 700 }}>
            {DRY_CLEAN_COMBO.tagline} combo — covers {e.combo.covered} of {e.combo.slots} pieces
          </span>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: fs, color: "#B30F14", whiteSpace: "nowrap" }}>
            {money(e.combo.price)}
          </span>
        </div>
      )}

      {e.minimumApplied && (
        <>
          <div style={{ ...row, paddingTop: 8, borderTop: "1px solid #EFEFEF" }}>
            <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: fs, color: "#4A4A4A" }}>
              Your selection
            </span>
            <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: fs, color: "#161616" }}>
              {money(e.rawSubtotal)}
            </span>
          </div>
          <div style={row}>
            <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: fs, color: "#B45309" }}>
              Minimum order top-up
            </span>
            <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: fs, color: "#B45309" }}>
              +{money(e.subtotal - e.rawSubtotal)}
            </span>
          </div>
        </>
      )}

      <div style={{ ...row, paddingTop: 8, borderTop: "1px solid #EFEFEF" }}>
        <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: fs, color: "#4A4A4A" }}>Subtotal</span>
        <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: fs, color: "#161616" }}>
          {money(e.subtotal)}
        </span>
      </div>
      <div style={row}>
        <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: fs, color: "#4A4A4A" }}>
          HST ({Math.round(HST_RATE * 100)}%)
        </span>
        <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: fs, color: "#161616" }}>
          {money(e.hst)}
        </span>
      </div>

      <div style={{ ...row, paddingTop: 10, borderTop: "2px solid #161616", marginTop: 2 }}>
        <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: compact ? "0.85rem" : "1rem", color: "#161616" }}>
          Estimated total
        </span>
        <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: compact ? "1rem" : "1.375rem", color: "#ED1D24", whiteSpace: "nowrap" }}>
          {money(e.total)}
        </span>
      </div>

      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: compact ? "0.68rem" : "0.75rem", color: "#8C8C8C", lineHeight: 1.5, margin: "2px 0 0" }}>
        {e.minimumApplied && <>A {money(e.minimumCad)} minimum order value applies whatever the item count or weight. </>}
        {e.hasFromPrices && <>Items marked &ldquo;from&rdquo; can be higher depending on size, fabric and condition. </>}
        {e.mode === "weight"
          ? "Your actual weight is confirmed when we weigh the order at pickup."
          : "We confirm the final price after counting and inspecting your items."}
        {" "}This is an estimate, not a final bill — nothing is charged until it&apos;s confirmed.
      </p>
    </div>
  );
}
