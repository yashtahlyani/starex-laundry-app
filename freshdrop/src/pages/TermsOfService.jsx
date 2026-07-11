import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const ease = [0.25, 0.4, 0.25, 1]

const sections = [
  {
    title: '1. Services',
    body: 'StareX provides laundry pickup, cleaning, and delivery services in the Greater Toronto Area. By booking a pickup, you agree to these terms. Services are subject to availability and operating hours (7 AM – 9 PM, 7 days a week).',
  },
  {
    title: '2. Pricing & Payment',
    body: 'Pricing is based on weight (Wash & Fold, Express) or item type (Dry Cleaning, Ironing). A price estimate is provided at booking; the final price is confirmed via SMS after weigh-in at pickup. Payment is collected upon delivery. We accept major credit and debit cards.',
  },
  {
    title: '3. Pickup & Delivery',
    body: 'You are responsible for ensuring someone is available at the provided address during the selected window. StareX is not responsible for missed pickups due to inaccessible premises or incorrect address information.',
  },
  {
    title: '4. Care of Items',
    body: 'StareX will follow care label instructions on all garments. We are not liable for pre-existing damage, colour bleeding between items, or shrinkage caused by manufacturer-specified care instructions. Report any concerns within 48 hours of delivery.',
  },
  {
    title: '5. Liability',
    body: 'StareX\'s liability for lost or damaged items is limited to 5× the service charge for the affected item, up to a maximum of $250 per order. We recommend not submitting irreplaceable or high-value items (>$500) for cleaning.',
  },
  {
    title: '6. Cancellations',
    body: 'You may cancel or reschedule a pickup up to 2 hours before the scheduled window at no charge. Cancellations inside the 2-hour window may incur a $5 convenience fee.',
  },
  {
    title: '7. Privacy',
    body: 'Your personal information is collected solely to provide and improve our services. We do not sell your data to third parties. See our Privacy Policy for full details.',
  },
  {
    title: '8. Changes to Terms',
    body: 'StareX reserves the right to update these terms at any time. Continued use of our services after notice of changes constitutes acceptance of the updated terms.',
  },
  {
    title: '9. Contact',
    body: 'Questions about these terms? Email us at hello@starex.ca or call (416) 555-1234 during business hours.',
  },
]

export default function TermsOfService() {
  return (
    <div style={{ background: '#F7F7F7' }}>
      <section style={{ paddingTop: 120, paddingBottom: 72, textAlign: 'center', background: '#111921', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0a3547 0%, #111921 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>Legal</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(2.2rem,5vw,3.2rem)', letterSpacing: '-0.022em', lineHeight: 1.15, color: '#ffffff', marginBottom: 16 }}>
            Terms of <em className="display-accent" style={{ display: 'inline' }}>Service.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', fontFamily: 'Kodchasan, sans-serif' }}>
            Effective date: January 1, {new Date().getFullYear()}
          </motion.p>
        </div>
      </section>

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 96px' }}>
        <p style={{ color: '#52525B', fontFamily: 'Kodchasan, sans-serif', lineHeight: 1.8, marginBottom: 40, fontSize: '0.9375rem' }}>
          These Terms of Service ("Terms") govern your use of StareX laundry services operated by StareX Inc. ("StareX", "we", "us"). By using our services you agree to these Terms.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {sections.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.4, ease }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.05rem', color: '#09090B', marginBottom: 10 }}>{s.title}</h2>
              <p style={{ color: '#52525B', fontFamily: 'Kodchasan, sans-serif', lineHeight: 1.8, fontSize: '0.9375rem' }}>{s.body}</p>
            </motion.div>
          ))}
        </div>
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid #E4E4E7' }}>
          <Link to="/privacy" style={{ color: '#4ECDA0', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
            Read our Privacy Policy →
          </Link>
        </div>
      </section>
    </div>
  )
}
