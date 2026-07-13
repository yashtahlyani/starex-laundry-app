import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Starex",
  description: "Learn how Starex collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "Information We Collect",
    body: `When you use Starex, we collect: (a) Account information you provide — name, email address, phone number, and delivery address; (b) Order information — service type, pickup date, time slot, order notes, and payment details processed via our secure payment provider; (c) Usage data — pages visited, features used, browser type, IP address, and referring URLs collected automatically via cookies and analytics tools; (d) Communications — messages you send us via our contact form, email, or in-app support.`,
  },
  {
    title: "How We Use Your Information",
    body: `We use the information we collect to: fulfill and manage your laundry orders; send order confirmation, pickup reminders, and delivery notifications via email or SMS; provide customer support; improve our platform features and service quality; send promotional communications (you can unsubscribe at any time); detect and prevent fraud or unauthorized account access; and comply with legal obligations under Canadian law.`,
  },
  {
    title: "Information Sharing",
    body: `We do not sell your personal information to third parties. We may share your information with: (a) Service providers — trusted vendors who help us operate the platform (e.g., cloud hosting, payment processing, analytics), bound by confidentiality agreements; (b) Legal requirements — if required by law, court order, or to protect the rights and safety of Starex, our employees, or the public; (c) Business transfers — in the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction, with notice provided to you.`,
  },
  {
    title: "Cookies and Tracking",
    body: `We use cookies and similar technologies to maintain your session, remember your preferences, and analyze how our platform is used. You can control cookies through your browser settings; however, disabling cookies may affect certain features of the Service. We use first-party analytics and do not use advertising cookies.`,
  },
  {
    title: "Data Retention",
    body: `We retain your account and order information for as long as your account is active or as needed to provide the Service, resolve disputes, and comply with legal obligations. If you request deletion of your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law (e.g., financial records required for tax purposes, which we retain for 7 years).`,
  },
  {
    title: "Security",
    body: `We implement industry-standard security measures including TLS encryption for data in transit, encrypted storage for sensitive data at rest, and access controls limiting who can view your information. While we take reasonable steps to protect your data, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "Your Rights (PIPEDA)",
    body: `As a Canadian resident, you have the right under the Personal Information Protection and Electronic Documents Act (PIPEDA) to: access the personal information we hold about you; request correction of inaccurate information; withdraw consent to certain uses of your data; and request deletion of your account and associated data. To exercise these rights, contact us at hello@starexlaundry.ca. We will respond within 30 days.`,
  },
  {
    title: "Children's Privacy",
    body: `The Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected such information, we will delete it promptly. If you believe a child under 13 has provided us personal information, please contact us.`,
  },
  {
    title: "Third-Party Links",
    body: `The Service may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to review the privacy policies of any third-party sites you visit.`,
  },
  {
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date, and where appropriate by sending an email notification. Your continued use of the Service after changes take effect constitutes acceptance of the revised policy.`,
  },
  {
    title: "Contact Us",
    body: `For privacy-related questions, concerns, or requests, please contact our Privacy Officer at hello@starexlaundry.ca or by mail at Starex Laundry Inc., Brampton, ON, Canada. We take all privacy inquiries seriously and will respond within 30 days.`,
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ background: "#FBF8F1", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "var(--brand)", paddingTop: 100, paddingBottom: 64, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <span style={{ display: "inline-block", background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 999, marginBottom: 20 }}>
            Legal
          </span>
          <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(2rem,4vw,2.8rem)", color: "#fff", letterSpacing: "-0.025em", marginBottom: 16 }}>
            Privacy Policy
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Kodchasan, sans-serif", fontSize: "1rem" }}>
            Effective date: January 1, 2025 &nbsp;·&nbsp; Last updated: July 1, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "64px 24px 96px" }}>
        <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#6E5F5C", fontSize: "1rem", lineHeight: 1.75, marginBottom: 48 }}>
          Your privacy matters to us. This Privacy Policy explains how Starex Laundry Inc. collects, uses, shares, and protects your personal information when you use our platform and services.
        </p>

        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#241619", marginBottom: 12 }}>
              {i + 1}. {s.title}
            </h2>
            <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#6E5F5C", fontSize: "0.9625rem", lineHeight: 1.8 }}>
              {s.body}
            </p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #E4E4E7", paddingTop: 32, marginTop: 16 }}>
          <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#8A7B77", fontSize: "0.875rem" }}>
            See also our{" "}
            <a href="/terms" style={{ color: "#A82F4B", textDecoration: "underline" }}>Terms of Service</a>.
            For questions, email{" "}
            <a href="mailto:hello@starexlaundry.ca" style={{ color: "#A82F4B", textDecoration: "underline" }}>hello@starexlaundry.ca</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
