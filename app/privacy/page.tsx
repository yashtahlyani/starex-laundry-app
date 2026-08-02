import type { Metadata } from "next";
import LegalDoc, { type LegalSection } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy — Starex",
  description: "How Starex collects, uses, discloses, and protects your personal information under PIPEDA and Canada's Anti-Spam Legislation.",
};

const EFFECTIVE = "August 2, 2026";
const ADDRESS_LINE = "Business address available on request — email hello@starexlaundrydryclean.ca or call 437-607-7251";
const LEGAL_NAME = "Royal Art Treasure Inc.";

const sections: LegalSection[] = [
  {
    title: "Definitions",
    blocks: [{
      type: "ul", items: [
        { label: '"Personal Information"', text: "means information about an identifiable individual, as defined in PIPEDA. It does not include an individual's name, title, business address, or business telephone number when collected solely for business contact purposes." },
        { label: '"Sensitive Personal Information"', text: "means personal information that, due to its nature or context, requires a higher standard of care — for example, information about allergies or sensitivities you disclose so we can choose appropriate detergents." },
        { label: '"Breach of Security Safeguards"', text: "means the loss of, unauthorized access to, or unauthorized disclosure of personal information resulting from a breach of an organization's security safeguards, as defined in PIPEDA." },
        { label: '"Commercial Electronic Message" or "CEM"', text: "means an electronic message (email, SMS/text) that encourages participation in a commercial activity, as defined in CASL." },
        { label: '"Service Provider"', text: "means a third party that processes personal information on our behalf and under our instructions (e.g., a payment processor or hosting provider)." },
      ],
    }],
  },
  {
    title: "Accountability — Our Privacy Officer",
    blocks: [
      { type: "p", text: "Starex (legal name: Royal Art Treasure Inc., operating as Starex) is accountable for the personal information under its control. In accordance with PIPEDA's Accountability principle, we have designated a Privacy Officer responsible for our compliance with this Policy and with Canadian privacy law:" },
      { type: "ul", items: [
        { label: "Legal entity:", text: LEGAL_NAME },
        { label: "Title:", text: "Privacy Officer, Starex" },
        { label: "Email:", text: "hello@starexlaundrydryclean.ca" },
        { label: "Phone:", text: "437-607-7251" },
        { label: "Mailing Address:", text: ADDRESS_LINE },
      ]},
      { type: "p", text: "Our Privacy Officer is responsible for ensuring our privacy policies and practices are followed, that staff are trained on their privacy obligations, and that questions, requests, and complaints from individuals are addressed. Where we share personal information with a Service Provider, we remain accountable for that information and require the Service Provider, through contract, to protect it to a standard consistent with this Policy." },
    ],
  },
  {
    title: "Personal Information We Collect",
    blocks: [],
    subsections: [
      { title: "Identification & Contact Information", blocks: [{ type: "ul", items: ["Full name", "Email address and phone number", "Pickup and delivery address(es)", "Account username and password (stored in encrypted/hashed form)"] }] },
      { title: "Payment Information", blocks: [{ type: "p", text: "Card or bank details you provide at checkout are collected and stored by our PCI-DSS compliant payment processor, not by Starex directly. We retain only limited billing metadata (e.g., last four digits of a card, transaction amount, invoice history) needed for order records, refunds, and accounting." }] },
      { title: "Order & Service Information", blocks: [{ type: "ul", items: ["Pickup/delivery dates, time windows, and confirmations", "Garment counts, weights, and service types selected", "Special handling instructions (e.g., delicate fabric, no fabric softener)", "Order history and service frequency"] }] },
      { title: "Sensitive Information You Choose to Share", blocks: [{ type: "p", text: "If you disclose an allergy or sensitivity to a detergent, fragrance, or fabric softener so that we can accommodate it, we treat this as sensitive personal information and use it solely to fulfill your order safely, with restricted internal access." }] },
      { title: "Technical & Usage Information", blocks: [{ type: "ul", items: ["IP address, browser type/version, and operating system", "Device identifiers and general device type", "Pages visited, time on page, click paths, and referral source", "Approximate location derived from IP address or, where you enable it, device GPS (for scheduling accuracy and driver tracking)"] }] },
      { title: "Communications", blocks: [{ type: "p", text: "Records of correspondence with our support team, including emails, chat messages, and — where you are notified in advance — call recordings kept for quality assurance and dispute resolution." }] },
      { title: "Marketing Preferences", blocks: [{ type: "p", text: "Your consent status and preferences for promotional emails or SMS messages, and a record of how and when consent was obtained, in accordance with CASL record-keeping expectations." }] },
    ],
  },
  {
    title: "Sources of Personal Information",
    blocks: [{ type: "p", text: "We collect personal information directly from you (account registration, bookings, support requests), automatically through your use of our website and app (cookies and similar technologies, described in Section 14), and, occasionally, from our Service Providers acting on our instructions (e.g., a payment processor confirming a transaction was completed)." }],
  },
  {
    title: "Why We Collect Your Information (Identifying Purposes)",
    blocks: [
      { type: "p", text: "Consistent with PIPEDA's Identifying Purposes principle, we collect and use personal information only for the following purposes, which are identified to you at or before the time of collection (including through this Policy):" },
      { type: "ul", items: [
        "To create and manage your account",
        "To schedule, process, and fulfill pickup, cleaning, and delivery Orders",
        "To process payments, issue invoices/receipts, and manage billing disputes or refunds",
        "To communicate order status, confirmations, and service updates",
        "To provide customer support and resolve service, damage, or loss issues",
        "To send promotional or marketing communications, where you have provided consent, in compliance with CASL",
        "To maintain the security of your account and detect or prevent fraud",
        "To analyze and improve our website, app, and service quality",
        "To comply with legal, tax, accounting, and regulatory obligations",
        "To establish, exercise, or defend legal claims",
      ]},
      { type: "note", text: "A reasonable person test: in addition to the purposes above, PIPEDA requires that any collection, use, or disclosure of personal information be limited to purposes a reasonable person would consider appropriate in the circumstances. Starex does not use personal information for profiling that could lead to unfair or discriminatory treatment, and does not sell personal information to data brokers or unrelated third parties." },
    ],
  },
  {
    title: "Consent",
    blocks: [],
    subsections: [
      { title: "How We Obtain Consent", blocks: [{ type: "p", text: "We rely on express consent (an affirmative action, such as checking a box or opting in) for sensitive uses and for marketing communications, and on implied consent (reasonably inferred from the circumstances, such as providing your address to receive a delivery) for information that is clearly necessary to fulfill the Services you have requested." }] },
      { title: "Withdrawing Consent", blocks: [{ type: "p", text: "You may withdraw consent for optional uses (such as marketing) at any time, subject to legal or contractual restrictions and reasonable notice, by contacting our Privacy Officer or using the unsubscribe mechanism in our messages. Withdrawing consent for information necessary to provide the Services (e.g., your delivery address) may mean we are no longer able to complete your Order." }] },
      { title: "Minors", blocks: [{ type: "p", text: "The Services are intended for adults capable of entering a binding contract in Ontario. We do not knowingly collect personal information from children, and do not seek consent from individuals who lack the legal capacity to provide it." }] },
    ],
  },
  {
    title: "Limiting Collection",
    blocks: [{ type: "p", text: "We collect only the personal information necessary for the purposes identified in Section 5, by fair and lawful means. We do not require you to consent to the collection, use, or disclosure of information beyond what is necessary to provide the Services as a condition of supplying that service, except where that information is genuinely required to fulfill the specific service you have requested." }],
  },
  {
    title: "Limiting Use, Disclosure & Retention",
    blocks: [],
    subsections: [
      { title: "Use & Disclosure", blocks: [{ type: "p", text: "We use and disclose personal information only for the purposes identified at the time of collection, or for a purpose you have separately consented to, unless disclosure is required or permitted by law (for example, in response to a valid court order or subpoena). We do not sell or rent personal information." }] },
      { title: "Who We Share Information With", blocks: [{ type: "ul", items: [
        { label: "Service Providers:", text: "payment processors, cloud hosting, email/SMS notification platforms, and route-planning/dispatch tools, each contractually bound to use information only as we instruct and to protect it to a standard comparable to PIPEDA" },
        { label: "Delivery personnel:", text: "to the extent necessary to complete your pickup and delivery" },
        { label: "Professional advisors:", text: "such as accountants or lawyers, where necessary and subject to confidentiality obligations" },
        { label: "Legal and regulatory authorities:", text: "where required by law, court order, or to protect the rights, property, or safety of Starex, our customers, or others" },
        { label: "A successor entity:", text: "in connection with a merger, financing, acquisition, or sale of business assets, subject to this Policy or a materially similar one" },
      ]}]},
      { title: "Cross-Border Processing", blocks: [{ type: "p", text: "Some of our Service Providers may store or process personal information outside Canada, including in the United States. When we transfer information across borders, we remain accountable for it and take reasonable steps to ensure a comparable level of protection through contractual or other means. Personal information transferred outside Canada may be accessible to courts, law enforcement, and national security authorities of that jurisdiction under its laws." }] },
      { title: "Retention Periods", blocks: [
        { type: "p", text: "We retain personal information only as long as necessary to fulfill the identified purposes, or as required by law:" },
        { type: "ul", items: [
          { label: "Account information:", text: "for the duration of your account, plus 24 months after closure, in case of disputes or re-activation" },
          { label: "Order & transaction records:", text: "7 years, to meet Canada Revenue Agency and accounting requirements" },
          { label: "Support communications:", text: "3 years, for quality assurance and dispute resolution" },
          { label: "Marketing consent records:", text: "retained for as long as consent is active, plus a reasonable period after withdrawal to demonstrate CASL compliance" },
          { label: "Website usage/analytics data:", text: "typically 26 months" },
          { label: "Breach of security safeguards records:", text: "a minimum of 24 months from the date the breach is discovered, as required by PIPEDA's Breach of Security Safeguards Regulations, regardless of whether the breach met the reporting threshold" },
        ]},
        { type: "p", text: "When personal information is no longer needed, we securely delete, destroy, or anonymize it." },
      ]},
    ],
  },
  {
    title: "Accuracy",
    blocks: [{ type: "p", text: "We take reasonable steps to keep personal information as accurate, complete, and up to date as necessary for the purposes for which it is used. You can review and update most account details yourself, or contact our Privacy Officer to request a correction." }],
  },
  {
    title: "Safeguards",
    blocks: [{ type: "p", text: "We protect personal information using safeguards appropriate to its sensitivity:" }],
    subsections: [
      { title: "Technical Safeguards", blocks: [{ type: "ul", items: ["Encryption of sensitive data in transit (TLS/SSL)", "Access-controlled, monitored hosting environments", "Firewalls and regular security patching", "PCI-DSS compliant payment processing, with no full card numbers stored on our systems"] }] },
      { title: "Organizational Safeguards", blocks: [{ type: "ul", items: ["Access to personal information limited to employees who need it to do their jobs", "Confidentiality obligations and privacy training for staff and contractors handling personal information", "Contractual data-protection obligations imposed on Service Providers"] }] },
      { title: "Physical Safeguards", blocks: [
        { type: "ul", items: ["Controlled access to facilities where physical records (e.g., garment tags with order numbers) are handled", "Secure disposal of physical records containing personal information"] },
        { type: "note", text: "No method of transmission or electronic storage is completely secure, and we cannot guarantee absolute security. If you believe your account has been compromised, contact our Privacy Officer immediately." },
      ]},
    ],
  },
  {
    title: "Openness",
    blocks: [{ type: "p", text: "We make our privacy policies and practices readily available. This Policy is posted on our website and provided at account creation. You may request additional information about our privacy practices, including the existence, use, and disclosure of personal information, by contacting our Privacy Officer." }],
  },
  {
    title: "Individual Access",
    blocks: [
      { type: "p", text: "Subject to limited exceptions permitted by law (e.g., information subject to solicitor-client privilege, or that would reveal personal information about another individual), you have the right to:" },
      { type: "ul", items: ["Be informed of the existence, use, and disclosure of your personal information", "Access the personal information we hold about you", "Be told what personal information has been, or is being, disclosed to third parties"] },
    ],
    subsections: [
      { title: "How to Make a Request", blocks: [{ type: "p", text: "Send a written request to our Privacy Officer (contact details in Section 22). We may ask you to verify your identity before processing the request, to protect your information from unauthorized access." }] },
      { title: "Timing & Cost", blocks: [{ type: "p", text: "We will respond within 30 days of receiving a request, as contemplated by PIPEDA. If we require additional time, we will notify you of the reason and the extended timeline, consistent with PIPEDA's requirements. Access requests are generally provided at no or minimal cost; if a fee applies, we will give you a cost estimate in advance." }] },
      { title: "If We Cannot Provide Access", blocks: [{ type: "p", text: "If we are unable to provide access to certain information, we will explain the reason, subject to any legal restriction on disclosing that reason, and inform you of your right to challenge our refusal by filing a complaint as described in Section 13." }] },
    ],
  },
  {
    title: "Challenging Our Compliance",
    blocks: [
      { type: "p", text: "You have the right to challenge Starex's compliance with this Policy and with PIPEDA. To do so:" },
      { type: "ol", items: [
        "Contact our Privacy Officer (Section 22) with details of your concern. We will investigate and respond to all complaints.",
        "If you are not satisfied with our response, or if you prefer, you may file a complaint directly with the Office of the Privacy Commissioner of Canada (OPC) — full contact information is provided in Section 23.",
      ]},
      { type: "p", text: "We will not penalize you for raising a good-faith privacy concern or complaint." },
    ],
  },
  {
    title: "Cookies & Online Tracking Technologies",
    blocks: [],
    subsections: [
      { title: "Types of Cookies We Use", blocks: [{ type: "ul", items: [
        { label: "Essential cookies:", text: "required for core site/app functionality, such as staying signed in or completing a booking" },
        { label: "Performance/analytics cookies:", text: "help us understand traffic and usage patterns (e.g., Google Analytics)" },
        { label: "Functionality cookies:", text: "remember preferences such as your default service area or saved address" },
        { label: "Marketing cookies:", text: "used, with consent where required, to measure the effectiveness of our advertising" },
      ]}]},
      { title: "Managing Cookies", blocks: [{ type: "p", text: "You can manage or disable cookies through your browser settings, and can opt out of Google Analytics using the Google Analytics Opt-out Browser Add-on. Disabling some cookies may affect site functionality, such as your ability to complete a booking." }] },
    ],
  },
  {
    title: "Marketing Communications & CASL Compliance",
    blocks: [
      { type: "p", text: "Where we send you commercial electronic messages (emails or SMS/text messages promoting our services), we comply with Canada's Anti-Spam Legislation:" },
      { type: "ul", items: [
        { label: "Consent:", text: "We send marketing CEMs only with your express consent (e.g., opting in at checkout or on our website) or, where permitted, implied consent arising from an existing business relationship, which we treat as valid for up to 2 years after your last transaction with us unless you opt out sooner." },
        { label: "Identification:", text: "Every marketing message identifies Starex as the sender and includes our contact information, consistent with CASL's identification requirements." },
        { label: "Unsubscribe:", text: "Every marketing message includes a working unsubscribe mechanism. Unsubscribe requests are processed within 10 business days, at no cost to you." },
        { label: "Transactional messages:", text: "Order confirmations, pickup/delivery notifications, and account or billing notices are transactional, not promotional, and may be sent regardless of your marketing preferences, as they are necessary to provide the Services." },
      ]},
      { type: "p", text: "We keep records of how and when marketing consent was obtained, consistent with CASL's evidentiary requirements, since the onus is on Starex to demonstrate valid consent if asked." },
    ],
  },
  {
    title: "Breach of Security Safeguards",
    blocks: [
      { type: "p", text: "Despite our safeguards, no organization can guarantee that a breach will never occur. In the event of a breach of security safeguards involving personal information under our control, Starex will:" },
      { type: "ol", items: [
        'Assess whether the breach creates a real risk of significant harm ("RROSH") to any affected individual, considering the sensitivity of the information involved and the probability it will be misused, as required by PIPEDA.',
        "Where a RROSH is identified, report the breach to the Office of the Privacy Commissioner of Canada as soon as feasible, and notify affected individuals directly, in a manner consistent with the PIPEDA Breach of Security Safeguards Regulations.",
        "Notify any other organization (e.g., a financial institution or law enforcement) that may be able to reduce or mitigate harm to affected individuals.",
        "Maintain an internal record of every breach of security safeguards — regardless of whether it met the RROSH threshold — for at least 24 months, available to the OPC upon request.",
      ]},
    ],
  },
  {
    title: "Third-Party Links & Services",
    blocks: [{ type: "p", text: "Our website or app may link to third-party sites or services (e.g., payment processors, social media, or mapping tools) that are not operated by Starex. Those third parties have their own privacy policies, and we are not responsible for their content or data practices. We encourage you to review the privacy policy of any third-party site or service you interact with." }],
  },
  {
    title: "Children's Privacy",
    blocks: [{ type: "p", text: "Our Services are intended for use by adults capable of entering a binding service agreement in Ontario. We do not knowingly collect personal information from children. If you are a parent or guardian and believe a child has provided us with personal information without appropriate consent, contact our Privacy Officer and we will take prompt steps to delete it." }],
  },
  {
    title: "Other Provincial Privacy Laws",
    blocks: [{ type: "p", text: "Starex currently operates in Ontario, which relies on PIPEDA as its default private-sector privacy framework. If we expand to, or you access our Services from, a province with its own substantially similar private-sector privacy legislation — such as Quebec's Act respecting the protection of personal information in the private sector (as amended by Law 25), British Columbia's Personal Information Protection Act, or Alberta's Personal Information Protection Act — we will handle your personal information in accordance with the law applicable in that province, which may provide additional or different rights than those described in this Policy (for example, shorter breach-notification timelines or additional consent requirements)." }],
  },
  {
    title: "International Data Transfers",
    blocks: [{ type: "p", text: "Where our Service Providers are located outside Canada, your personal information may be stored or processed in that jurisdiction. See Section 8.3 for how we manage cross-border processing and the accountability we retain for information transferred to third parties." }],
  },
  {
    title: "Changes to This Policy",
    blocks: [{ type: "p", text: 'We may update this Privacy Policy to reflect changes in our practices, technology, services, or legal requirements. We will revise the "Last Updated" date above and, for material changes, provide notice by email or a prominent notice on our website before the changes take effect. Continued use of the Services after a change takes effect constitutes your acceptance of the revised Policy.' }],
  },
  {
    title: "Contact Our Privacy Officer",
    blocks: [
      { type: "p", text: "For any question, request, or complaint about this Policy or our handling of your personal information:" },
      { type: "ul", items: [
        { label: "Privacy Officer, Starex", text: "" },
        { label: "Email:", text: "hello@starexlaundrydryclean.ca" },
        { label: "Phone:", text: "437-607-7251" },
        { label: "Mailing Address:", text: ADDRESS_LINE },
      ]},
    ],
  },
  {
    title: "Contact the Office of the Privacy Commissioner of Canada",
    blocks: [
      { type: "p", text: "If you are not satisfied with our response, you may file a complaint with Canada's federal privacy regulator:" },
      { type: "ul", items: [
        { label: "Office of the Privacy Commissioner of Canada", text: "" },
        { label: "Address:", text: "30 Victoria Street, Gatineau, Quebec K1A 1H3" },
        { label: "Toll-free:", text: "1-800-282-1376" },
        { label: "Phone:", text: "819-994-5444" },
        { label: "Website:", text: "priv.gc.ca" },
      ]},
      { type: "note", text: "This document was prepared with reference to PIPEDA, its 10 fair information principles, the PIPEDA Breach of Security Safeguards Regulations, and CASL, as well as common practice among Canadian laundry and dry cleaning pickup-and-delivery providers. It is not legal advice." },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Privacy Policy"
      effectiveDate={EFFECTIVE}
      intro={'This Privacy Policy applies to Starex (legal name: Royal Art Treasure Inc., operating as Starex), a laundry and dry cleaning pickup-and-delivery business operating in Brampton and Mississauga, Ontario. It explains how we collect, use, disclose, retain, and protect personal information in connection with our website, mobile application, and services, and describes the rights available to you under Canadian privacy law. This Policy is written to comply with the Personal Information Protection and Electronic Documents Act ("PIPEDA"), its 10 fair information principles set out in Schedule 1, the PIPEDA Breach of Security Safeguards Regulations, and Canada\'s Anti-Spam Legislation ("CASL"). By using the Services, you acknowledge that you have read and understood this Policy.'}
      sections={sections}
      seeAlso={[{ label: "Terms & Conditions", href: "/terms" }, { label: "Refund, Cancellation & Damage Policy", href: "/refund-policy" }]}
    />
  );
}
