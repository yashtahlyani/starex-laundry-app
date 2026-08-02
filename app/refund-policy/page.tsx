import LegalDoc, { type LegalSection } from "@/components/LegalDoc";

const EFFECTIVE = "August 2, 2026";

const sections: LegalSection[] = [
  {
    title: "How This Policy Fits With Your Statutory Rights",
    blocks: [
      { type: "p", text: "Three things are true at once, and this Policy is written so they don't conflict:" },
      { type: "ol", items: [
        "Section 9 of the CPA deems Starex to warrant that our Services are of a reasonably acceptable quality. This warranty cannot be waived, and nothing below is meant to exclude it.",
        "Sections 7 and 8 of the CPA mean you always retain the right to bring a claim in court (including Small Claims Court) or a class proceeding, and to pursue a chargeback with your card issuer, regardless of anything in this Policy.",
        "Within those statutory guardrails, Starex applies the practical process below to resolve cancellations, refunds, and damage/loss claims quickly and fairly, without you needing to invoke formal legal process for the great majority of issues.",
      ]},
    ],
  },
  {
    title: "Definitions",
    blocks: [{ type: "ul", items: [
      { label: '"Business Day"', text: "means a day other than a Saturday, Sunday, or statutory holiday in Ontario." },
      { label: '"Fair Replacement Value"', text: "means the depreciated value of an item at the time of loss or damage, calculated using the methodology in Section 9." },
      { label: '"Inherent Vice"', text: "means a pre-existing weakness, defect, or quality in an item (such as a defective dye lot, weak seam, or fabric that is not fit for standard cleaning) that causes damage regardless of the care used in cleaning it." },
      { label: '"Order"', text: "means a single scheduled pickup and the items submitted under it." },
      { label: '"Settlement Offer"', text: "means a proposed resolution to a claim under Section 8, whether re-cleaning, repair, credit, or monetary compensation." },
    ]}],
  },
  {
    title: "Our Relationship to Your Items",
    blocks: [{ type: "p", text: "As explained in our Terms & Conditions, Starex takes possession of your items as a bailee for reward, and owes a duty to take reasonable care of them. Under Ontario bailment law, if an item is lost or comes back damaged after being in our care, a rebuttable presumption of negligence generally arises — meaning Starex, not you, carries the burden of showing that we took reasonable care. That is why our claims process (Section 8) focuses on us investigating what happened, rather than requiring you to prove exactly how the damage occurred." }],
  },
  {
    title: "Insurance",
    blocks: [{ type: "p", text: "Starex maintains commercial general liability and bailee's customers' goods coverage appropriate to our operations. This insurance is what ultimately stands behind the compensation described in Section 12; it does not expand the per-item or per-Order limits set out there, and a claim under this Policy is handled directly with Starex rather than requiring you to deal with an insurer." }],
  },
  {
    title: "Cancellations & Rescheduling",
    blocks: [
      { type: "p", text: "You may cancel or reschedule an Order through your account or by contacting us. Our scheduling fees are set at a level intended to be a genuine, reasonable pre-estimate of the cost we incur reserving pickup capacity for you — driver time, route planning, and displaced capacity for other customers — not a penalty:" },
      { type: "ul", items: [
        { label: "12+ hours' notice:", text: "Free cancellation or rescheduling, no charge." },
        { label: "3–12 hours' notice:", text: "A cancellation fee of 25% of the estimated Order value may apply." },
        { label: "Less than 3 hours' notice:", text: "A cancellation fee of up to 50% of the estimated Order value may apply." },
        { label: "No-show (no cancellation given):", text: "A fee up to the full minimum order value ($40) may apply." },
      ]},
      { type: "p", text: "If Starex needs to cancel or reschedule an Order (for example, due to weather, vehicle issues, or capacity constraints), we will notify you as early as possible and no cancellation fee will apply. You may choose an alternative time slot or a full refund of any amount already charged for that Order." },
      { type: "note", text: "Statutory cancellation rights: separately from the scheduling fees above, our Terms & Conditions describe statutory rights you may have to cancel an Order at no cost — for example, if we did not provide required pre-contract disclosure, or did not deliver a confirmation copy of your Order. See Section 7 of our Terms & Conditions for details; those rights are unaffected by this Section." },
    ],
  },
  {
    title: "Refund Eligibility",
    blocks: [
      { type: "p", text: "Refunds (in whole or in part, at our discretion, as store credit or a refund to your original payment method) may be issued where:" },
      { type: "ul", items: [
        "Starex cancels or is unable to fulfil a confirmed Order",
        "A verified service quality issue is reported within the timeframe in Section 7 (e.g., items not properly cleaned per the service ordered), including where the issue amounts to a breach of the CPA's implied warranty of reasonably acceptable quality",
        "A billing error resulted in an incorrect charge",
        "A damage or loss claim is approved under Section 8",
      ]},
      { type: "p", text: "Refunds are not available for: change of mind after an Order has been collected and processing has begun; items submitted that were excluded or restricted under our Terms & Conditions; or normal wear, colour bleeding, or shrinkage arising from the fabric itself rather than our handling (see Section 11). Where a refund is legally owed to you — for example, because a service fell short of the CPA's acceptable-quality warranty — Starex will not limit you to store credit only if you prefer a refund to your original payment method." },
      { type: "p", text: "Approved refunds are typically processed within 5–10 business days to the original payment method, or issued as account credit where agreed with you." },
    ],
  },
  {
    title: "Reporting Window",
    blocks: [
      { type: "p", text: "We ask that claims for damaged, missing, or incorrect items be reported within 24 hours of delivery. This internal reporting window helps us investigate promptly, while evidence (such as the condition of the item and our intake notes) is freshest, and is how we aim to resolve most issues without either side needing to involve outside processes. It is a practical guideline for fast resolution, not a legal deadline: it does not shorten, and is not a substitute for, the limitation period that applies to any legal claim under Ontario's Limitations Act, 2002 (generally two years from when the issue was or ought reasonably to have been discovered). Claims reported after 24 hours will still be reviewed, though it may be harder for either party to establish what happened the longer the delay." },
    ],
  },
  {
    title: "Damage & Loss Claims Process",
    blocks: [
      { type: "p", text: "To submit a claim:" },
      { type: "ol", items: [
        "Contact us at hello@starexlaundry.ca or 437-607-7251, including your Order number.",
        "Provide clear photographs of the affected item(s) and, where relevant, the original garment tag or care label.",
        "Describe the issue (e.g., staining, tear, shrinkage, missing item) as specifically as possible.",
        "Our team will review the claim — including comparing intake photos/notes taken at pickup where available — and respond within 5 Business Days with a proposed resolution.",
        "We will notify you of our decision and any Settlement Offer using the email or phone number on your account, unless you tell us to use a different method.",
      ]},
    ],
    subsections: [
      { title: "Possible Resolutions", blocks: [{ type: "ul", items: [
        "Re-cleaning, repair, or professional restoration of the item at no cost, where feasible",
        "Compensation up to the per-item liability limit described in Section 12, calculated per Section 9",
        "Store credit or partial/full refund for the affected item's service cost, depending on the nature of the issue",
      ]}]},
      { title: "Same-Day / Satisfaction Follow-Up", blocks: [{ type: "p", text: "If you are not satisfied with a completed Wash & Fold or Ironing & Press order due to a cleaning or pressing issue within our control, contact us within 24 hours of delivery. Where reasonable, we will re-clean or re-press the affected items at no additional charge before considering a refund." }] },
    ],
  },
  {
    title: "How We Value a Damaged or Lost Item",
    blocks: [
      { type: "p", text: "Where compensation is owed for a damaged or lost item, Starex calculates it using the depreciated Fair Replacement Value methodology set out in the Fair Claims Guide published by the Drycleaning & Laundry Institute (DLI) — the methodology widely used across the textile care industry, including by courts and arbitrators, to settle disputes over damaged or lost garments. This reflects that most textiles have a limited useful life and lose value with age and wear, independent of anything Starex did:" },
      { type: "ol", items: [
        "We start from the item's original replacement cost (a receipt or reasonable estimate of current retail price for an equivalent item).",
        "We refer to the average life expectancy for that category of item (for example, a typical dress shirt or a silk blouse has a materially shorter expected life than a wool coat).",
        "We apply an adjustment factor based on the item's age and condition immediately before the loss or damage occurred.",
        "The adjustment factor is multiplied by the replacement cost to determine the compensation amount, subject to the per-item cap in Section 12.",
      ]},
      { type: "note", text: "Example: a dress shirt with an original purchase price of $80 and a typical expected life of about 2 years, damaged when it was 1 year old and in good condition, would generally be valued at a fraction of its original price under this methodology — not the full $80 — reflecting the wear it had already experienced. We will explain the specific calculation for your item if you ask." },
      { type: "p", text: "An item that was already at or beyond the end of its normal useful life, or that was worn out through ordinary use, generally has little or no residual value under this methodology regardless of the cause of loss or damage. Sentimental value is not part of this calculation, though we will always try to repair or restore a sentimental item where feasible rather than defaulting to a cash settlement." },
    ],
  },
  {
    title: "Care Labels, Inherent Vice & Manufacturer Defects",
    blocks: [
      { type: "p", text: "Starex follows manufacturer care labels and instructions when cleaning your items. Consistent with industry practice:" },
      { type: "ul", items: [
        "If an item has no care label, or the care label is missing, illegible, or conflicts with the fabric, we will contact you before proceeding with a service that carries added risk; if you authorize us to proceed anyway, Starex is not responsible for resulting damage caused by that added risk.",
        "If Starex proceeds without a legible care label and without your authorization, we accept responsibility for problems resulting from that choice, consistent with industry practice.",
        "Starex is not responsible for damage caused by Inherent Vice — for example, a defective dye lot, weak or degraded fabric, or poor-quality construction — that would have caused the same problem under normal, professional cleaning consistent with the manufacturer's own instructions.",
      ]},
    ],
  },
  {
    title: "What Is Not Covered",
    blocks: [
      { type: "p", text: "Consistent with the bailee's standard of reasonable care described in Section 3 (which does not make Starex an insurer against every possible outcome), Starex is not responsible for, and will not issue refunds or compensation for:" },
      { type: "ul", items: [
        "Normal wear and tear, or items worn out or at the end of their useful life (Section 9)",
        "Pre-existing damage, stains, tears, loose buttons, or worn fabric not disclosed or visible at pickup",
        "Colour bleeding or fading in fabrics that are not colorfast",
        "Shrinkage of garments lacking proper care labels or incorrectly labelled, except as described in Section 10",
        "Damage caused by items left in pockets (pens, lighters, cosmetics, etc.)",
        "Items submitted under a service unsuited to them (e.g., dry-clean-only garments submitted as Wash & Fold without disclosure)",
        "High-value items such as fine jewelry, loose gemstones, or fur not disclosed at booking",
        "Damage caused by Inherent Vice, as described in Section 10",
      ]},
      { type: "p", text: "These exclusions describe outcomes outside our control or disclosed risk, rather than an attempt to exclude liability for our own negligence; where an issue in fact results from our negligence, Sections 8 and 12 govern instead of this Section." },
    ],
  },
  {
    title: "Liability Limits",
    blocks: [
      { type: "p", text: "Where Starex is found responsible for loss or damage to an item, our liability is limited to the lesser of the item's Fair Replacement Value (Section 9) or $500 per item, unless a higher value was disclosed and agreed in writing in advance for a specific high-value item (such as a wedding gown or leather garment). Starex's total liability for an Order will not exceed the amount paid for that Order or the applicable per-item limit, whichever is greater, except where a higher liability is required by law. Indirect or consequential losses (such as inconvenience or loss of use) are not covered, except to the extent such a limitation would be invalid under the CPA or other applicable law." },
      { type: "note", text: "Why this limit is enforceable: this liability limit is disclosed to you in advance, in our Terms & Conditions, before you submit an Order — not for the first time on a claim ticket or after your items have already been dropped off. Ontario courts generally will not enforce a limitation clause a customer only learns about after the contract is already formed; by contrast, a limit disclosed and agreed to up front, as here, is the kind of clause courts will generally enforce provided it is reasonable and not applied to exclude liability for our own negligence altogether (which it does not, per Sections 3 and 8)." },
    ],
  },
  {
    title: "Settlement Offers & Independent Appraisal",
    blocks: [{ type: "p", text: "A Settlement Offer under Section 8 remains open for you to accept for 30 days from the date it is made, after which you may need to contact us to confirm it is still available. If you disagree with our proposed valuation under Section 9, you may, at your own cost, obtain an independent appraisal or repair estimate from a qualified third party; we will consider it in good faith and may revise our offer accordingly, though we are not obligated to accept a third-party appraisal in full. Accepting a Settlement Offer resolves that specific claim; it does not require you to release any other claim or waive any statutory right." }],
  },
  {
    title: "Service-Specific Provisions",
    blocks: [],
    subsections: [
      { title: "Dry Cleaning", blocks: [{ type: "p", text: "Because dry cleaning uses solvents and processes suited to specific fabrics, please flag any embellishments, trims, linings, or unusual construction at booking. Section 10 (care labels and Inherent Vice) applies in full to dry cleaning claims." }] },
      { title: "Household & Bedding", blocks: [{ type: "p", text: "Large items (duvets, curtains, rugs, and similar) are inspected on a best-efforts basis at intake; pre-existing wear, colour loss, or filling clumping in duvets/pillows is common in older items and is treated as Inherent Vice under Section 10 unless our handling is shown to be the cause." }] },
      { title: "Car & Sofa Detailing", blocks: [{ type: "p", text: "Before detailing begins, please remove personal items and valuables from the vehicle or furniture. Final pricing is confirmed upon inspection and any pre-existing damage, stains, odours, or upholstery wear identified at that time will be noted before work begins and is excluded from any claim under this Policy. Starex is not responsible for mechanical, electronic, or cosmetic issues unrelated to the detailing service performed." }] },
      { title: "Same-Day Express", blocks: [{ type: "p", text: "If Starex accepts a Same-Day Express Order but is unable to meet the same-day turnaround for reasons within our control, we will refund the express surcharge for that Order and complete the service on our standard timeline, at no further charge." }] },
    ],
  },
  {
    title: "Weight & Measurement Disputes",
    blocks: [{ type: "p", text: "Wash & Fold and Same-Day Express pricing depends on the weight recorded at our facility after pickup. If you dispute the recorded weight, contact us within 24 hours of receiving your invoice; where practical, we retain intake records (such as photos or scale logs) that can be reviewed, and we will correct any demonstrated error promptly." }],
  },
  {
    title: "Redelivery & Failed Delivery Attempts",
    blocks: [{ type: "p", text: "If a scheduled delivery cannot be completed because no one is available and no safe drop-off location was authorized, we will attempt to reschedule delivery. A reasonable redelivery fee may apply for attempts beyond the first, which will be disclosed to you before it is charged. This is separate from, and does not affect, Section 15 (Unclaimed Items) of our Terms & Conditions." }],
  },
  {
    title: "Lost Items",
    blocks: [{ type: "p", text: "If an item cannot be located after a reasonable search (typically within 10 Business Days of being reported), it will be treated as lost and handled as a damage claim under Sections 8, 9, and 12. If an item is later recovered after a loss claim has already been paid, we will contact you; you may choose to receive the recovered item and return the settlement payment, or keep the settlement and allow Starex to retain or donate the item." }],
  },
  {
    title: "Payment Disputes & Chargebacks",
    blocks: [{ type: "p", text: "You always retain the right to dispute a charge with your card issuer; nothing in this Policy limits that right. If you initiate a chargeback for an Order, we ask that you also contact us so we can try to resolve the underlying issue directly and provide any information your card issuer may request. We reserve the right to review account activity where a pattern of disputed charges suggests misuse, without affecting your right to pursue a legitimate dispute." }],
  },
  {
    title: "Monthly Plan Refunds",
    blocks: [{ type: "p", text: "Monthly subscription fees are non-refundable for the current billing period once the cycle has started, except where Starex is unable to deliver the plan's core service for reasons within our control, or where a refund is required under Section 6.4 of our Terms & Conditions (failure to deliver a prepaid future-performance service within 30 days). You may cancel future renewals at any time as described in our Terms & Conditions." }],
  },
  {
    title: "If You're Not Satisfied With Our Response",
    blocks: [
      { type: "p", text: "Most issues are resolved through the process above. If you remain unsatisfied:" },
      { type: "ol", items: [
        "Ask to have your concern escalated within Starex — contact our team and request a review by a manager or our Privacy/Customer Care lead.",
        "Contact Consumer Protection Ontario (Ministry of Public and Business Service Delivery) at 1-800-889-9768 or ontario.ca/consumerprotection for general guidance on your rights.",
        "You may bring a claim in Ontario's Small Claims Court (currently for amounts up to $50,000, exclusive of costs and interest) or Superior Court of Justice, or dispute the charge with your card issuer, at any time — nothing in this Policy or our Terms & Conditions requires you to use arbitration or prevents you from going to court, consistent with Section 20 of our Terms & Conditions.",
      ]},
    ],
  },
  {
    title: "Changes to This Policy",
    blocks: [{ type: "p", text: 'We may update this Policy from time to time to reflect changes in our services or legal requirements. We will revise the "Last Updated" date above and, for material changes, provide notice by email or a notice on our website. No change will retroactively reduce a right you already had in connection with an Order placed before that change.' }],
  },
  {
    title: "How to Reach Us",
    blocks: [
      { type: "ul", items: [
        { label: "Email:", text: "hello@starexlaundry.ca" },
        { label: "Phone:", text: "437-607-7251" },
        { label: "Hours:", text: "7 days a week, 7:00 AM – 8:00 PM EST" },
        { label: "Mailing Address:", text: "Available on request — email hello@starexlaundry.ca or call 437-607-7251, Brampton, ON" },
      ]},
      { type: "note", text: "This document was prepared with reference to Ontario's Consumer Protection Act, 2002, common-law bailment principles (including the presumption of negligence and the reasonable-notice rule for exclusion clauses), the Limitations Act, 2002, the Fair Claims Guide published by the Drycleaning & Laundry Institute, and common practice among Canadian laundry and dry cleaning pickup-and-delivery providers. It is not legal advice." },
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Refund, Cancellation & Damage Policy"
      effectiveDate={EFFECTIVE}
      intro={"This Policy supplements our Terms & Conditions and explains how Starex handles order cancellations, rescheduling, refunds, and claims for damaged, lost, or unsatisfactory items. It forms part of the consumer agreement between you and Starex and is subject to the same governing law and consumer-protection principles described in our Terms & Conditions, including your rights under Ontario's Consumer Protection Act, 2002 (\"CPA\"). Nothing in this Policy limits any right or remedy you have at law, and no provision of this Policy is intended to waive a right that cannot be waived under the CPA."}
      sections={sections}
      seeAlso={[{ label: "Terms & Conditions", href: "/terms" }, { label: "Privacy Policy", href: "/privacy" }]}
    />
  );
}
