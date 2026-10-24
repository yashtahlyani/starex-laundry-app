// Starex — pricing config
//
// Prices confirmed by the client (Starex Laundry / Dry Clean flyers, July 2026).
// Item prices marked `from: true` are starting prices ("$X.XX +") — final price
// can vary with size/fabric/condition and is confirmed before work begins.

export const BUSINESS_NAME = "Starex";
export const PHONE = "437-607-7251";
export const PHONE_HREF = "tel:+14376077251";
export const SERVICE_AREA = "Brampton & Mississauga";
export const SITE_URL = "www.starexlaundrydryclean.ca";

// The bookable service types (Step 1 of the booking flow)
export const PLANS = [
  { id: "wash-fold", label: "Wash & Fold",           unit: "per lb",   price: 2.00, turnaround: "24–48 hrs" },
  { id: "express",   label: "Same-Day Express",      unit: "per lb",   price: 3.00, turnaround: "Same day" },
  // Added 2026-10-10 per client: washed and pressed, priced by weight like
  // Wash & Fold rather than per garment — for people who want everything back
  // ironed without counting items.
  { id: "wash-press", label: "Wash & Press",           unit: "per lb",   price: 5.00, turnaround: "24–48 hrs" },
  { id: "dry-clean", label: "Dry Clean / Premium",   unit: "per item", price: null, turnaround: "24–48 hrs" },
  { id: "ironing",   label: "Ironing & Press",       unit: "per item", price: null, turnaround: "24–48 hrs" },
  { id: "household", label: "Household Items",       unit: "per item", price: null, turnaround: "24–48 hrs" },
  { id: "detailing", label: "Car & Sofa Detailing",  unit: "on inspection", price: null, turnaround: "By appointment" },
] as const;

// Same-Day Express is a rush option on Wash & Fold only — not available for
// dry-clean, ironing, household, or detailing.
export const EXPRESS_APPLIES_TO = "wash-fold";

export const PICKUP_DELIVERY = {
  perLbCad: 2.00,
  minimumLbs: 20,                // 20 lb minimum for a Wash & Fold order
};

// Minimum order value — charged regardless of actual weight/item count/size.
// "5 services" = wash-fold, express, dry-clean, ironing, household.
// "6th service" = Car & Sofa Detailing, which has its own higher minimum
// (a single sofa seat still costs the $199 minimum, not the per-seat rate).
export const MINIMUM_ORDER = {
  standardCad: 40,
  detailingCad: 199,
  note: "Minimum order value applies no matter the weight, item count, or size.",
};

// Ontario HST — shown as "+HST" alongside prices rather than baked into the
// displayed number, since the exact taxable total is confirmed at checkout.
export const HST_RATE = 0.13;
export const HST_LABEL = "+HST";

// The staff-confirmed order price (orders.price) is always the pre-tax
// subtotal — every price shown on the site is "+HST", so what staff weigh
// and confirm is the subtotal, not a tax-inclusive total. This computes the
// actual amount to charge/invoice from that subtotal. Amounts in dollars
// (not cents); rounded to the cent the same way Stripe amounts are.
export function calculateHst(subtotalCad: number) {
  const hst = Math.round(subtotalCad * HST_RATE * 100) / 100;
  const total = Math.round((subtotalCad + hst) * 100) / 100;
  return { subtotal: subtotalCad, hst, total };
}

export const MEMBERSHIP = {
  name: "Starex Monthly Plan",
  monthlyPriceCad: 100,
  includedLbs: 50,
  overagePerLbCad: 2, // additional laundry beyond the plan's included weight
  perks: [
    "No minimum laundry commitment",
    "2+1 pickups per month (up to 50 lbs)",
    "24–48h turnaround on all orders",
    "Free pickup & delivery included",
    "Free fabric softener, hot wash & bleach",
    "Exclusive discounts for commercial clients",
    "Additional laundry beyond 50 lbs billed at $2/lb",
  ],
};

export const DETAILING = {
  carFromCad: 200,       // car detailing (interior only) — starting price
  sofaPerSeatCad: 50,    // sofa/couch deep clean — per seat
  chairPerSeatCad: 25,   // dining chair — per seat
  minimumCad: MINIMUM_ORDER.detailingCad,
  note: "Final pricing upon inspection. $199 minimum order applies.",
};

// Dry-clean combo promo — advertised in the header offer banner and on the
// Pricing / Services pages.
export const DRY_CLEAN_COMBO = {
  tagline: "5 for $50",
  title: "Most Popular",
  priceCad: 50,
  // PIECES, not selections. A 2-piece suit uses two of them. Named
  // pieceCount (was itemCount) because the old name is what led the
  // estimator to count lines and give away a sixth garment free.
  pieceCount: 5,
  description: "Dry clean any 5 regular pieces, including 1 blanket or quilt. A 2-piece suit counts as 2.",
  exclusions: "Excludes wedding dresses, leather, suede, and other high-value items.",
  // Multi-piece garments count per piece, not per set — a 2-piece suit uses
  // 2 of the 5 slots, a 3-piece suit uses 3, etc.
  multiPieceNote: "Multi-piece items (e.g. a 2-piece suit) count as separate pieces toward your 5.",
};

// Every laundry service is priced by weight or per item, so the real total isn't
// known until staff weigh/count the order after pickup. We pre-authorize this
// minimum-charge floor at booking time and capture the real (possibly higher)
// amount from the admin dashboard once the order is weighed in.
export function estimateOrderAmountCents(serviceId: string): number {
  const minimum = serviceId === "detailing" ? MINIMUM_ORDER.detailingCad : MINIMUM_ORDER.standardCad;
  return Math.round(minimum * 100);
}

// `comboExcluded` marks the items DRY_CLEAN_COMBO.exclusions names — wedding
// dresses, leather, and the other high-value pieces — so the booking
// estimator never silently absorbs one into the 5-for-$50 deal and quotes a
// customer $50 for work that actually costs $250.
//
// `bedding` marks blankets, duvets and quilts, because the combo includes at
// most *one* of them among the 5 (see DRY_CLEAN_COMBO.description).
export type CatalogItem = {
  name: string;
  price: number;
  from?: boolean;
  comboExcluded?: boolean;
  bedding?: boolean;
  /**
   * How many garments this line actually is. A "2 Pcs Suit" is two things to
   * clean, not one, and the combo has always been sold as 5 PIECES — but the
   * estimator counted lines, so five selections could be six or seven
   * garments and the shop cleaned them all for $50 (reported 2026-10-23:
   * "we have to dry clean 6 pcs instead of 5"). Defaults to 1.
   */
  pieces?: number;
};
export type CatalogSection = { title: string; items: CatalogItem[] };
export type CatalogTab = { id: string; label: string; blurb: string; sections: CatalogSection[] };

export const CATALOG: CatalogTab[] = [
  {
    id: "ironing",
    label: "Ironing",
    blurb: "Crisp, professional pressing. 24–48h turnaround · priced per item.",
    sections: [
      {
        title: "Iron Prices",
        items: [
          { name: "Baby Clothes / Pillow Case", price: 1.99 },
          { name: "T-Shirt / Shorts / Skirts", price: 2.99 },
          { name: "Jeans / Pants", price: 3.49 },
          { name: "Shirt / Blouse", price: 3.99 },
          { name: "Simple Dress", price: 5.99 },
          { name: "Long Maxi / Pleated Skirt / Dress", price: 7.99 },
          { name: "Saree / Complex Fancy Dress", price: 9.99 },
          { name: "Table Cloth / Bedsheet", price: 7.99 },
        ],
      },
    ],
  },
  {
    id: "wash-prefs",
    label: "Wash Preferences",
    blurb: "Customize how your laundry is washed. Added on top of the $2.29/lb base rate.",
    sections: [
      {
        title: "Wash Preferences",
        items: [
          { name: "Fabric Softener / Hot Wash", price: 2.99 },
          { name: "Hand Wash / Separate", price: 4.99 },
          { name: "Pet Hair Removal", price: 7.99 },
          { name: "Extra Care / Delicates", price: 7.99 },
          { name: "Bleach", price: 2.99 },
        ],
      },
      {
        title: "Special Care",
        items: [
          { name: "Folding Only", price: 9.99 },
          { name: "Stain Treatment", price: 9.99 },
        ],
      },
    ],
  },
  {
    id: "household",
    label: "Household",
    blurb: "Blankets, duvets, curtains, rugs and more. 24–48h turnaround · priced per item.",
    sections: [
      {
        title: "Bedding",
        items: [
          { name: "Pillow", price: 9.99, from: true },
          { name: "Bed Sheet / Table Cloth", price: 9.99, from: true },
          { name: "Bed Spread", price: 29.99, from: true, bedding: true },
          { name: "King / Double Blanket", price: 29.99, from: true, bedding: true },
          { name: "Queen Blanket", price: 22.99, from: true, bedding: true },
          { name: "Single Blanket", price: 17.99, from: true, bedding: true },
          { name: "King Duvet / Comforter / Quilt", price: 39.99, from: true, bedding: true },
          { name: "Queen Duvet / Comforter / Quilt", price: 29.99, from: true, bedding: true },
          { name: "Single Duvet / Comforter / Quilt", price: 22.99, from: true, bedding: true },
          { name: "Feather Duvet / Comforter / Blanket", price: 49.99, from: true, bedding: true },
        ],
      },
      {
        title: "Curtains & More",
        items: [
          { name: "Curtain (per panel)", price: 19.99, from: true },
          { name: "Sleeping Bag", price: 29.99, from: true, bedding: true },
          { name: "Small Rug", price: 49.99, from: true, comboExcluded: true },
          { name: "Big Rug", price: 99.99, from: true, comboExcluded: true },
        ],
      },
    ],
  },
  {
    id: "dry-clean",
    label: "Dry Cleaning",
    blurb: "Dry cleaning & premium laundry for suits, dresses, and delicates. Priced per item.",
    sections: [
      {
        title: "Everyday & Formal Wear",
        items: [
          { name: "2 Pcs Suit", price: 29.99, from: true, pieces: 2 },
          { name: "Gents Suit 3 Pcs", price: 34.99, from: true, pieces: 3 },
          { name: "Ladies Suit 3 Pcs", price: 29.99, from: true, pieces: 3 },
          { name: "Shirt / T-Shirt", price: 4.99, from: true },
          { name: "Dress Casual", price: 22.99, from: true },
          { name: "Pant / Skirt / Bottom", price: 6.99, from: true },
          { name: "Sweater", price: 12.99, from: true },
          { name: "Hoodie / Sweatshirt", price: 19.99, from: true },
          { name: "Silk Shirt / Blouse", price: 12.99, from: true },
          { name: "Tie / Hat", price: 5.99, from: true },
          { name: "Vest / Scarf / Stole / Dupatta / Shawl", price: 12.99, from: true },
        ],
      },
      {
        title: "Outerwear & Occasion",
        items: [
          { name: "Coat / Jacket / Blazer", price: 22.99, from: true },
          { name: "Long Coat / Winter Jacket", price: 29.99, from: true },
          { name: "Leather Jacket", price: 99.99, from: true, comboExcluded: true },
          { name: "Gown / Long Dress", price: 29.99, from: true },
          { name: "Jump Suit", price: 29.99, from: true },
          { name: "Dress Formal / Evening", price: 29.99, from: true },
          { name: "Kurta Pyjama", price: 19.99, from: true, pieces: 2 },
          { name: "Parka / Canada Goose Style Jacket", price: 39.99, from: true },
          { name: "Punjabi Suit 2 Pcs", price: 24.99, from: true, pieces: 2 },
          { name: "Saree", price: 29.99, from: true },
        ],
      },
      {
        title: "Household & Misc",
        items: [
          { name: "Sleeping Bag", price: 19.99, from: true, bedding: true },
          { name: "Small Rug", price: 49.99, from: true, comboExcluded: true },
          { name: "Big Rug", price: 99.99, from: true, comboExcluded: true },
          { name: "Shoes", price: 19.99, from: true, comboExcluded: true },
        ],
      },
      {
        title: "Special Care",
        items: [
          { name: "Wedding Dress", price: 249.99, from: true, comboExcluded: true },
          { name: "Lehenga", price: 149.99, from: true, comboExcluded: true },
          { name: "Carpet", price: 74.99, from: true, comboExcluded: true },
        ],
      },
    ],
  },
  {
    id: "detailing",
    label: "Car & Sofa Detailing",
    blurb: "Deep clean, shampoo & dry-clean detailing for vehicles and upholstery. Final pricing upon inspection.",
    sections: [
      {
        title: "Detailing",
        items: [
          { name: "Car Detailing (Interior Only)", price: 200, from: true },
          { name: "Sofa / Couch (per seat)", price: 50, from: true },
          { name: "Dining Chair (per seat)", price: 25, from: true },
        ],
      },
    ],
  },
];

// Pickup windows. Defined here, not in the booking page, because the FAQ also
// quotes them — and when it kept its own copy it advertised a 7-10 AM window
// that has never been bookable (found 2026-10-25).
export const PICKUP_WINDOWS = [
  { label: "8:00 AM – 11:00 AM", startHour: 8 },
  { label: "11:00 AM – 2:00 PM", startHour: 11 },
  { label: "2:00 PM – 5:00 PM",  startHour: 14 },
  { label: "5:00 PM – 8:00 PM",  startHour: 17 },
] as const;

// Car & Sofa Detailing uses half-day appointment windows instead — a detailer
// visit runs longer than a laundry pickup (per client, 2026-09-06).
export const DETAILING_WINDOWS = [
  { label: "8:00 AM – 1:00 PM", startHour: 8 },
  { label: "1:00 PM – 6:00 PM", startHour: 13 },
] as const;

export const SERVICE_AREA_POSTAL_PREFIXES: string[] = [
  // TODO: fill in the real serviceable postal code prefixes once confirmed.
];

// ---------------------------------------------------------------------------
// Booking estimator
//
// Added 2026-10-13 per client: "the customer wants to see the bill when he
// puts an order for drycleaning and then press the order button, after
// checking the total price (at least estimated)".
//
// This is an ESTIMATE, never a quote. Most catalog prices are `from:` prices
// that vary with size, fabric and condition, and per-pound services aren't
// weighed until pickup — so every surface that shows a number from here also
// has to say it is confirmed before work begins. What it is genuinely good
// for is letting someone see the shape of the bill (and, more importantly,
// the $40 minimum) before they commit, instead of after a van has driven out.
// ---------------------------------------------------------------------------

// Which catalog tabs a given service prices from. Dry cleaning and household
// overlap heavily — blankets, curtains and rugs can go either way — so a
// dry-clean booking can pick from both rather than having to leave the flow.
export const CATALOG_FOR_SERVICE: Record<string, string[]> = {
  "dry-clean": ["dry-clean", "household"],
  "ironing":   ["ironing"],
  "household": ["household", "dry-clean"],
};

export const PER_ITEM_SERVICES = ["dry-clean", "ironing", "household"];
export const PER_LB_SERVICES   = ["wash-fold", "express", "wash-press"];

export function isPerItemService(id: string) { return PER_ITEM_SERVICES.includes(id); }
export function isPerLbService(id: string)   { return PER_LB_SERVICES.includes(id); }

// "Sleeping Bag" exists in both the dry-clean tab ($19.99) and the household
// tab ($29.99) — so a selection keyed on the item name alone would price the
// wrong one. Every key carries its tab.
export function itemKey(tabId: string, name: string) { return `${tabId}::${name}`; }

export function lookupCatalogItem(key: string): { tabId: string; item: CatalogItem } | null {
  const [tabId, name] = key.split("::");
  const tab = CATALOG.find(t => t.id === tabId);
  const item = tab?.sections.flatMap(s => s.items).find(i => i.name === name);
  return tab && item ? { tabId, item } : null;
}

/** qty keyed by itemKey(tabId, name) */
export type ItemSelection = Record<string, number>;

export type EstimateLine = {
  key: string;
  name: string;
  unitPrice: number;
  qty: number;
  from: boolean;
  lineTotal: number;
  /** garments per unit of this line — a 2 Pcs Suit is 2 */
  pieces: number;
  /** of `qty`, how many units the 5-for-$50 combo absorbed */
  comboCovered: number;
};

export type Estimate = {
  mode: "items" | "weight" | "inspection";
  lines: EstimateLine[];
  itemCount: number;
  /** present only when the combo applies */
  combo: { price: number; covered: number; slots: number } | null;
  /** what the selection comes to before the minimum order value is applied */
  rawSubtotal: number;
  minimumCad: number;
  /** true when the minimum order value is higher than what was selected */
  minimumApplied: boolean;
  subtotal: number;
  hst: number;
  total: number;
  /** any line is a "from" price, so the real total can be higher */
  hasFromPrices: boolean;
  /** nothing picked yet — callers should show a prompt, not "$0.00" */
  isEmpty: boolean;
  /**
   * With the combo on: what it saves against pricing the same basket item by
   * item. NEGATIVE means the combo costs more — which happens on small
   * baskets, because the flat $50 is above the $40 minimum. The booking flow
   * actively pushes the combo, so it has to be honest when it is the worse
   * deal; null when the combo isn't applied.
   */
  comboSavingCad: number | null;
};

export function buildEstimate(opts: {
  serviceId: string;
  selection?: ItemSelection;
  weightLbs?: number | null;
  isCombo?: boolean;
}): Estimate {
  const { serviceId, selection = {}, weightLbs = null, isCombo = false } = opts;

  const minimumCad = serviceId === "detailing" ? MINIMUM_ORDER.detailingCad : MINIMUM_ORDER.standardCad;
  const base = {
    minimumCad,
    combo: null as Estimate["combo"],
    hasFromPrices: false,
    lines: [] as EstimateLine[],
    itemCount: 0,
  };

  // Car & Sofa Detailing is quoted on inspection — there is nothing honest to
  // compute here, so it returns an empty estimate rather than a fake one.
  if (serviceId === "detailing") {
    return { ...base, mode: "inspection", rawSubtotal: 0, minimumApplied: false,
             subtotal: 0, hst: 0, total: 0, isEmpty: true, comboSavingCad: null };
  }

  if (isPerLbService(serviceId)) {
    const plan = PLANS.find(p => p.id === serviceId);
    const rate = plan?.price ?? 0;
    const lbs = Math.max(0, weightLbs ?? 0);
    const rawSubtotal = round2(lbs * rate);
    const { subtotal, hst, total, minimumApplied } = applyMinimum(rawSubtotal, minimumCad);
    return {
      ...base,
      mode: "weight",
      lines: lbs > 0 ? [{
        key: serviceId, name: `${plan?.label ?? "Laundry"} — ${lbs} lb @ $${rate.toFixed(2)}/lb`,
        unitPrice: rate, qty: lbs, from: false, lineTotal: rawSubtotal, pieces: 1, comboCovered: 0,
      }] : [],
      itemCount: 0,
      rawSubtotal, minimumApplied, subtotal, hst, total,
      isEmpty: lbs <= 0,
      comboSavingCad: null,
    };
  }

  // ---- per-item services -------------------------------------------------
  // Expand the selection into one entry per physical piece, because the combo
  // is counted in pieces: a 2-piece suit uses 2 of the 5 slots, not 1
  // (DRY_CLEAN_COMBO.multiPieceNote).
  type Unit = { key: string; name: string; price: number; from: boolean; excluded: boolean; bedding: boolean; pieces: number };
  const units: Unit[] = [];
  for (const [key, qty] of Object.entries(selection)) {
    const found = lookupCatalogItem(key);
    if (!found || qty <= 0) continue;
    for (let i = 0; i < qty; i++) {
      units.push({
        key,
        name: found.item.name,
        price: found.item.price,
        from: !!found.item.from,
        excluded: !!found.item.comboExcluded,
        bedding: !!found.item.bedding,
        pieces: found.item.pieces ?? 1,
      });
    }
  }

  if (units.length === 0) {
    return { ...base, mode: "items", rawSubtotal: 0, minimumApplied: false,
             subtotal: 0, hst: 0, total: 0, isEmpty: true, comboSavingCad: null };
  }

  // Decide which pieces the combo absorbs. Sorted most expensive first so the
  // deal is applied in the customer's favour — the alternative (cheapest
  // first) would quote a higher total for the same basket.
  const coveredKeys = new Map<string, number>();
  let comboCoveredTotal = 0;   // PIECES absorbed, not lines
  if (isCombo) {
    const eligible = units
      .map((u, i) => ({ u, i }))
      .filter(({ u }) => !u.excluded)
      .sort((a, b) => b.u.price - a.u.price);
    let beddingUsed = 0;
    for (const { u, i } of eligible) {
      const remaining = DRY_CLEAN_COMBO.pieceCount - comboCoveredTotal;
      if (remaining <= 0) break;
      // A 3-piece suit cannot half-ride in two remaining slots — you can't
      // clean two thirds of a suit. It either fits whole or it is billed
      // separately, and `continue` rather than `break` lets a smaller garment
      // later in the list still use the space up.
      if (u.pieces > remaining) continue;
      // "any 5 regular garments/pieces, including 1 blanket or quilt" — so at
      // most one bedding piece can ride inside the combo.
      if (u.bedding && beddingUsed >= 1) continue;
      if (u.bedding) beddingUsed++;
      coveredKeys.set(u.key, (coveredKeys.get(u.key) ?? 0) + 1);
      comboCoveredTotal += u.pieces;
      units[i] = { ...u, price: 0 }; // absorbed; priced by the flat combo fee
    }
  }

  // Collapse back to one display line per catalog item.
  const byKey = new Map<string, EstimateLine>();
  for (const [key, qty] of Object.entries(selection)) {
    const found = lookupCatalogItem(key);
    if (!found || qty <= 0) continue;
    const covered = coveredKeys.get(key) ?? 0;
    const billedQty = qty - covered;
    byKey.set(key, {
      key,
      name: found.item.name,
      unitPrice: found.item.price,
      qty,
      from: !!found.item.from,
      lineTotal: round2(billedQty * found.item.price),
      pieces: found.item.pieces ?? 1,
      comboCovered: covered,
    });
  }
  const lines = [...byKey.values()];

  const itemsTotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
  const rawSubtotal = round2(itemsTotal + (isCombo ? DRY_CLEAN_COMBO.priceCad : 0));
  const { subtotal, hst, total, minimumApplied } = applyMinimum(rawSubtotal, minimumCad);

  return {
    mode: "items",
    lines,
    itemCount: units.reduce((n, u) => n + u.pieces, 0),
    combo: isCombo
      ? { price: DRY_CLEAN_COMBO.priceCad, covered: comboCoveredTotal, slots: DRY_CLEAN_COMBO.pieceCount }
      : null,
    rawSubtotal,
    minimumCad,
    minimumApplied,
    subtotal,
    hst,
    total,
    hasFromPrices: lines.some(l => l.from && l.lineTotal > 0),
    isEmpty: false,
    // Priced the same basket without the combo to compare. Safe from
    // recursion: the inner call passes isCombo false, which returns here.
    comboSavingCad: isCombo
      ? round2(buildEstimate({ serviceId, selection, isCombo: false }).total - total)
      : null,
  };
}

function round2(n: number) { return Math.round(n * 100) / 100; }

// The minimum order value is charged no matter the weight, item count or size
// (MINIMUM_ORDER.note), so it is a floor on the subtotal — not a separate fee
// added on top, and HST is calculated after it is applied.
function applyMinimum(rawSubtotal: number, minimumCad: number) {
  const minimumApplied = rawSubtotal > 0 && rawSubtotal < minimumCad;
  const subtotal = Math.max(rawSubtotal, rawSubtotal > 0 ? minimumCad : 0);
  const { hst, total } = calculateHst(subtotal);
  return { subtotal, hst, total, minimumApplied };
}

/**
 * One-line summary of what the customer was shown, to travel with the order so
 * staff can see what they expected to pay before anything was weighed.
 * Capped so it can't blow the notes field's server-side length limit.
 */
export function formatEstimateNote(est: Estimate, serviceId: string): string | null {
  if (est.isEmpty || est.mode === "inspection") return null;
  const parts: string[] = [];
  if (est.mode === "weight") {
    parts.push(`approx. ${est.lines[0]?.qty ?? 0} lb`);
  } else {
    for (const l of est.lines) parts.push(`${l.qty}x ${l.name}`);
  }
  let body = parts.join(", ");
  if (body.length > 420) body = body.slice(0, 417) + "…";
  const bits = [`Customer's on-site estimate (${serviceId}): ${body}`];
  if (est.combo) bits.push(`${DRY_CLEAN_COMBO.tagline} combo covered ${est.combo.covered} of ${est.combo.slots} PIECES (basket is ${est.itemCount} pieces)`);
  if (est.minimumApplied) bits.push(`selection was $${est.rawSubtotal.toFixed(2)}, raised to the $${est.minimumCad} minimum`);
  bits.push(`est. subtotal $${est.subtotal.toFixed(2)} + HST $${est.hst.toFixed(2)} = $${est.total.toFixed(2)} — ESTIMATE ONLY, confirm on weigh-in`);
  return bits.join(". ");
}
