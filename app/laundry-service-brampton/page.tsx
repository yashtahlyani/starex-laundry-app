import LocalSEOLanding from "@/components/LocalSEOLanding";
import { SITE_ORIGIN } from "@/lib/site";

const SERVICE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Laundry Pickup and Delivery",
  provider: {
    "@type": "LaundryService",
    name: "StareX",
    telephone: "+1-437-607-7251",
    url: SITE_ORIGIN,
  },
  areaServed: { "@type": "City", name: "Brampton", containedInPlace: { "@type": "State", name: "Ontario" } },
  description: "Wash and fold laundry pickup and delivery service in Brampton, Ontario, priced per pound with same-day express available.",
};

export default function LaundryServiceBramptonPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSON_LD) }} />
      <LocalSEOLanding
        city="Brampton"
        serviceLabel="Laundry Service"
        heroImage="/images/starex/basket-towels.webp"
        h1="Laundry Pickup & Delivery in Brampton, Ontario"
        intro="Everyday wash, dry and fold laundry — collected from your door, cleaned and sorted by colour and fabric, and returned within 24–48 hours. Just $2 per pound, no drop-off required."
        neighborhoods={["Bramalea", "Downtown Brampton", "Mount Pleasant", "Springdale", "Snelgrove", "Castlemore"]}
        bookHref="/book?service=wash-fold"
        priceHighlights={[
          { label: "Wash & Fold", price: "$2/lb", desc: "Sorted by colour and fabric, washed, dried and neatly folded." },
          { label: "Same-Day Express", price: "$3/lb", desc: "Need it back today? Rush service on Wash & Fold, subject to availability." },
          { label: "Minimum Order", price: "$40", desc: "Flat minimum order value, no matter the weight — no surprises." },
        ]}
        features={[
          "Free pickup and delivery to your door in Brampton",
          "24–48 hour turnaround, same-day express available",
          "Sorted by colour and fabric, washed with care",
          "Weighed at pickup — final price confirmed with you first",
          "No account needed — book as a guest in under 2 minutes",
          "Real-time order tracking from pickup to delivery",
        ]}
        faqs={[
          { q: "How much does laundry pickup cost in Brampton?", a: "Wash & Fold is $2/lb with a $40 minimum order value. Same-Day Express is $3/lb, also on Wash & Fold." },
          { q: "How do you weigh my laundry?", a: "Your bag is weighed by our driver at pickup, and the final price is confirmed with you before we start washing." },
          { q: "Is same-day laundry available in Brampton?", a: "Yes — Same-Day Express is available on Wash & Fold orders, subject to pickup time and driver availability." },
          { q: "Do I need an account to book?", a: "No — you can book a pickup as a guest with just your name, contact details and address, in under 2 minutes." },
        ]}
      />
    </>
  );
}
