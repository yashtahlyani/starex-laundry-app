import {
  SERVICE_AREA, MINIMUM_ORDER, DRY_CLEAN_COMBO, PLANS, MEMBERSHIP,
  PHONE, itemKey, lookupCatalogItem,
} from "./pricing";
import { SITE_ORIGIN } from "./site";

/**
 * The fourteen questions the owner wrote, in one place.
 *
 * Six of them appear on the homepage, just before the booking call to action
 * (his choice, 2026-11-21 — the questions that stop someone booking, answered
 * at the moment they decide). All fourteen appear on /faq. One list, so the
 * homepage and the FAQ page can never drift into saying different things.
 *
 * Two constraints came with the original set and still hold.
 *
 * The SEO lead asked for no special characters: em dashes, en dashes and
 * curly quotes survive the page fine but get mangled in rich results, in the
 * Business Profile and anywhere the text is pasted onward. PLAIN_TEXT below
 * enforces that at build time rather than trusting anyone to remember.
 *
 * Every price, city and phone number is read from the price list rather than
 * typed, for the reason this codebase keeps relearning: a second hand-written
 * copy of a number goes stale and starts lying to customers.
 */

const rate = (id: string) => PLANS.find(p => p.id === id)?.price ?? 0;
const price = (tab: string, name: string) =>
  lookupCatalogItem(itemKey(tab, name))?.item.price ?? 0;
const money = (n: number) => `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;

export type Faq = { id: string; q: string; a: string };

export const FAQS: Faq[] = [
  {
    id: "pickup-delivery",
    q: "Do you offer laundry pickup and delivery?",
    a: `Yes. Free pickup and delivery across ${SERVICE_AREA} on orders of $${MINIMUM_ORDER.standardCad} or more. Book at ${SITE_ORIGIN.replace("https://", "")} or call ${PHONE}.`,
  },
  {
    id: "wash-fold-price",
    q: "How much is wash and fold?",
    a: `Wash and Fold is ${money(rate("wash-fold"))} per pound. Your clothes are washed, neatly folded and back to you in 24 to 48 hours.`,
  },
  {
    id: "dry-clean-offers",
    q: "What dry cleaning offers do you have?",
    a: `Our Dry Clean Combo is any ${DRY_CLEAN_COMBO.pieceCount} pieces for $${DRY_CLEAN_COMBO.priceCad}, including 1 blanket. Wedding dresses, leather and suede are not included. Shirts start at ${money(price("dry-clean", "Shirt / T-Shirt"))} and pants at ${money(price("dry-clean", "Pant / Skirt / Bottom"))}.`,
  },
  {
    id: "sarees",
    q: "Do you clean sarees and Indian outfits?",
    a: `Yes. Saree dry cleaning starts at ${money(price("dry-clean", "Saree"))}, and we also clean Punjabi suits, kurtas and lehengas. Festive wear is something we do a lot of.`,
  },
  {
    id: "same-day",
    q: "I need something urgently. Can you do same day?",
    a: `Yes. Same Day Dry Cleaning is charged at 50% extra and depends on the day's capacity, so please confirm slot availability before booking, or call ${PHONE} and we will arrange a pickup.`,
  },
  {
    id: "bedding",
    q: "Do you clean blankets, duvets and comforters?",
    a: `Yes, in any size. A blanket also counts as one of the ${DRY_CLEAN_COMBO.pieceCount} pieces in the $${DRY_CLEAN_COMBO.priceCad} combo.`,
  },
  {
    id: "wash-press",
    q: "What is Wash and Press?",
    a: `Wash and Press is ${money(rate("wash-press"))} per pound. Your everyday clothes come back washed and pressed, charged by weight instead of per garment.`,
  },
  {
    id: "minimum",
    q: "Is there a minimum order?",
    a: `Yes. Orders start at $${MINIMUM_ORDER.standardCad} before HST. Pickup and delivery are free at that amount. Car and Sofa Detailing has its own $${MINIMUM_ORDER.detailingCad} minimum.`,
  },
  {
    id: "monthly",
    q: "Do you have a monthly plan?",
    a: `Yes. The ${MEMBERSHIP.name} is $${MEMBERSHIP.monthlyPriceCad} a month and covers up to ${MEMBERSHIP.includedLbs} lbs, with anything beyond that at $${MEMBERSHIP.overagePerLbCad.toFixed(2)} per pound.`,
  },
  {
    id: "home-for-pickup",
    q: "Do I need to be home for pickup?",
    a: "No. Pickup is contactless at your door. You choose your time window when you book, and your bag is sealed, labelled and tracked from the moment it leaves your hands.",
  },
  {
    id: "detailing",
    q: "Do you detail cars and sofas?",
    a: `Yes. Interior detailing, deep clean and shampoo for vehicles and sofas, from $${price("detailing", "Car Detailing (Interior Only)")}, with the final price confirmed on inspection.`,
  },
  {
    id: "insured",
    q: "Are my clothes insured?",
    a: "Yes. Your garments are covered. The full claim policy is in our Terms and Conditions.",
  },
  {
    id: "curtains",
    q: "Do you clean curtains and drapery?",
    a: `Yes. Curtain and drapery cleaning starts at ${money(price("dry-clean", "Curtain / Drapery (per panel)"))} per panel, with free pickup and delivery on orders of $${MINIMUM_ORDER.standardCad} or more.`,
  },
  {
    id: "how-to-book",
    q: "How do I book a pickup?",
    a: `Book online in about a minute, or call ${PHONE}. Choose your service, pick a pickup day and time window, and tell us where to collect from.`,
  },
];

/**
 * The six the owner picked for the homepage (2026-11-21), in his order.
 * Chosen by id rather than by slicing the array, so reordering or adding a
 * question here cannot silently change what the homepage shows.
 */
export const HOMEPAGE_FAQ_IDS = [
  "pickup-delivery",
  "wash-fold-price",
  "dry-clean-offers",
  "minimum",
  "same-day",
  "how-to-book",
] as const;

export const HOMEPAGE_FAQS: Faq[] = HOMEPAGE_FAQ_IDS.map(id => {
  const found = FAQS.find(f => f.id === id);
  // A typo in an id would otherwise quietly drop a question off the homepage.
  if (!found) throw new Error(`HOMEPAGE_FAQ_IDS references "${id}", which is not in FAQS.`);
  return found;
});

/**
 * The SEO lead's "no special characters" rule, enforced instead of trusted.
 * Fails the build rather than shipping a mangled dash into a rich result, so
 * the rule outlives whoever remembers it.
 */
const PLAIN_TEXT = /^[\x20-\x7E]*$/;
for (const f of FAQS) {
  for (const [field, text] of [["question", f.q], ["answer", f.a]] as const) {
    if (!PLAIN_TEXT.test(text)) {
      const bad = [...text].filter(c => !PLAIN_TEXT.test(c)).join(" ");
      throw new Error(
        `FAQ ${field} contains non-plain characters (${bad}): "${text.slice(0, 60)}". ` +
        `Use plain hyphens and straight apostrophes - see the note in lib/faq.ts.`
      );
    }
  }
}

/** Marked up for search engines and AI assistants. Built from the same list
 *  that renders, so the two can never say different things. */
export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(f => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});
