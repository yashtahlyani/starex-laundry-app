// Starex — pricing config
//
// Baseline copied from WeDoLaundry's public pricing (Canada), with every price
// reduced by $1 per Yash's instruction, as a temporary placeholder until the
// client confirms their own numbers. Search "TODO(pricing)" to find everything
// that should be revisited before launch.

export const BUSINESS_NAME = "Starex";

// The four bookable service types (Step 1 of the booking flow)
export const PLANS = [
  { id: "wash-fold", label: "Wash & Fold", unit: "per lb", price: 1.25, turnaround: "12–48 hrs" },
  { id: "dry-clean", label: "Dry Cleaning", unit: "per item", price: null, turnaround: "2–3 days" },
  { id: "ironing", label: "Ironing", unit: "per item", price: null, turnaround: "24 hrs" },
  { id: "alteration", label: "Alteration", unit: "per item", price: null, turnaround: "3–5 days" },
] as const;

// TODO(pricing): $0.99 "first pickup" promo can't sensibly drop by $1 (goes to ~$0) —
// treated as a free first pickup for now. Confirm with client.
export const PICKUP_DELIVERY = {
  freeOverLb: 28,
  feeUnderLb: 11.99,
  serviceFeeAboveThresholdPct: 10,
  minimumLb: 10,
  minimumChargeCad: 34.49,
};

export const MEMBERSHIP = {
  name: "Starex Club",
  monthlyPriceCad: 8.99,
  perks: [
    "Weekly/biweekly recurring pickup",
    "Free first pickup every month",
    "5% discount on all services",
    "Free reusable laundry bags",
    "1.5x loyalty points",
  ],
};

// Every service here is priced by weight or per item, so the real total isn't known
// until staff weigh/count the order after pickup. We pre-authorize this minimum-charge
// floor at booking time and capture the real (possibly higher) amount from the admin
// dashboard once the order is weighed in — see PICKUP_DELIVERY.minimumChargeCad.
export function estimateOrderAmountCents(_serviceId: string): number {
  return Math.round(PICKUP_DELIVERY.minimumChargeCad * 100);
}

export type CatalogItem = { name: string; price: number };
export type CatalogSection = { title: string; items: CatalogItem[] };
export type CatalogTab = { id: string; label: string; blurb: string; sections: CatalogSection[] };

export const CATALOG: CatalogTab[] = [
  {
    id: "wash-fold",
    label: "Wash & Fold Preferences",
    blurb: "Towels, sheets, pillow cases can be included in regular laundry items. 24h turnaround · priced per bag.",
    sections: [
      {
        title: "Most Popular",
        items: [
          { name: "Baby Clothes", price: 6.99 },
          { name: "Fabric Softener", price: 1.49 },
          { name: "Hot Wash", price: 1.49 },
          { name: "Pet Hair Removal", price: 6.99 },
        ],
      },
      {
        title: "Washing Options",
        items: [
          { name: "Bleach White", price: 1.49 },
          { name: "Cold Wash", price: 1.49 },
          { name: "Hang Dry", price: 6.99 },
          { name: "Low Temp Dry", price: 1.49 },
          { name: "Unscented Soap", price: 1.49 },
        ],
      },
      {
        title: "Special Care",
        items: [
          { name: "Separate Wash", price: 6.99 },
          { name: "Sort & Separate Wash", price: 8.99 },
          { name: "Wet Clothes", price: 6.99 },
          { name: "Wet Laundry", price: 5.99 },
        ],
      },
    ],
  },
  {
    id: "household",
    label: "Household",
    blurb: "Comforters, blankets, pillows, and more. 24h turnaround · priced per item.",
    sections: [
      {
        title: "Most Popular",
        items: [
          { name: "1 Body Pillow", price: 18.99 },
          { name: "1 Standard Pillow", price: 8.99 },
          { name: "King Blanket", price: 28.99 },
          { name: "King Comforter/Duvet", price: 38.99 },
          { name: "Queen Blanket", price: 21.99 },
          { name: "Queen Comforter/Duvet", price: 28.99 },
          { name: "Single Blanket", price: 16.99 },
          { name: "Single Comforter/Duvet", price: 21.99 },
        ],
      },
      {
        title: "Bedding",
        items: [
          { name: "Curtain No Lining / Pleat", price: 2.99 },
          { name: "Curtain With Lining", price: 3.99 },
          { name: "Cushion Set (2)", price: 23.99 },
          { name: "Feather Blanket", price: 48.99 },
          { name: "Feather Pillow", price: 26.99 },
          { name: "Sleeping Bag", price: 18.99 },
        ],
      },
      {
        title: "Misc",
        items: [
          { name: "Coverall", price: 8.99 },
          { name: "Large Rugs", price: 98.99 },
          { name: "Small Rugs", price: 48.99 },
          { name: "Stuffed Toy (Large Size)", price: 8.99 },
          { name: "Stuffed Toy (Small Size)", price: 3.99 },
        ],
      },
      {
        title: "Others",
        items: [{ name: "Shoes", price: 8.99 }],
      },
    ],
  },
  {
    id: "dry-clean",
    label: "Dry Cleaning",
    blurb: "Suits, dresses, jackets, shirts, pants, and more. 2–3 day turnaround · priced per item.",
    sections: [
      {
        title: "Most Popular",
        items: [
          { name: "2 Pc Suit", price: 26.99 },
          { name: "3 Pc Suit", price: 33.99 },
          { name: "Casual Dress", price: 21.99 },
          { name: "King Blanket", price: 33.99 },
          { name: "Pant/Skirt", price: 8.99 },
          { name: "Queen Blanket", price: 23.99 },
          { name: "Shirt/Blouse", price: 5.99 },
          { name: "Sweater", price: 11.99 },
        ],
      },
      {
        title: "Premium / Specialty",
        items: [
          { name: "Coat/Jacket", price: 21.99 },
          { name: "Long Coat/Winter Jacket", price: 38.99 },
          { name: "Parka Jacket", price: 63.99 },
          { name: "Wedding Dress", price: 178.99 },
        ],
      },
      {
        title: "Bedding",
        items: [
          { name: "Feather Blanket", price: 48.99 },
          { name: "Feather Pillow", price: 26.99 },
          { name: "King Comforter", price: 36.99 },
          { name: "Queen Comforter", price: 28.99 },
          { name: "Single Blanket", price: 18.99 },
          { name: "Single Comforter/Duvet", price: 21.99 },
        ],
      },
      {
        title: "Apparel",
        items: [
          { name: "Gowns/Long Dress", price: 28.99 },
          { name: "Graduation Gowns", price: 12.99 },
          { name: "Hoodie", price: 18.99 },
          { name: "Jumpsuit", price: 28.99 },
          { name: "Punjabi Suit", price: 23.99 },
          { name: "Saree", price: 28.99 },
          { name: "Silk Shirt/Blouse", price: 11.99 },
          { name: "Tie", price: 4.99 },
          { name: "Vest", price: 11.99 },
        ],
      },
      {
        title: "Household / Large Items",
        items: [
          { name: "Small Carpet", price: 74.0 },
          { name: "Table Runner", price: 8.99 },
        ],
      },
      {
        title: "Misc / Other",
        items: [
          { name: "Bag", price: 23.99 },
          { name: "Coverall", price: 18.99 },
          { name: "Hat", price: 8.99 },
          { name: "Scarf", price: 14.99 },
          { name: "Sleeping Bag", price: 28.99 },
        ],
      },
    ],
  },
  {
    id: "ironing",
    label: "Ironing",
    blurb: "Suits, dresses, jackets, shirts, pants, and more. 24h turnaround · priced per item.",
    sections: [
      {
        title: "Most Popular",
        items: [
          { name: "2 Pc Suit", price: 16.99 },
          { name: "3 Pc Suit", price: 21.99 },
          { name: "Bed & Fitted Sheet", price: 14.99 },
          { name: "Duvet Cover", price: 16.99 },
          { name: "Pant", price: 4.99 },
          { name: "Shirt", price: 2.99 },
        ],
      },
      {
        title: "Linens",
        items: [
          { name: "10 Napkins", price: 6.99 },
          { name: "4 Pillow Cases", price: 6.99 },
          { name: "Table Cloth (12 ft)", price: 13.99 },
          { name: "Table Cloth (4 ft)", price: 5.99 },
          { name: "Table Cloth (8 ft)", price: 8.99 },
        ],
      },
      {
        title: "Apparel",
        items: [{ name: "Casual Dress", price: 13.99 }],
        // TODO(pricing): "Gowns" price wasn't fully visible in the source screenshot — confirm.
      },
    ],
  },
  {
    id: "alteration",
    label: "Alteration",
    blurb: "Pants, formal wear, wedding dress, household items, and more. 3–5 day turnaround · priced per item.",
    sections: [
      {
        title: "Most Popular",
        items: [
          { name: "Buttons", price: 2.99 },
          { name: "Hems", price: 13.99 },
          { name: "Let Out", price: 18.99 },
          { name: "Patches", price: 8.99 },
          { name: "Take In", price: 18.99 },
          { name: "Zipper", price: 8.99 },
        ],
      },
    ],
  },
];

export const SERVICE_AREA_POSTAL_PREFIXES: string[] = [
  // TODO: fill in the real serviceable postal code prefixes once confirmed.
];
