import type { Metadata } from "next";
import LegalDoc, { type LegalSection } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Terms & Conditions — Starex",
  description: "The consumer agreement governing your use of Starex laundry & dry cleaning pickup and delivery services in Brampton and Mississauga, Ontario.",
};

const EFFECTIVE = "August 2, 2026";

// Business address is disclosed on request rather than printed here — we
// don't have a verified registered address to publish.
const ADDRESS_LINE = "Business address available on request — email hello@starexlaundry.ca or call 437-607-7251";
const LEGAL_NAME = "Royal Art Treasure Inc.";

const sections: LegalSection[] = [
  {
    title: "Definitions",
    blocks: [{
      type: "ul", items: [
        { label: '"Starex", "we", "us", "our"', text: `means ${LEGAL_NAME}, operating as Starex.` },
        { label: '"Order"', text: "means a single scheduled pickup and the items submitted under it." },
        { label: '"Services"', text: "— pickup, wash & fold, dry cleaning, ironing & press, household/bedding cleaning, same-day express, and car & sofa detailing offered by Starex." },
        { label: '"Consumer Agreement"', text: "has the meaning given in the CPA — an agreement between a supplier and an individual acting for personal, family, or household purposes." },
        { label: '"Turnaround Time"', text: "— the estimated period between pickup and delivery of a completed Order, typically 24–48 hours, or as otherwise quoted." },
        { label: '"Service Area"', text: "— Brampton, Mississauga, and any surrounding areas we may designate from time to time on our website." },
      ],
    }],
  },
  {
    title: "Supplier Identification",
    blocks: [
      { type: "p", text: "As required for internet and remote agreements under the CPA, here is who you are contracting with:" },
      { type: "ul", items: [
        { label: "Legal name:", text: LEGAL_NAME },
        { label: "Business (operating) name:", text: "Starex" },
        { label: "Business address:", text: ADDRESS_LINE },
        { label: "Phone:", text: "437-607-7251" },
        { label: "Email:", text: "hello@starexlaundry.ca" },
      ]},
    ],
  },
  {
    title: "Required Pre-Contract Disclosure",
    blocks: [
      { type: "p", text: "For internet/remote agreements where your total potential payment obligation exceeds $50 (the threshold prescribed by Ontario Regulation 17/05), the CPA requires Starex to disclose certain information before you enter into the agreement. We provide this information on our website, at checkout, and/or in this document:" },
      { type: "ol", items: [
        "Our identity and contact information (Section 2).",
        "An itemized list of the goods/services and prices, set out on our Pricing page and confirmed at checkout (Section 6).",
        "A description and amount of any additional charges that apply or may apply (e.g., HST, same-day express surcharge, cancellation fees) (Section 6).",
        "The total amount to be charged, or, where the final weight/scope cannot be known until after pickup, the pricing basis and how the final amount will be calculated and confirmed before payment is collected (Section 6).",
        "Terms, methods, and timing of payment (Section 6).",
        "Terms of delivery, including our estimated turnaround time and delivery method (Section 8).",
        "Our cancellation, return, exchange, and refund policy, set out in this document and in our separate Refund, Cancellation & Damage Policy (Section 7 and Section 9).",
        "Any other applicable restrictions, limitations, or conditions of the Services, including the customer responsibilities and prohibited items described in Sections 10–11.",
      ]},
      { type: "p", text: "This information is intended to be clear, comprehensible, and prominent, and available in a form you can access, retain, and print, consistent with CPA sections 5 and 38." },
    ],
  },
  {
    title: "Formation of the Agreement",
    blocks: [{ type: "p", text: "Before you finalize a booking, we will give you an express opportunity to review your Order, accept or decline it, and correct any errors before it is submitted, consistent with CPA section 38(2). Once you confirm a booking, a copy of your Order confirmation (setting out the service, price, and pickup details) will be sent to the email address on your account, in a format you can retain and print. If you do not receive a confirmation, please contact us before your scheduled pickup." }],
  },
  {
    title: "Account Registration",
    blocks: [
      { type: "p", text: "To book a pickup, you must create an account and provide accurate, current information, including your name, phone number, email address, pickup/delivery address, and a valid payment method. You are responsible for:" },
      { type: "ul", items: [
        "Keeping your account credentials confidential and notifying us promptly of any unauthorized use",
        "Ensuring the accuracy of your contact and address details, as delivery delays caused by incorrect information are not the responsibility of Starex",
        "Being at least 18 years of age, or having the legal capacity to enter into a binding contract in Ontario",
      ]},
    ],
  },
  {
    title: "Pricing, Total Price & Payment",
    blocks: [],
    subsections: [
      { title: "All-In Pricing", blocks: [{ type: "p", text: "The price we display or quote to you includes all mandatory charges that can be determined in advance (including applicable HST), so that the price shown is the total amount you will pay for that portion of the Order. Where a charge cannot be calculated until after pickup (for example, final laundry weight, or Car & Sofa Detailing pricing that depends on inspection), we disclose the pricing basis in advance (e.g., $/lb) and confirm the final total with you before collecting payment." }] },
      { title: "Current Pricing", blocks: [{ type: "ul", items: [
        "Wash & Fold: billed per pound, minimum order value as published on our Pricing page (currently $40)",
        "Dry Cleaning, Ironing & Press, Household & Bedding: billed per item, as published on our Pricing page",
        "Same-Day Express: billed per pound at the published express rate, subject to availability and cut-off times",
        "Car & Sofa Detailing: quoted upon inspection, with the final price confirmed with you before work begins",
      ]}]},
      { title: "Payment", blocks: [{ type: "p", text: "Payment is due upon completion of the Order via the payment method saved to your account, unless you have subscribed to a Monthly Plan (Section 6.4). We accept major credit/debit cards and other methods indicated at checkout. Declined or failed payments may result in your Order being held pending resolution." }] },
      { title: "Monthly Plans (Prepaid / Future Performance Arrangements)", blocks: [
        { type: "p", text: 'Where offered, monthly subscription plans are paid in advance of the services being performed and may constitute a "future performance agreement" under the CPA. For these plans:' },
        { type: "ul", items: [
          "We will disclose the full plan terms — price, included pickups/weight allowance, renewal date, and cancellation method — before you subscribe.",
          "Plans renew automatically each billing cycle until cancelled by you through your account settings or by contacting us at least 3 business days before the renewal date.",
          "Unused pickups or weight allowances do not roll over or carry a cash value unless expressly stated at the time of purchase.",
          "If Starex fails to provide the plan's core services within 30 days of when they were due, you may cancel the plan and are entitled to a refund of amounts paid for services not received, consistent with your rights under the CPA for undelivered future performance.",
        ]},
      ]},
    ],
  },
  {
    title: "Your Right to Cancel Under the Consumer Protection Act",
    blocks: [
      { type: "p", text: "In addition to our voluntary cancellation policy in Section 9, the CPA gives you certain statutory cancellation rights for internet/remote agreements above the $50 threshold, which cannot be waived by these Terms:" },
      { type: "ul", items: [
        { label: "Missing disclosure:", text: "You may cancel the agreement at any time from booking until 7 days after you receive a copy of the agreement that meets the CPA's disclosure requirements, if we did not provide the required pre-contract disclosure (Section 3) or did not give you an express opportunity to review, accept/decline, and correct errors before you confirmed the booking (Section 4)." },
        { label: "Missing confirmation copy:", text: "You may cancel within 30 days after the agreement is entered into if we do not deliver a retainable, printable copy of your Order confirmation as described in Section 4." },
      ]},
      { type: "p", text: "To exercise a statutory cancellation right, contact us using the details in Section 24; a cancellation under this Section is at no cost to you and any amount already paid for the affected Order will be refunded. These statutory rights are separate from, and in addition to, the voluntary scheduling-cancellation policy in Section 9, which addresses ordinary changes of plan rather than disclosure defects." },
    ],
  },
  {
    title: "Delivery and Pickup",
    blocks: [{ type: "p", text: "We will make reasonable efforts to arrive within your selected time window. Starex is not liable for delays caused by severe weather, road closures, vehicle issues, or other events outside our reasonable control. If you are not available at pickup or delivery, you may authorize a safe drop-off location (e.g., concierge, porch); items left in such locations are left at your own risk once delivered." }],
  },
  {
    title: "Our Voluntary Cancellation & Rescheduling Policy",
    blocks: [
      { type: "p", text: "Separate from your statutory rights in Section 7, our ordinary scheduling policy for changes of plan is:" },
      { type: "ul", items: [
        { label: "More than 12 hours before pickup:", text: "free cancellation or rescheduling, no charge." },
        { label: "Between 12 and 3 hours before pickup:", text: "a cancellation fee of 25% of the estimated Order value may apply." },
        { label: "Less than 3 hours before pickup, or a missed pickup:", text: "a cancellation/no-show fee of up to the applicable minimum order value ($40) may apply." },
      ]},
      { type: "p", text: "These fees are a genuine pre-estimate of the costs we incur reserving pickup capacity for you (a driver's time, route allocation, and lost capacity for other customers), not a penalty. Full details of refund eligibility connected to cancellations are set out in our separate Refund, Cancellation & Damage Policy, which forms part of these Terms by reference." },
    ],
  },
  {
    title: "Customer Responsibilities",
    blocks: [
      { type: "p", text: "To help us protect your belongings and deliver a great result, you agree to:" },
      { type: "ul", items: [
        "Check all pockets and remove valuables, cash, keys, electronics, and personal items before pickup",
        "Disclose any garments requiring special handling (delicate fabric, non-colorfast dye, embellishments, leather, fur, wedding attire) at the time of booking",
        "Advise us in writing of any allergies or sensitivities to detergents or fabric softeners before pickup — Starex is not responsible for reactions arising from undisclosed sensitivities",
        "Inspect delivered items promptly and report any concerns within the timeframe set out in our Refund, Cancellation & Damage Policy",
        "Ensure items submitted are suitable for the service selected (e.g., not submitting dry-clean-only garments under Wash & Fold without flagging them)",
      ]},
    ],
  },
  {
    title: "Prohibited & Restricted Items",
    blocks: [
      { type: "p", text: "We cannot accept items that are biohazardous, infested (e.g., bed bugs, fleas), heavily soiled with bodily fluids beyond normal household use, or otherwise unsafe to process. We reserve the right to refuse, return, or dispose of such items at our discretion, and may charge a reasonable handling fee. Certain high-value items (fine jewelry sewn into garments, loose gemstones, furs, museum-grade textiles) should not be submitted; Starex accepts no liability for such items if submitted regardless, without prejudice to any right you may have at law." },
    ],
  },
  {
    title: "Our Relationship to Your Items — Bailment",
    blocks: [{ type: "p", text: 'When you hand your items to Starex for cleaning, we become a "bailee for reward" and you remain the owner ("bailor") of those items. As bailee, Starex owes you a duty to take reasonable care of your items while they are in our possession — the standard of care a careful owner would exercise in the circumstances. This duty exists independently of these Terms and is not eliminated by any liability cap described in Section 14; it informs how that cap operates, and does not permit Starex to disclaim liability for its own negligence altogether.' }],
  },
  {
    title: "Implied Warranty of Acceptable Quality",
    blocks: [{ type: "p", text: "Under section 9 of the CPA, Starex is deemed to warrant that the Services supplied under this Agreement are of a reasonably acceptable quality. This is a statutory warranty that cannot be waived, released, or limited by these Terms, regardless of any other provision. Nothing in Sections 14 (Liability) or elsewhere in these Terms is intended to, or does, exclude this warranty." }],
  },
  {
    title: "Liability, Insurance & Disclaimers",
    blocks: [
      { type: "p", text: "Starex handles every Order with professional care consistent with the bailee's duty described in Section 12. Subject to Sections 12 and 13, and to the extent permitted by law:" },
      { type: "ul", items: [
        "Garments are covered up to $500 per item against proven loss or damage directly caused by Starex's negligence, unless a higher value was disclosed and agreed in writing in advance for a specific high-value item.",
        "We are not responsible for normal wear and tear, pre-existing damage, colour bleeding from non-colorfast fabrics, shrinkage of improperly labelled garments, or damage to items not suited to the service selected.",
        "We are not liable for items left in pockets or for indirect, incidental, or consequential losses (e.g., loss of use, inconvenience), except to the extent such a limitation would be invalid under the CPA or other applicable law.",
        "Our total liability for any Order will not exceed the greater of the amount paid for that Order or the applicable per-item limit described above, except where a higher liability is required by law.",
      ]},
      { type: "p", text: "Nothing in this Section limits any right or remedy available to you under the CPA or any other law that cannot be waived by agreement. Claims for loss or damage must be submitted in accordance with our Refund, Cancellation & Damage Policy, including applicable reporting windows and evidence requirements." },
    ],
  },
  {
    title: "Unclaimed Items",
    blocks: [{ type: "p", text: "If delivery cannot be completed and you do not respond to our attempts to contact you within 30 days, Starex may treat the items as abandoned and dispose of or donate them, subject to Ontario law, without further liability to you." }],
  },
  {
    title: "Accessibility",
    blocks: [{ type: "p", text: "Starex is committed to providing services in a manner that respects the dignity and independence of persons with disabilities, consistent with Ontario's Accessibility for Ontarians with Disabilities Act, 2005 (AODA) and its Customer Service Standard. If you require an accommodation to use our Services, please contact us using the details in Section 24 and we will work with you to address it." }],
  },
  {
    title: "Intellectual Property",
    blocks: [{ type: "p", text: "The Starex name, logo, website, and app content are the property of Starex or its licensors and may not be copied, reproduced, or used without our prior written consent." }],
  },
  {
    title: "Termination",
    blocks: [{ type: "p", text: "We may suspend or terminate your account or refuse service where we reasonably believe there has been a breach of these Terms, fraudulent activity, repeated no-shows, non-payment, or abusive conduct toward our staff or drivers. You may close your account at any time by contacting us; any outstanding balance for Services already provided remains payable, and any prepaid amount for Services not yet provided will be refunded." }],
  },
  {
    title: "Changes to These Terms",
    blocks: [{ type: "p", text: 'We may update these Terms from time to time to reflect changes in our services, pricing, or legal requirements. The "Last Updated" date above will be revised accordingly, and material changes will be communicated by email or a notice on our website before they take effect. Continued use of the Services after changes take effect constitutes acceptance of the revised Terms, but no change will retroactively reduce a statutory right you already had in connection with an Order placed before that change.' }],
  },
  {
    title: "Dispute Resolution & Governing Law",
    blocks: [],
    subsections: [
      { title: "Governing Law", blocks: [{ type: "p", text: "These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein." }] },
      { title: "Your Right to Go to Court — No Forced Arbitration", blocks: [{ type: "p", text: "Nothing in these Terms requires you to submit a dispute to arbitration in a way that would prevent you from commencing an action in the Superior Court of Justice of Ontario. Consistent with sections 7 and 8 of the CPA, any term that would otherwise have that effect is invalid and does not apply to you. You are free to bring a claim in Small Claims Court or Superior Court, as appropriate, or to participate in or commence a class proceeding; nothing in these Terms waives or limits that right." }] },
      { title: "Informal Resolution (Optional)", blocks: [{ type: "p", text: "Before starting a legal proceeding, we encourage you to contact us so we can try to resolve the issue directly — most concerns can be sorted out quickly this way. This is an invitation, not a mandatory precondition, and does not affect your right to pursue any legal remedy at any time." }] },
    ],
  },
  {
    title: "Severability",
    blocks: [{ type: "p", text: "If any provision of these Terms is found to be invalid, illegal, or unenforceable (including because it conflicts with the CPA or other consumer protection law), that provision will be severed, and the remaining provisions will continue in full force and effect." }],
  },
  {
    title: "Entire Agreement",
    blocks: [{ type: "p", text: "These Terms, together with our Privacy Policy and Refund, Cancellation & Damage Policy, and any Order confirmation issued to you, constitute the entire agreement between you and Starex regarding the Services, and supersede any prior discussions or representations, except that nothing here limits any right or remedy you have under the CPA or other applicable law." }],
  },
  {
    title: "Language",
    blocks: [{ type: "p", text: "These Terms are provided in English. If you would like a French-language version, please contact us and we will provide one." }],
  },
  {
    title: "Contact Us",
    blocks: [
      { type: "p", text: "Questions about these Terms, or requests to exercise a cancellation right described in Section 7, can be directed to:" },
      { type: "ul", items: [
        { label: "Email:", text: "hello@starexlaundry.ca" },
        { label: "Phone:", text: "437-607-7251" },
        { label: "Mailing Address:", text: ADDRESS_LINE },
        { label: "Service Area:", text: "Brampton, ON & Mississauga, ON" },
      ]},
      { type: "p", text: "If you are unable to resolve a concern with us directly, you may also contact Consumer Protection Ontario (Ministry of Public and Business Service Delivery) at 1-800-889-9768 or ontario.ca/consumerprotection." },
      { type: "note", text: "This document was prepared with reference to Ontario's Consumer Protection Act, 2002, its regulations (including Ontario Regulation 17/05), common-law bailment principles, and common practice among Canadian laundry and dry cleaning pickup-and-delivery providers. It is not legal advice." },
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Terms & Conditions"
      effectiveDate={EFFECTIVE}
      intro={'These Terms & Conditions are a consumer agreement between Royal Art Treasure Inc., operating as Starex ("Starex", "we", "us", "our"), and the individual booking or using our services for personal, family, or household purposes. Because most bookings are made through our website or app while you and Starex are not together, this Agreement is generally an internet agreement or remote agreement as those terms are defined in Ontario\'s Consumer Protection Act, 2002 ("CPA"). Where the CPA applies to your Order, its protections apply to you despite anything else in these Terms, and nothing in these Terms limits any right or remedy you have at law. By creating an account, booking a pickup, or otherwise using our website, mobile application, or services, you agree to be bound by these Terms.'}
      sections={sections}
      seeAlso={[{ label: "Privacy Policy", href: "/privacy" }, { label: "Refund, Cancellation & Damage Policy", href: "/refund-policy" }]}
    />
  );
}
