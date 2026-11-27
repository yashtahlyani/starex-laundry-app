/**
 * The business details Google reads, in one place.
 *
 * Before 26 Nov 2026 the homepage carried its own hand-written LocalBusiness
 * block and /book and /pricing carried none at all -- so two of the three
 * pages a customer actually lands on told Google nothing about the business,
 * and the one that did was the only copy anyone remembered to update.
 *
 * Three corrections came with it, all from the owner on 26 Nov 2026:
 *
 *   1. "@type" was "LaundryService", which is not a schema.org type at all.
 *      Google silently ignores an unrecognised type, so the whole block was
 *      doing nothing. The real type for this business is DryCleaningOrLaundry.
 *   2. Hours said 07:00-20:00. The business opens 08:00 and closes 21:00.
 *   3. There was no postal address, only two city names.
 *
 * Everything here reads from lib/site.ts. Nothing in this file is typed twice.
 */

import { SITE_ORIGIN, CONTACT, BUSINESS_ADDRESS, OPENING_HOURS } from "@/lib/site";
import { BUSINESS_NAME, PHONE } from "@/lib/pricing";

/** E.164, which is the form schema.org asks for. */
const TELEPHONE = `+1-${PHONE.replace(/\D/g, "").replace(/^1/, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}`;

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * The business itself. Used by the homepage, /book and /pricing.
 *
 * A note on the address, because the reasoning changed: this used to be a
 * GeoCircle service area with no PostalAddress, on the grounds that an
 * address with a city but no street implies a storefront that does not exist.
 * There is now a real street address, so it is stated -- and the service area
 * is kept alongside it, because pickup and delivery still cover a 25km radius
 * rather than only the one address.
 */
export const BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "DryCleaningOrLaundry",
  name: BUSINESS_NAME,
  description:
    "Laundry pickup & delivery, dry cleaning, ironing, household items, and car & sofa detailing serving Brampton and Mississauga, Ontario.",
  url: SITE_ORIGIN,
  telephone: TELEPHONE,
  email: CONTACT.email,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS_ADDRESS.street,
    addressLocality: BUSINESS_ADDRESS.city,
    addressRegion: BUSINESS_ADDRESS.region,
    postalCode: BUSINESS_ADDRESS.postalCode,
    addressCountry: BUSINESS_ADDRESS.country,
  },
  areaServed: [
    { "@type": "City", name: "Brampton" },
    { "@type": "City", name: "Mississauga" },
  ],
  serviceArea: {
    "@type": "GeoCircle",
    geoMidpoint: { "@type": "GeoCoordinates", latitude: 43.6834, longitude: -79.7663 },
    geoRadius: "25000",
  },
  // NOTE: no aggregateRating here on purpose. Marking up a star rating that
  // isn't backed by real, on-page reviews violates Google's structured-data
  // policy and can earn a manual penalty. Add it back only once real reviews
  // exist on the page itself.
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ALL_DAYS,
    opens: OPENING_HOURS.opens,
    closes: OPENING_HOURS.closes,
  },
};

/**
 * Same business, as the `provider` of a specific service. Used by the four
 * city landing pages, which describe a service rather than the business.
 */
export const BUSINESS_AS_PROVIDER = {
  "@type": "DryCleaningOrLaundry",
  name: BUSINESS_NAME,
  telephone: TELEPHONE,
  url: SITE_ORIGIN,
  address: BUSINESS_JSON_LD.address,
};

/** Build-time guard: a typo'd phone number would otherwise ship silently. */
if (!/^\+1-\d{3}-\d{3}-\d{4}$/.test(TELEPHONE)) {
  throw new Error(`Business telephone is not in +1-XXX-XXX-XXXX form: "${TELEPHONE}"`);
}
