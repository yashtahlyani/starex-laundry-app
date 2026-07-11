import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const ease = [0.25, 0.4, 0.25, 1]

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly: your name, email address, phone number, and pickup address when you create an account or book a service. We also collect usage data (pages visited, features used) to improve our platform.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to fulfil your orders, send order confirmations and status updates via SMS/email, improve our services, and communicate service-related announcements. We do not send unsolicited marketing without your consent.',
  },
  {
    title: '3. Data Sharing',
    body: 'We do not sell, rent, or trade your personal information. We share data only with service providers who help us operate (payment processors, SMS providers) under strict confidentiality agreements, and when required by law.',
  },
  {
    title: '4. Data Storage & Security',
    body: 'Your data is stored securely on Supabase (hosted on AWS in Canada). We use industry-standard encryption in transit (TLS) and at rest. Passwords are hashed and never stored in plain text.',
  },
  {
    title: '5. Cookies',
    body: 'We use essential session cookies to keep you signed in. We do not use third-party tracking or advertising cookies. You can disable cookies in your browser, but some features may not function correctly.',
  },
  {
    title: '6. Your Rights',
    body: 'You can access, update, or delete your account information at any time from your Account settings page. To request full data deletion, email hello@starex.ca. We will process your request within 30 days.',
  },
  {
    title: '7. Data Retention',
    body: 'We retain your account and order data for up to 3 years after your last transaction for legal and accounting purposes. After this period, data is anonymised or deleted.',
  },
  {
    title: '8. Children',
    body: 'Our services are not directed at children under 13. We do not knowingly collect personal information from children. If you believe we have collected such information, contact us immediately.',
  },
  {
    title: '9. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of material changes via email or a notice on our website. Continued use after the effective date of any changes constitutes acceptance.',
  },
  {
    title: '10. Contact',
    body: 'For privacy questions or data requests, contact us at hello@starex.ca or write to StareX Inc., Toronto, Ontario, Canada.',
  },
]

export default function PrivacyPolicy() {
  return (
    <div style={{ background: '#F7F7F7' }}>
      <section style={{ paddingTop: 120, paddingBottom: 72, textAlign: 'center', background: '#111921', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0a3547 0%, #111921 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>Legal</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(2.2rem,5vw,3.2rem)', letterSpacing: '-0.022em', lineHeight: 1.15, color: '#ffffff', marginBottom: 16 }}>
            Privacy <em className="display-accent" style={{ display: 'inline' }}>Policy.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', fontFamily: 'Kodchasan, sans-serif' }}>
            Effective date: January 1, {new Date().getFullYear()}
          </motion.p>
        </div>
      </section>

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 96px' }}>
        <p style={{ color: '#52525B', fontFamily: 'Kodchasan, sans-serif', lineHeight: 1.8, marginBottom: 40, fontSize: '0.9375rem' }}>
          At StareX Inc. ("StareX", "we", "us"), your privacy matters. This Privacy Policy explains what information we collect, how we use it, and your choices regarding your data.
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
          <Link to="/terms" style={{ color: '#4ECDA0', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
            Read our Terms of Service →
          </Link>
        </div>
      </section>
    </div>
  )
}
