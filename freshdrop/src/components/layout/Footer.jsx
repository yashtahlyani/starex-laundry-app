import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowRight, Instagram, Twitter, Facebook } from 'lucide-react'

const pages = [
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]
const serviceList = ['Wash & Fold', 'Dry Cleaning', 'Express 24hr', 'Ironing & Press', 'Commercial', 'Pickup & Delivery']

const colHead = {
  fontFamily: 'Kodchasan, sans-serif', fontWeight: 600, fontSize: '0.7rem',
  letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
  marginBottom: '20px', display: 'block',
}
const linkStyle = {
  color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', textDecoration: 'none',
  display: 'block', marginBottom: '10px', fontFamily: 'Kodchasan, sans-serif',
  transition: 'color 0.15s ease',
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer style={{ background: '#111921' }}>
      {/* Main footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '48px' }}>

            {/* Brand + newsletter */}
            <div>
              <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: 'linear-gradient(180deg,#C9F8DE,#78EDB2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" stroke="#0a1a0f" strokeWidth="1.8" />
                    <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#0a1a0f" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.05rem', color: '#ffffff' }}>StareX</span>
              </Link>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '28px', maxWidth: '220px', fontFamily: 'Kodchasan, sans-serif' }}>
                Canada's premium laundry service. Pickup, clean, deliver — repeat.
              </p>
              {subscribed ? (
                <p style={{ color: '#78EDB2', fontFamily: 'Kodchasan, sans-serif', fontSize: '0.875rem', fontWeight: 600 }}>You're in ✓</p>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '10px', gap: 8 }}>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{ background: 'none', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.875rem', flex: 1, fontFamily: 'Kodchasan, sans-serif' }}
                  />
                  <button
                    onClick={() => { if (email) setSubscribed(true) }}
                    style={{ background: 'none', border: 'none', color: '#78EDB2', cursor: 'pointer', padding: '4px', display: 'flex' }}
                    aria-label="Subscribe"
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Pages */}
            <div>
              <span style={colHead}>Pages</span>
              {pages.map(p => (
                <Link key={p.href} to={p.href} style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.color = '#78EDB2'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                >{p.label}</Link>
              ))}
            </div>

            {/* Services */}
            <div>
              <span style={colHead}>Services</span>
              {serviceList.map(s => (
                <p key={s} style={linkStyle}>{s}</p>
              ))}
            </div>

            {/* Contact */}
            <div>
              <span style={colHead}>Contact</span>
              <p style={linkStyle}>hello@starex.ca</p>
              <p style={linkStyle}>(416) 555-1234</p>
              <p style={{ ...linkStyle, lineHeight: 1.65 }}>Toronto, ON<br />Mississauga, ON</p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <motion.a
                    key={i} href="#"
                    style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'flex' }}
                    whileHover={{ color: '#78EDB2', scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        {/* Ghost watermark */}
        <div style={{
          position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Poppins, sans-serif', fontWeight: 700,
          fontSize: 'clamp(3rem,10vw,6rem)', letterSpacing: '-0.04em',
          color: 'rgba(255,255,255,0.04)', whiteSpace: 'nowrap', userSelect: 'none', pointerEvents: 'none',
        }}>
          STAREX
        </div>

        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px', position: 'relative',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8125rem', fontFamily: 'Kodchasan, sans-serif' }}>
            &copy; 2025 StareX Inc. Made in Canada 🍁
          </p>
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ rotate: -45 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)', background: 'none',
              cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Back to top"
          >
            <ArrowUp size={15} />
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
