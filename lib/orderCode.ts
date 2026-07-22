// Short human-readable order ID shown to the customer, e.g. STX-482913 or
// DTX-482913. Two prefixes so wash & fold and dry-clean-family orders are
// visually easy to tell apart at a glance on the admin console:
//   STX — Wash & Fold, Same-Day Express (washed/laundered by weight)
//   DTX — Dry Clean, Ironing, Household, Car & Sofa Detailing (priced per item)
const DRY_CLEAN_FAMILY = new Set(["dry-clean", "ironing", "household", "detailing"]);

export function codePrefixForService(serviceId: string): "STX" | "DTX" {
  return DRY_CLEAN_FAMILY.has(serviceId) ? "DTX" : "STX";
}

export function generateOrderCode(serviceId: string = "wash-fold"): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `${codePrefixForService(serviceId)}-${n}`;
}

// Colour coding for order codes across admin/tracker UI — keeps the two
// families bifurcated visually wherever a code chip is rendered.
export const ORDER_CODE_COLORS: Record<"STX" | "DTX", { text: string; bg: string; border: string }> = {
  STX: { text: "#8F2740", bg: "rgba(143,39,64,0.08)",  border: "rgba(143,39,64,0.25)" },  // brand red — wash & fold
  DTX: { text: "#946200", bg: "rgba(148,98,0,0.10)",   border: "rgba(148,98,0,0.28)" },   // amber/gold — dry clean family
};

export function orderCodeColor(code: string) {
  const prefix = code.split("-")[0] as "STX" | "DTX";
  return ORDER_CODE_COLORS[prefix] ?? ORDER_CODE_COLORS.STX;
}
