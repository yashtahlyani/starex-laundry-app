import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shirt, Sparkles, Zap, Package, Star, Truck, CheckCircle, ArrowRight } from 'lucide-react'
import AnimatedContent from '../components/reactbits/AnimatedContent'

const ease = [0.25, 0.4, 0.25, 1]

const pasteColors = ['#E4F4FB', '#D1F9E3', '#FDF1E1', '#EAEDf9', '#E4F4FB', '#D1F9E3']

const services = [
  { icon: Shirt,    num: '01', title: 'Wash & Fold',      tagline: 'Everyday laundry, done right.',        price: 'From $2.50/lb',   min: 'Min. $15',  features: ['Sorted by colour and fabric', 'Dried at optimal temperature', 'Folded and returned neatly', '24-48hr turnaround', 'Free pickup & delivery'], featured: true },
  { icon: Zap,      num: '02', title: 'Express Same-Day', tagline: 'Same-day. No excuses.',                price: 'From $3.50/lb',   min: 'Min. $20',  features: ['Book before noon', 'Back by 6 PM same day', 'Full wash, dry and fold', 'SMS tracking updates', 'Priority processing'] },
  { icon: Sparkles, num: '03', title: 'Dry Cleaning',     tagline: 'Delicates deserve better.',            price: 'From $12.99/item',min: null,         features: ['Silks, wool, cashmere', 'Formal and evening wear', 'Spot treatment included', '48-72hr turnaround', 'Individual garment tracking'] },
  { icon: Package,  num: '04', title: 'Ironing & Press',  tagline: 'Crisp. Sharp. Professional.',          price: 'From $4.99/item', min: null,         features: ['Shirts, trousers, dresses', 'Suits and blazers', 'Steam-pressed to perfection', 'Hung or folded to order', '24hr turnaround'] },
  { icon: Star,     num: '05', title: 'Duvet & Bedding',  tagline: 'Big loads, no problem.',               price: '$24.99/item',     min: null,         features: ['Duvets, comforters, pillows', 'King and queen sizes', 'Eco wash and dry', 'Fluffed and bagged', '48hr turnaround'] },
  { icon: Truck,    num: '06', title: 'Commercial Linen', tagline: 'Scale your laundry operations.',       price: 'Custom quote',    min: null,         features: ['Hotels and B&Bs', 'Restaurants and cafes', 'Gyms and spas', 'Regular schedule available', 'Volume discounts'] },
]

export default function Services() {
  return (
    <div style={{ background: '#F7F7F7' }}>

      {/* Hero — dark */}
      <section style={{ paddingTop: 120, paddingBottom: 72, textAlign: 'center', background: '#111921', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0a3547 0%, #111921 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>What We Offer</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(2.5rem,5vw,3.75rem)', letterSpacing: '-0.022em', lineHeight: 1.1, color: '#ffffff', marginBottom: 16 }}
          >
            Every fabric,{' '}
            <em className="display-accent" style={{ display: 'inline' }}>every need.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.0625rem', lineHeight: 1.75, fontFamily: 'Kodchasan, sans-serif' }}
          >
            From everyday wash-and-fold to delicate dry cleaning — we handle it all with professional care.
          </motion.p>
        </div>
      </section>

      {/* Services grid */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} className="services-grid">
            {services.map((s, i) => (
              <AnimatedContent key={s.title} delay={i * 0.07}>
                <div style={{ background: pasteColors[i], borderRadius: 20, padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {s.featured && (
                    <span style={{ position: 'absolute', top: 20, right: 20, background: '#78EDB2', color: '#0a1a0f', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: 999, letterSpacing: '0.08em', fontFamily: 'Kodchasan, sans-serif' }}>POPULAR</span>
                  )}
                  <div style={{ fontSize: '2.5rem', fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'rgba(9,9,11,0.1)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 12 }}>{s.num}</div>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.2rem', color: '#09090B', marginBottom: 4, letterSpacing: '-0.01em' }}>{s.title}</h3>
                  <p style={{ color: '#52525B', fontSize: '0.9rem', marginBottom: 16, fontStyle: 'italic', fontFamily: 'Kodchasan, sans-serif' }}>{s.tagline}</p>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.375rem', color: '#111921', letterSpacing: '-0.02em', marginBottom: s.min ? 2 : 16 }}>{s.price}</p>
                  {s.min && <p style={{ color: '#71717A', fontSize: '0.8125rem', marginBottom: 16, fontFamily: 'Kodchasan, sans-serif' }}>{s.min}</p>}
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, flex: 1 }}>
                    {s.features.map(f => (
                      <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <CheckCircle size={14} color="#4ECDA0" style={{ flexShrink: 0, marginTop: 3 }} />
                        <span style={{ color: '#374151', fontSize: '0.875rem', fontFamily: 'Kodchasan, sans-serif' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0a3547', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', marginTop: 'auto' }}>
                    Book this service <ArrowRight size={14} />
                  </Link>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ background: '#111921', padding: '64px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
          <AnimatedContent>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: '#ffffff', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Not sure what you{' '}
              <em className="display-accent" style={{ display: 'inline' }}>need?</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, fontSize: '1.0625rem', fontFamily: 'Kodchasan, sans-serif' }}>
              Book a pickup and we'll assess your items at collection. No commitment required.
            </p>
            <Link to="/book" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '1rem', padding: '14px 32px' }}>
              Book Free Pickup <ArrowRight size={16} />
            </Link>
          </AnimatedContent>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .services-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
