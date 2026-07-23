import LocalSEOLanding from "@/components/LocalSEOLanding";
import { SITE_ORIGIN } from "@/lib/site";

const SERVICE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Dry Cleaning",
  provider: {
    "@type": "LaundryService",
    name: "StareX",
    telephone: "+1-437-607-7251",
    url: SITE_ORIGIN,
  },
  areaServed: { "@type": "City", name: "Brampton", containedInPlace: { "@type": "State", name: "Ontario" } },
  description: "Professional dry cleaning pickup and delivery for suits, sarees, gowns, coats and household items in Brampton, Ontario.",
};

export default function DryCleaningBramptonPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSON_LD) }} />
      <LocalSEOLanding
        city="Brampton"
        serviceLabel="Dry Cleaning"
        heroImage="/images/starex/rack-clothes.webp"
        h1="Dry Cleaning in Brampton, Ontario"
        intro="Suits, sarees, gowns, coats and more — picked up from your door, professionally dry cleaned, and delivered back pressed and ready to wear. No drop-off, no queue, no guessing what it'll cost."
        neighborhoods={["Bramalea", "Downtown Brampton", "Mount Pleasant", "Springdale", "Snelgrove", "Castlemore"]}
        bookHref="/book?service=dry-clean"
        priceHighlights={[
          { label: "Everyday & Formal Wear", price: "From $4.99", desc: "Shirts, dresses, suits, sweaters and more, priced per item." },
          { label: "5 for $50 Combo", price: "$50 flat", desc: "Any 5 regular pieces including 1 blanket or quilt — see the offer." },
          { label: "Wedding & Special Care", price: "From $249.99", desc: "Wedding dresses and other special-care items, priced individually." },
        ]}
        features={[
          "Free pickup and delivery to your door in Brampton",
          "24–48 hour turnaround on most orders",
          "Every price confirmed with you before we start — no surprise bills",
          "Also covers household & bedding: curtains, rugs, sleeping bags",
          "No account needed — book as a guest in under 2 minutes",
          "Real-time order tracking from pickup to delivery",
        ]}
        faqs={[
          { q: "Do you dry clean suits, sarees and gowns in Brampton?", a: "Yes — everyday and formal wear, outerwear, sarees, gowns, and household items like curtains and rugs are all covered. See the full price list on our Pricing page." },
          { q: "What's the 5 for $50 combo?", a: "Dry clean any 5 regular garments or pieces, including 1 blanket or quilt, for a flat $50. Multi-piece items like a 2-piece suit count as 2 of your 5. Wedding dresses and leather items are excluded." },
          { q: "How fast is dry cleaning delivery in Brampton?", a: "Most orders are ready for delivery within 24–48 hours of pickup." },
          { q: "Is there a minimum order for dry cleaning?", a: "Yes, a $40 minimum order value applies, same as our other services." },
        ]}
      />
    </>
  );
}
