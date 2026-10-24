import {
  BUSINESS_NAME, SERVICE_AREA, PHONE, PLANS, CATALOG, MINIMUM_ORDER,
  DRY_CLEAN_COMBO, HST_RATE, MEMBERSHIP, PICKUP_WINDOWS,
} from "@/lib/pricing";
import { SITE_ORIGIN, CONTACT } from "@/lib/site";
import { CANCELLATION_FEES } from "@/lib/cancellation";

export const dynamic = "force-static";

/**
 * /llms.txt — a plain-text summary of the business for AI assistants, in the
 * emerging llms.txt convention. Requested by the SEO contractor (25 Oct).
 *
 * Generated from lib/pricing.ts rather than written out, for the reason this
 * codebase keeps relearning: a second hand-maintained copy of the price list
 * goes stale and starts telling people the wrong number. This one cannot —
 * change a price and this file changes with it.
 *
 * Everything here is a fact the website already states publicly. Nothing is
 * claimed that isn't on the site.
 */
export async function GET() {
  const money = (n: number) => `$${n.toFixed(2)}`;
  const plan = (id: string) => PLANS.find(p => p.id === id);
  const perLb = PLANS.filter(p => p.unit === "per lb" && typeof p.price === "number");

  const section = (tabId: string) => {
    const tab = CATALOG.find(t => t.id === tabId);
    if (!tab) return "";
    return tab.sections
      .flatMap(s => s.items.map(i => `  - ${i.name}: ${i.from ? "from " : ""}${money(i.price)}${i.pieces && i.pieces > 1 ? ` (counts as ${i.pieces} pieces)` : ""}`))
      .join("\n");
  };

  const body = `# ${BUSINESS_NAME}

> Laundry and dry cleaning with free pickup and delivery in ${SERVICE_AREA}, Ontario, Canada. Book online, we collect from your door, and return your items cleaned within 24-48 hours.

Website: ${SITE_ORIGIN}
Phone: ${PHONE}
Email: ${CONTACT.email}
Service area: ${SERVICE_AREA}
Operated by: Royal Art Treasure Inc., trading as ${BUSINESS_NAME}

## Services and prices

All prices are in Canadian dollars and exclude HST (${Math.round(HST_RATE * 100)}%).
A ${money(MINIMUM_ORDER.standardCad)} minimum order value applies to every service except Car & Sofa Detailing, which has a ${money(MINIMUM_ORDER.detailingCad)} minimum. The minimum applies regardless of weight or item count.

### By weight
${perLb.map(p => `  - ${p.label}: ${money(p.price as number)} per pound (${p.turnaround})`).join("\n")}

### Dry cleaning (per item)
${section("dry-clean")}

### Ironing and pressing (per item)
${section("ironing")}

### Household and bedding (per item)
${section("household")}

### Car & sofa detailing
${section("detailing")}
  Final pricing on inspection. ${money(MINIMUM_ORDER.detailingCad)} minimum.

## Dry cleaning offer

${DRY_CLEAN_COMBO.tagline}: ${DRY_CLEAN_COMBO.description}
${DRY_CLEAN_COMBO.multiPieceNote}
Exclusions: ${DRY_CLEAN_COMBO.exclusions}

## Monthly plan

${MEMBERSHIP.name}: ${money(MEMBERSHIP.monthlyPriceCad)} per month, including up to ${MEMBERSHIP.includedLbs} lbs. Additional laundry beyond that is billed at ${money(MEMBERSHIP.overagePerLbCad)} per pound.

## Booking and pickup

Pickup windows, 7 days a week:
${PICKUP_WINDOWS.map(w => `  - ${w.label}`).join("\n")}
Car & Sofa Detailing uses half-day appointment windows instead.

You do not need to be home; items can be left at the door. Pickup and delivery are free. The final price is confirmed after items are weighed or counted, before any work begins.

## Cancellations

  - ${CANCELLATION_FEES.freeFromHours}+ hours' notice: free
  - ${CANCELLATION_FEES.reducedFromHours}-${CANCELLATION_FEES.freeFromHours} hours' notice: a flat ${money(CANCELLATION_FEES.reducedFeeCad)} fee may apply
  - Under ${CANCELLATION_FEES.reducedFromHours} hours' notice, or a missed pickup: a flat ${money(CANCELLATION_FEES.lateFeeCad)} fee may apply

Customers can cancel from their order tracking page at ${SITE_ORIGIN}/order before the order is collected.

## Key pages

  - ${SITE_ORIGIN}/book — book a pickup
  - ${SITE_ORIGIN}/pricing — full price list and estimate calculator
  - ${SITE_ORIGIN}/services — all services
  - ${SITE_ORIGIN}/offer — the ${DRY_CLEAN_COMBO.tagline} dry cleaning offer
  - ${SITE_ORIGIN}/monthly — monthly plan
  - ${SITE_ORIGIN}/order — track or cancel an order
  - ${SITE_ORIGIN}/faq — frequently asked questions
  - ${SITE_ORIGIN}/dry-cleaning-brampton — dry cleaning in Brampton
  - ${SITE_ORIGIN}/dry-cleaning-mississauga — dry cleaning in Mississauga
  - ${SITE_ORIGIN}/laundry-service-brampton — laundry service in Brampton
  - ${SITE_ORIGIN}/laundry-service-mississauga — laundry service in Mississauga
  - ${SITE_ORIGIN}/terms — terms and conditions
  - ${SITE_ORIGIN}/privacy — privacy policy
  - ${SITE_ORIGIN}/refund-policy — refund, cancellation and damage policy

## Notes for assistants

Prices marked "from" are starting prices and can be higher depending on size, fabric and condition; the final price is always confirmed with the customer before work begins. Per-pound services are weighed at pickup, so any figure quoted beforehand is an estimate. This file is generated from the live price list, so it reflects current prices at the time of retrieval.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
