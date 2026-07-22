// StareX — pricing config
//
// Prices confirmed by the client (StareX Laundry / Dry Clean flyers, July 2026).
// Item prices marked `from: true` are starting prices ("$X.XX +") — final price
// can vary with size/fabric/condition and is confirmed before work begins.

export const BUSINESS_NAME = "StareX";
export const PHONE = "437-607-7251";
export const PHONE_HREF = "tel:+14376077251";
export const SERVICE_AREA = "Brampton & Mississauga";
export const SITE_URL = "www.starexlaundry.ca";

// The bookable service types (Step 1 of the booking flow)
export const PLANS = [
  { id: "wash-fold", label: "Wash & Fold",           unit: "per lb",   price: 2.00, turnaround: "24–48 hrs" },
  { id: "express",   label: "Same-Day Express",      unit: "per lb",   price: 3.00, turnaround: "Same day" },
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

export const MEMBERSHIP = {
  name: "StareX Monthly Plan",
  monthlyPriceCad: 100,
  includedLbs: 50,
  overagePerLbCad: 2, // additional laundry beyond the plan's included weight
  perks: [
    "No minimum laundry commitment",
    "2+1 pickups per month (up to 50 lbs)",
    "24–48h turnaround on all orders",
    "Free fabric softener, hot wash & bleach",
    "Exclusive discounts for commercial clients",
    "Additional laundry beyond 50 lbs billed at $2/lb",
  ],
};

export const DETAILING = {
  carFromCad: 199,     // car detailing / dry cleaning / shampoo — starting price
  sofaPerSeatCad: 49,  // sofa deep clean / shampoo — per seat, subject to the $199 minimum below
  minimumCad: MINIMUM_ORDER.detailingCad,
  note: "Final pricing upon inspection. $199 minimum order applies.",
};

// Dry-clean combo promo — advertised in the header offer banner and on the
// Pricing / Services pages.
export const DRY_CLEAN_COMBO = {
  tagline: "5 for $50",
  title: "Value for Money",
  priceCad: 50,
  itemCount: 5,
  description: "Dry clean any 5 regular garments/pieces, including 1 blanket or quilt.",
  exclusions: "Excludes wedding dresses and leather items.",
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

export type CatalogItem = { name: string; price: number; from?: boolean };
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
          { name: "T-Shirt / Shorts / Skirts / Jeans / Pants", price: 2.99 },
          { name: "Baby Clothes / Pillow Cases", price: 1.99 },
          { name: "Shirt / Blouses / Dresses", price: 3.99 },
          { name: "Bedding & Table Cloths", price: 7.99 },
          { name: "Complex Dresses / Saree / Maxi / Pleated", price: 9.99 },
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
          { name: "King / Double Blanket", price: 29.99, from: true },
          { name: "Queen Blanket", price: 22.99, from: true },
          { name: "Single Blanket", price: 17.99, from: true },
          { name: "King Duvet / Comforter / Quilt", price: 39.99, from: true },
          { name: "Queen Duvet / Comforter / Quilt", price: 29.99, from: true },
          { name: "Single Duvet / Comforter / Quilt", price: 22.99, from: true },
          { name: "Feather Duvet / Comforter / Blanket", price: 49.99, from: true },
        ],
      },
      {
        title: "Curtains & More",
        items: [
          { name: "Sheer Curtain — No Lining", price: 19.99, from: true },
          { name: "Standard Curtain", price: 24.99, from: true },
          { name: "Lined Curtain", price: 34.99, from: true },
          { name: "Stuffed Toy — Small", price: 9.99, from: true },
          { name: "Stuffed Toy — Big", price: 29.99, from: true },
          { name: "Sleeping Bag", price: 29.99, from: true },
          { name: "Small Rug", price: 49.99, from: true },
          { name: "Big Rug", price: 99.99, from: true },
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
          { name: "2 Pcs Suit", price: 29.99, from: true },
          { name: "Shirt / T-Shirt", price: 6.99, from: true },
          { name: "Dress Casual", price: 22.99, from: true },
          { name: "Pant / Skirt / Bottom", price: 9.99, from: true },
          { name: "Sweater", price: 12.99, from: true },
          { name: "Hoodie / Sweatshirt", price: 19.99, from: true },
          { name: "Silk Shirt / Blouse", price: 12.99, from: true },
          { name: "Tie / Hat", price: 5.99, from: true },
          { name: "Vest / Scarf / Stole", price: 12.99, from: true },
        ],
      },
      {
        title: "Outerwear & Occasion",
        items: [
          { name: "Coat / Jacket", price: 22.99, from: true },
          { name: "Long Coat / Winter Jacket", price: 29.99, from: true },
          { name: "Leather Jacket", price: 99.99, from: true },
          { name: "Gown / Long Dress", price: 29.99, from: true },
          { name: "Jump Suit", price: 29.99, from: true },
          { name: "Punjabi Suit 2 Pcs", price: 24.99, from: true },
          { name: "Saree", price: 29.99, from: true },
        ],
      },
      {
        title: "Household & Misc",
        items: [
          { name: "Curtain — No Lining", price: 4.99, from: true },
          { name: "Curtain — With Lining", price: 7.99, from: true },
          { name: "Stuffed Toy — Small", price: 4.99, from: true },
          { name: "Stuffed Toy — Big", price: 9.99, from: true },
          { name: "Sleeping Bag", price: 19.99, from: true },
          { name: "Small Rug", price: 49.99, from: true },
          { name: "Big Rug", price: 99.99, from: true },
          { name: "Shoes", price: 19.99, from: true },
        ],
      },
      {
        title: "Special Care",
        items: [
          { name: "Wedding Dress", price: 249.99, from: true },
          { name: "Carpet", price: 74.99, from: true },
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
          { name: "Car Detailing / Shampoo (per vehicle)", price: 199, from: true },
          { name: "Sofa Deep Clean / Shampoo (per seat)", price: 49, from: true },
        ],
      },
    ],
  },
];

export const SERVICE_AREA_POSTAL_PREFIXES: string[] = [
  // TODO: fill in the real serviceable postal code prefixes once confirmed.
];
