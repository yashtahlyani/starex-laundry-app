import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, ArrowRight } from 'lucide-react'
import AnimatedContent from '../components/reactbits/AnimatedContent'

const ease = [0.25, 0.4, 0.25, 1]

const categories = [
  { id: 'start', label: 'Getting Started', count: 5, faqs: [
    { q: 'How do I book my first pickup?', a: 'Visit our Book Now page and select your service, pickup date, and time window. The whole process takes under 2 minutes. We send a confirmation SMS and reminder 1 hour before arrival.' },
    { q: 'Is there a minimum order?', a: 'For Wash & Fold and Express services, the minimum is $15 (approximately 6 lbs). Dry cleaning has no minimum — we accept single items.' },
    { q: 'What areas do you serve?', a: 'We currently serve Toronto, Mississauga, Scarborough, North York, Etobicoke, and Brampton. We are expanding to the rest of the GTA in 2025. Enter your postal code on the booking page to confirm coverage.' },
    { q: 'Do I need to be home for pickup?', a: 'No! Simply leave your laundry bag outside your door, in your building lobby, or with a concierge. We have a secure contactless collection process and will notify you when we have picked up.' },
    { q: 'What bag should I use?', a: 'Any laundry bag or plastic bag works. If you are a subscriber, we provide branded StareX bags at your first pickup.' },
  ]},
  { id: 'pricing', label: 'Pricing & Plans', count: 5, faqs: [
    { q: 'How is the price calculated?', a: 'Wash & Fold and Express are priced by weight. We weigh your laundry at pickup and send you a price confirmation via SMS before processing. Dry cleaning and ironing are priced per item.' },
    { q: 'Are there any hidden fees?', a: 'No. The price you see is the price you pay. Pickup and delivery are free on all orders over $15. We never add surprise charges.' },
    { q: 'Can I cancel my subscription?', a: 'Yes, anytime. No cancellation fees, no minimum commitment. Just give us 48 hours notice and your subscription stops at the end of the current billing period.' },
    { q: 'Do you offer corporate accounts?', a: 'Yes! We have special commercial rates for businesses, hotels, restaurants and salons. Contact us for a custom quote.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and e-Transfer for corporate accounts.' },
  ]},
  { id: 'care', label: 'Laundry Care', count: 5, faqs: [
    { q: 'What detergents do you use?', a: 'We use biodegradable, eco-certified detergents that are gentle on skin and fabrics. If you have specific detergent preferences or allergies, leave a note in your booking.' },
    { q: 'What if something gets damaged?', a: 'All garments are covered up to $500 per item. If damage occurs, we will contact you immediately and process a claim within 48 hours.' },
    { q: 'Do you handle delicates and silks?', a: 'Yes. Our dry cleaning service specialises in delicate fabrics including silk, cashmere, lace and embroidered garments. These are always hand-processed.' },
    { q: 'Can I request specific wash instructions?', a: 'Absolutely. Add special instructions to each item in the booking notes. Our team reads every note and follows garment care labels.' },
    { q: 'Do you treat stains?', a: 'Yes, stain treatment is included at no extra cost with all services. We will flag any stains that cannot be fully removed before returning your items.' },
  ]},
  { id: 'delivery', label: 'Pickup & Delivery', count: 5, faqs: [
    { q: 'How fast is turnaround?', a: 'Standard Wash & Fold is 24-48 hours. Express service is same-day if booked before noon. Dry cleaning takes 48-72 hours.' },
    { q: 'What are your pickup hours?', a: 'We pick up 7 days a week, 7am to 9pm. You choose your preferred 2-hour window at booking.' },
    { q: 'What if I miss my delivery?', a: 'We will attempt redelivery once at no charge. If that fails, we will hold your laundry for 7 days. Contact us to reschedule anytime.' },
    { q: 'Can I track my order?', a: 'Yes. You will receive SMS updates at each stage: pickup confirmed, washing, folding, out for delivery, delivered.' },
    { q: 'Do you deliver to apartments?', a: 'Yes. Add your unit number, buzzer code, or delivery instructions in the booking notes. We deliver to any accessible location.' },
  ]},
  { id: 'trust', label: 'Safety & Trust', count: 4, faqs: [
    { q: 'How are my clothes kept separate from others?', a: 'Each order is tagged with a unique barcode at pickup and processed in dedicated bags throughout the entire wash-fold-deliver cycle. Your laundry never mixes with other orders.' },
    { q: 'Are your drivers and staff background-checked?', a: 'Yes. All StareX team members undergo criminal background checks before joining. Drivers are also verified through our fleet management system.' },
    { q: 'Is my payment information secure?', a: 'All payments are processed through Stripe with industry-standard encryption. We never store card numbers on our servers.' },
    { q: 'Do you have a satisfaction guarantee?', a: 'Absolutely. If you are not 100% satisfied, we will rewash your items for free. No questions asked.' },
  ]},
]

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #E4E4E7' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', textAlign: 'left', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', gap: 16 }}
        aria-expanded={open}
      >
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9875rem', color: '#09090B', lineHeight: 1.4 }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={18} color="#71717A" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ color: '#52525B', fontSize: '0.9375rem', lineHeight: 1.75, paddingBottom: 20, fontFamily: 'Kodchasan, sans-serif' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('start')
  const [search, setSearch] = useState('')

  const currentCat = categories.find(c => c.id === activeCategory)
  const filtered = search
    ? categories.flatMap(c => c.faqs).filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : currentCat.faqs

  return (
    <div style={{ background: '#F7F7F7' }}>

      {/* Hero — dark */}
      <section style={{ paddingTop: 120, paddingBottom: 72, textAlign: 'center', background: '#111921', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0a3547 0%, #111921 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>FAQ</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(2.5rem,5vw,3.75rem)', letterSpacing: '-0.022em', lineHeight: 1.1, color: '#ffffff', marginBottom: 20 }}
          >
            Got <em className="display-accent" style={{ display: 'inline' }}>questions?</em>
          </motion.h1>
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}
          >
            <Search size={18} color="rgba(255,255,255,0.35)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              style={{
                width: '100%', padding: '14px 16px 14px 46px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, fontSize: '0.9375rem', color: '#ffffff',
                fontFamily: 'Kodchasan, sans-serif', outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#78EDB2'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '64px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: search ? '1fr' : '240px 1fr', gap: 64 }} className="faq-layout">

          {/* Sidebar */}
          {!search && (
            <div>
              <p style={{ fontFamily: 'Kodchasan, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 16 }}>CATEGORIES</p>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {categories.map(c => (
                  <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: activeCategory === c.id ? '#D1F9E3' : 'transparent',
                    color: activeCategory === c.id ? '#0a3547' : '#52525B',
                    fontFamily: 'Kodchasan, sans-serif', fontWeight: activeCategory === c.id ? 700 : 500,
                    fontSize: '0.9rem', textAlign: 'left', transition: 'all 0.15s ease',
                  }}>
                    {c.label}
                    <span style={{ fontSize: '0.75rem', background: activeCategory === c.id ? '#78EDB2' : '#E4E4E7', color: activeCategory === c.id ? '#0a1a0f' : '#71717A', borderRadius: 999, padding: '2px 7px', fontWeight: 700 }}>{c.count}</span>
                  </button>
                ))}
              </nav>
              <div style={{ marginTop: 32, background: '#D1F9E3', borderRadius: 16, padding: '20px' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9375rem', color: '#09090B', marginBottom: 6, letterSpacing: '-0.01em' }}>Still have questions?</p>
                <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 16, fontFamily: 'Kodchasan, sans-serif' }}>We reply within 2 hours during business hours.</p>
                <Link to="/contact" className="btn-primary" style={{ fontSize: '0.875rem', padding: '10px 18px' }}>Contact us</Link>
              </div>
            </div>
          )}

          {/* FAQs */}
          <div>
            {search && <p style={{ color: '#71717A', fontSize: '0.875rem', marginBottom: 24, fontFamily: 'Kodchasan, sans-serif' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</p>}
            {!search && <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#09090B', marginBottom: 8, letterSpacing: '-0.02em' }}>{currentCat.label}</h2>}
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '0 24px' }}>
              {filtered.map((f, i) => <AccordionItem key={i} q={f.q} a={f.a} />)}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                  <p style={{ color: '#52525B', fontSize: '1rem', fontFamily: 'Kodchasan, sans-serif' }}>No results found. Try a different search term.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) { .faq-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
