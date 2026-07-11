import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X, ArrowRight, Shirt, Sparkles, Zap, Package, Star, Briefcase } from 'lucide-react'
import AnimatedContent from '../components/reactbits/AnimatedContent'

const ease = [0.25, 0.4, 0.25, 1]

const pasteColors = ['#E4F4FB', '#D1F9E3', '#FDF1E1', '#EAEDf9', '#E4F4FB', '#D1F9E3']

const payAsYouGo = [
  { icon: Shirt,     title: 'Wash & Fold',       price: '$2.50',     unit: '/lb',   min: 'Min. $15', desc: '24-48hr turnaround' },
  { icon: Zap,       title: 'Express Wash',       price: '$3.50',     unit: '/lb',   min: 'Min. $20', desc: 'Back by 6 PM same day' },
  { icon: Sparkles,  title: 'Dry Cleaning',       price: 'From $12.99', unit: '/item', min: null,    desc: '48-72hr delicates & formalwear' },
  { icon: Package,   title: 'Ironing & Press',    price: 'From $4.99',  unit: '/item', min: null,    desc: 'Shirts, suits, dresses' },
  { icon: Star,      title: 'Duvet / Comforter',  price: '$24.99',    unit: '/item', min: null,       desc: 'King/Queen eco wash' },
  { icon: Briefcase, title: 'Commercial Linen',   price: 'Custom',    unit: '',      min: null,       desc: 'Hotels, restaurants, gyms', badge: 'Quote' },
]

const plans = [
  { name: 'Basic',    tagline: 'Perfect for individuals',  price: '$24', annual: '$19', popular: false,
    features: [
      { label: '10 lbs of laundry / month', ok: true },
      { label: '1 pickup per week',          ok: true },
      { label: '48hr turnaround',            ok: true },
      { label: 'Free pickup & delivery',     ok: true },
      { label: 'Eco-certified detergents',   ok: true },
      { label: 'Priority processing',        ok: false },
      { label: 'Express (add-on $1/lb)',     ok: false },
      { label: 'Dry cleaning credit',        ok: false },
    ],
  },
  { name: 'Standard', tagline: 'Best for families',        price: '$54', annual: '$43', popular: true,
    features: [
      { label: '30 lbs of laundry / month',  ok: true },
      { label: '2 pickups per week',          ok: true },
      { label: '24-48hr turnaround',          ok: true },
      { label: 'Free pickup & delivery',      ok: true },
      { label: 'Eco-certified detergents',    ok: true },
      { label: 'Priority processing',         ok: true },
      { label: 'Express included (2x/mo)',    ok: true },
      { label: 'Dry cleaning credit',         ok: false },
    ],
  },
  { name: 'Premium',  tagline: 'Unlimited for power users', price: '$99', annual: '$79', popular: false,
    features: [
      { label: 'Unlimited lbs / month',       ok: true },
      { label: 'Daily pickup available',       ok: true },
      { label: '24hr turnaround',             ok: true },
      { label: 'Free pickup & delivery',      ok: true },
      { label: 'Eco-certified detergents',    ok: true },
      { label: 'Priority processing',         ok: true },
      { label: 'Express always included',     ok: true },
      { label: '3 dry cleaning pieces/mo',    ok: true },
    ],
  },
]

export default function Pricing() {
  const [billing, setBilling] = useState('monthly')

  return (
    <div style={{ background: '#F7F7F7' }}>

      {/* Hero — dark */}
      <section style={{ paddingTop: 120, paddingBottom: 72, textAlign: 'center', background: '#111921', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0a3547 0%, #111921 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            Simple Pricing
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(2.5rem,5vw,4rem)', letterSpacing: '-0.022em', lineHeight: 1.1, color: '#ffffff', marginBottom: 16 }}
          >
            Pay for what you{' '}
            <em className="display-accent" style={{ display: 'inline' }}>need.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.0625rem', lineHeight: 1.75, fontFamily: 'Kodchasan, sans-serif' }}
          >
            No hidden fees, no surprises. Laundry priced by the pound, plans priced by the month.
          </motion.p>
        </div>
      </section>

      {/* Pay-as-you-go — light */}
      <section style={{ padding: '80px 0', background: '#F7F7F7' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <AnimatedContent style={{ marginBottom: 40 }}>
            <span className="eyebrow" style={{ color: '#4ECDA0' }}>Pay As You Go</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', letterSpacing: '-0.022em', color: '#09090B', marginBottom: 8 }}>
              Just need a <em className="display-accent" style={{ display: 'inline' }}>pickup?</em>
            </h2>
            <p style={{ color: '#52525B', maxWidth: '50ch', fontFamily: 'Kodchasan, sans-serif' }}>No subscription needed. Pay exactly for what you use. Prices confirmed before we begin.</p>
          </AnimatedContent>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="paygo-grid">
            {payAsYouGo.map((s, i) => (
              <AnimatedContent key={s.title} delay={i * 0.06}>
                <div style={{ background: pasteColors[i], borderRadius: 20, padding: '28px', position: 'relative', height: '100%' }}>
                  {s.badge && (
                    <span style={{ position: 'absolute', top: 20, right: 20, background: '#78EDB2', color: '#0a1a0f', fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 999, fontFamily: 'Kodchasan, sans-serif' }}>
                      {s.badge}
                    </span>
                  )}
                  <div style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <s.icon size={18} color="#111921" />
                  </div>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#09090B', marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</h3>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: s.price.startsWith('From') ? '1.375rem' : (s.price === 'Custom' ? '1.5rem' : '1.75rem'), letterSpacing: '-0.02em', color: '#111921', lineHeight: 1 }}>
                    {s.price}<span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#52525B', fontFamily: 'Kodchasan, sans-serif' }}>{s.unit}</span>
                  </p>
                  {s.min && <p style={{ color: '#71717A', fontSize: '0.8125rem', marginTop: 4, fontFamily: 'Kodchasan, sans-serif' }}>{s.min}</p>}
                  <p style={{ color: '#374151', fontSize: '0.875rem', marginTop: 8, lineHeight: 1.6, fontFamily: 'Kodchasan, sans-serif' }}>{s.desc}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>

          <AnimatedContent>
            <p style={{ color: '#71717A', fontSize: '0.875rem', marginTop: 24, textAlign: 'center', fontFamily: 'Kodchasan, sans-serif' }}>
              Free pickup and delivery on all orders $15+. We weigh at pickup and send you a price confirmation via SMS.
            </p>
          </AnimatedContent>
        </div>
      </section>

      {/* Monthly plans — dark */}
      <section style={{ padding: '80px 0', background: '#111921' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <AnimatedContent style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="eyebrow">Subscription Plans</span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', letterSpacing: '-0.022em', color: '#ffffff', marginBottom: 16 }}>
              Save with a <em className="display-accent" style={{ display: 'inline' }}>monthly plan.</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 28, fontFamily: 'Kodchasan, sans-serif' }}>Subscribe and save up to 20%. Pickup, wash, deliver, repeat.</p>

            {/* Billing toggle */}
            <div style={{ display: 'inline-flex', background: '#32373B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '4px', gap: '4px' }}>
              {['monthly', 'annual'].map(b => (
                <button key={b} onClick={() => setBilling(b)} style={{
                  padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: billing === b ? '#ffffff' : 'transparent',
                  color: billing === b ? '#111921' : 'rgba(255,255,255,0.5)',
                  fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem',
                  transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: 8,
                }}>
                  {b === 'monthly' ? 'Monthly' : 'Annual'}
                  {b === 'annual' && <span style={{ background: '#78EDB2', color: '#0a1a0f', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>Save 20%</span>}
                </button>
              ))}
            </div>
          </AnimatedContent>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="plans-grid">
            {plans.map((plan, i) => (
              <AnimatedContent key={plan.name} delay={i * 0.08}>
                <div style={{
                  background: plan.popular ? '#ffffff' : 'rgba(255,255,255,0.04)',
                  border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: '32px',
                  transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: plan.popular ? '0 20px 60px rgba(0,0,0,0.4)' : 'none',
                }}>
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(180deg,#C9F8DE,#78EDB2)', color: '#0a1a0f', fontSize: '0.65rem', fontWeight: 700, padding: '6px 16px', borderRadius: '0 0 10px 10px', letterSpacing: '0.08em', whiteSpace: 'nowrap', fontFamily: 'Kodchasan, sans-serif' }}>
                      MOST POPULAR
                    </div>
                  )}
                  <p style={{ fontFamily: 'Kodchasan, sans-serif', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.popular ? '#71717A' : 'rgba(255,255,255,0.4)', marginBottom: 4, marginTop: plan.popular ? 12 : 0 }}>{plan.name}</p>
                  <p style={{ color: plan.popular ? '#52525B' : 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: 16, fontFamily: 'Kodchasan, sans-serif' }}>{plan.tagline}</p>
                  <AnimatePresence mode="wait">
                    <motion.p key={billing + plan.name} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
                      style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '3rem', letterSpacing: '-0.025em', color: plan.popular ? '#09090B' : '#ffffff', lineHeight: 1, marginBottom: 24 }}>
                      {billing === 'annual' ? plan.annual : plan.price}<span style={{ fontSize: '1rem', fontWeight: 400, color: plan.popular ? '#52525B' : 'rgba(255,255,255,0.4)', fontFamily: 'Kodchasan, sans-serif' }}>/mo</span>
                    </motion.p>
                  </AnimatePresence>
                  <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plan.features.map(f => (
                      <li key={f.label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        {f.ok
                          ? <CheckCircle size={15} color="#78EDB2" style={{ flexShrink: 0, marginTop: 2 }} />
                          : <X size={15} color="#71717A" style={{ flexShrink: 0, marginTop: 2, opacity: 0.4 }} />
                        }
                        <span style={{ color: f.ok ? (plan.popular ? '#374151' : 'rgba(255,255,255,0.65)') : (plan.popular ? '#A1A1AA' : 'rgba(255,255,255,0.3)'), fontSize: '0.875rem', fontFamily: 'Kodchasan, sans-serif' }}>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/book" style={{
                    display: 'block', textAlign: 'center', padding: '12px', borderRadius: 120,
                    background: plan.popular ? 'linear-gradient(180deg,#C9F8DE,#78EDB2)' : 'transparent',
                    border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    color: plan.popular ? '#0a1a0f' : 'rgba(255,255,255,0.6)',
                    fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                    textDecoration: 'none', transition: 'all 0.2s ease',
                  }}>
                    Get started free
                  </Link>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — light */}
      <section style={{ padding: '80px 0', background: '#F7F7F7', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
          <AnimatedContent>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(1.5rem,3vw,2.25rem)', color: '#09090B', marginBottom: 12, letterSpacing: '-0.022em' }}>
              Still have <em className="display-accent" style={{ display: 'inline' }}>questions?</em>
            </h2>
            <p style={{ color: '#52525B', marginBottom: 28, fontFamily: 'Kodchasan, sans-serif' }}>All prices confirmed before we start. No surprises, no bills that shock you.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/faq" className="btn-ghost">Read FAQ</Link>
              <Link to="/book" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Start Free Pickup <ArrowRight size={14} />
              </Link>
            </div>
          </AnimatedContent>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) { .paygo-grid { grid-template-columns: repeat(2,1fr) !important; } .plans-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) { .paygo-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
