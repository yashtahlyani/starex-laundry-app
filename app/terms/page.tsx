import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Starex",
  description: "Read the Starex Terms of Service before using our laundry pickup and delivery platform.",
};

const sections = [
  {
    title: "Acceptance of Terms",
    body: `By accessing or using Starex ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all the terms and conditions of this agreement, you may not access or use the Service. These Terms apply to all visitors, users, and others who access or use the Service.`,
  },
  {
    title: "Description of Service",
    body: `Starex provides an online platform for scheduling residential and commercial laundry pickup, washing, dry cleaning, ironing, household-item cleaning, car and sofa detailing, and delivery services in Brampton and Mississauga, Ontario. We act as both a technology platform and a direct service provider. Service availability, turnaround times, and pricing are listed at the time of booking and are subject to change.`,
  },
  {
    title: "Accounts and Registration",
    body: `You may book a pickup as a guest with just your contact details, or create an account to track orders and access the Monthly Plan. If you create an account, you are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. You must be at least 18 years old to book with or use the Service. Notify us immediately at hello@starexlaundry.ca if you suspect unauthorized use of your account.`,
  },
  {
    title: "Booking, Cancellations, and Changes",
    body: `Bookings are confirmed upon successful submission of your order. You may cancel or reschedule a pickup at no charge if you do so at least 2 hours before the scheduled pickup window. Cancellations made less than 2 hours in advance may be subject to a $5 late-cancellation fee. We reserve the right to reschedule or cancel your pickup due to capacity, weather, or circumstances beyond our control, and will notify you by email or SMS.`,
  },
  {
    title: "Pricing and Payment",
    body: `Service pricing is calculated based on weight (for Wash & Fold, at $2 per pound) or per item (for Dry Cleaning, Ironing, and Household items). Car and sofa detailing is priced upon inspection. A minimum order value of $40 applies to Wash & Fold, Same-Day Express, Dry Cleaning, Ironing, and Household Items; a minimum order value of $199 applies to Car & Sofa Detailing. Same-Day Express is available on Wash & Fold only, at a flat $3 per pound. All prices shown exclude HST, which is added at checkout. The price shown at booking is an estimate; the final price is confirmed via SMS after your laundry is weighed or counted at our facility. Payment is collected upon delivery using the payment method on file, once delivery is confirmed. All prices are in Canadian Dollars (CAD).`,
  },
  {
    title: "Care of Items",
    body: `We take reasonable care of all items entrusted to us. However, we are not liable for damage to items that were inherently weak, previously damaged, or processed in accordance with care labels. We accept liability up to a maximum of 5× the cost of the individual service for any item we damage due to our negligence. You must report damage claims within 48 hours of delivery.`,
  },
  {
    title: "Prohibited Items",
    body: `You must not include the following items in your laundry: cash, jewelry, electronics, firearms, illegal substances, hazardous materials, irreplaceable heirlooms, or items requiring specialist restoration. We are not responsible for loss of or damage to prohibited items.`,
  },
  {
    title: "Intellectual Property",
    body: `The Service, including all text, graphics, logos, and software, is owned by Starex Laundry Inc. and is protected by Canadian and international intellectual property laws. You may not copy, reproduce, distribute, or create derivative works without our explicit written permission.`,
  },
  {
    title: "Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, Starex shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with the Service, even if we have been advised of the possibility of such damages. Our total aggregate liability to you for all claims arising under these Terms shall not exceed the amount paid by you for the specific order giving rise to the claim.`,
  },
  {
    title: "Governing Law",
    body: `These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Toronto, Ontario.`,
  },
  {
    title: "Changes to These Terms",
    body: `We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or a prominent notice on the Service at least 14 days before the changes take effect. Continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.`,
  },
  {
    title: "Contact Us",
    body: `If you have questions about these Terms, please contact us at hello@starexlaundry.ca, by phone at 437-607-7251, or by mail at Starex Laundry Inc., Brampton, ON, Canada.`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{
        paddingTop: 100, paddingBottom: 64, textAlign: "center", position: "relative", overflow: "hidden",
        background: "var(--brand)",
        minHeight: 380,
      }}>
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <span style={{ display: "inline-block", background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 999, marginBottom: 20 }}>
            Legal
          </span>
          <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(2rem,4vw,2.8rem)", color: "#fff", letterSpacing: "-0.025em", marginBottom: 16 }}>
            Terms of Service
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Kodchasan, sans-serif", fontSize: "1rem", marginBottom: 0 }}>
            Effective date: January 1, 2025 &nbsp;·&nbsp; Last updated: July 1, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "64px 24px 96px" }}>
        <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#6B6B6B", fontSize: "1rem", lineHeight: 1.75, marginBottom: 48 }}>
          Please read these Terms of Service carefully before using the Starex platform. These Terms constitute a legally binding agreement between you and Starex Laundry Inc.
        </p>

        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#161616", marginBottom: 12 }}>
              {i + 1}. {s.title}
            </h2>
            <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#6B6B6B", fontSize: "0.9625rem", lineHeight: 1.8 }}>
              {s.body}
            </p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #E4E4E7", paddingTop: 32, marginTop: 16 }}>
          <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#8C8C8C", fontSize: "0.875rem" }}>
            See also our{" "}
            <a href="/privacy" style={{ color: "#8F2740", textDecoration: "underline" }}>Privacy Policy</a>.
            For questions, email{" "}
            <a href="mailto:hello@starexlaundry.ca" style={{ color: "#8F2740", textDecoration: "underline" }}>hello@starexlaundry.ca</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
