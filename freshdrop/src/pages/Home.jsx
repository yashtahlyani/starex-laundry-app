import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Star, Shield, Leaf, CheckCircle, Shirt, Sparkles, Zap, Package, Truck, Clock } from 'lucide-react'
import AnimatedContent from '../components/reactbits/AnimatedContent'

const ease = [0.25, 0.4, 0.25, 1]

const marqueeItems = [
  '★ 4.9 Rating', 'Free Pickup & Delivery', '24hr Turnaround', '10,000+ Customers',
  'Eco-Certified Detergents', 'Fully Insured', '98% On-Time', 'No Hidden Fees',
]

/* Animated counter */
function Counter({ target, suffix = '', fixed = false }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  useEffect(() => {
    if (!inView) return
    const dur = 1800
    const start = Date.now()
    const raf = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      const val = fixed ? parseFloat((target * e).toFixed(1)) : Math.floor(target * e)
      setCount(val)
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [inView, target, fixed])
  return <span ref={ref}>{fixed ? count.toFixed(1) : count.toLocaleString()}{suffix}</span>
}

const stats = [
  { value: 10000, suffix: '+', label: 'Happy Customers', desc: 'Across Toronto & GTA' },
  { value: 4.9,   suffix: '',  label: 'Average Rating',  desc: '★ Google & Yelp', fixed: true },
  { value: 98,    suffix: '%', label: 'On-Time Delivery', desc: 'Promised window kept' },
  { value: 24,    suffix: 'hr', label: 'Turnaround',     desc: 'Drop-off to doorstep' },
]

const pasteColors = ['#E4F4FB', '#D1F9E3', '#FDF1E1', '#EAEDf9', '#E4F4FB', '#D1F9E3']

const services = [
  { num: '01', title: 'Wash & Fold',     desc: 'Professional wash, dry and fold for everyday laundry. Sorted by colour, dried right, crisp.',    price: 'From $2.50/lb',  tags: ['Everyday', 'Colour-sorted'] },
  { num: '02', title: 'Dry Cleaning',    desc: 'Expert solvent care for delicates, formalwear and special garments — returned in fresh covers.',   price: 'From $12.99',    tags: ['Delicates', 'Formalwear'] },
  { num: '03', title: 'Express 24hr',    desc: 'Drop off by noon, back at your door by 6 PM the same day. No waiting, no worry.',                   price: 'From $3.50/lb',  tags: ['Same-day', 'Rush'] },
  { num: '04', title: 'Ironing & Press', desc: 'Crisp, boardroom-ready garments every single time. Steam-pressed and hung on arrival.',             price: 'From $4.99',     tags: ['Shirts', 'Suits'] },
  { num: '05', title: 'Free Pickup',     desc: 'Contactless collection right at your door — schedule once, skip the trip every week.',              price: 'Always free',    tags: ['Contactless', 'Scheduled'] },
  { num: '06', title: 'Monthly Plans',   desc: 'Save up to 20% with a recurring plan. Perfect for families, restaurants and busy professionals.',   price: 'From $24/mo',    tags: ['Save 20%', 'Subscribe'] },
]

const steps = [
  { label: 'Step 1', title: 'Schedule Pickup',  desc: 'Book online in 60 seconds. Choose your date, time window and service type. We remember your preferences.',           tags: ['60-Second Booking', 'Any Day'] },
  { label: 'Step 2', title: 'We Collect',        desc: 'Contactless pickup at your door — no need to be home. Sealed, labelled and logged the moment it leaves your hands.', tags: ['Contactless', 'GPS Tracked'] },
  { label: 'Step 3', title: 'Fresh Delivery',    desc: 'Clean, folded and returned within 24 hours — or ironed and hung. Ready to wear, zero stress.',                       tags: ['24hr Return', 'Insured'] },
]

const testimonials = [
  { name: 'Sarah M.',  role: 'Toronto, ON',      text: 'I switched from my local laundromat and honestly never going back. Quality is incredible for the price.',  stars: 5 },
  { name: 'James K.',  role: 'Mississauga, ON',  text: 'Pickup at 8am, back by 6pm. Shirts perfectly pressed. This is the kind of service you tell everyone about.', stars: 5 },
  { name: 'Priya R.',  role: 'Scarborough, ON',  text: 'My silk blouses came back better than new. They are incredibly careful with every single piece.',            stars: 5 },
  { name: 'David L.',  role: 'North York, ON',   text: 'We use StareX for our restaurant linens. Reliable, affordable, and always on time. Absolute lifesaver.',  stars: 5 },
]

const trust = [
  { title: 'Fully Insured',    desc: 'Every garment covered up to $500 against damage or loss.' },
  { title: 'Eco-Friendly',     desc: 'Biodegradable detergents. Low-water wash cycles.' },
  { title: '4.9★ Rated',       desc: 'Consistently top-rated across Google and Yelp.' },
  { title: 'Always On Time',   desc: '98% of deliveries arrive within the promised window.' },
]

export default function Home() {
  return (
    <div>

      {/* ══════════════════════════════════════════
          HERO — dark radial gradient, centered
      ══════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '80px',
        background: 'radial-gradient(208% 160% at 50% 0px, #111921 0%, #131a25 19%, #0a3547 41%, #1b8fc0 58%, #f0fae5 72%)',
      }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}
          >
            <span className="hero-badge">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#78EDB2', flexShrink: 0 }} />
              Canada's Premium Laundry Service
            </span>
          </motion.div>

          {/* Heading */}
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: '#ffffff',
            marginBottom: '28px',
          }}>
            {['Fresh laundry,', 'delivered to'].map((line, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1 + i * 0.1, ease }}
                style={{ display: 'block' }}
              >
                {line}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3, ease }}
              className="display-accent"
              style={{ display: 'block', fontWeight: 600, fontSize: '1.08em' }}
            >
              your door.
            </motion.span>
          </h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease }}
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1.0625rem',
              lineHeight: 1.75,
              maxWidth: '46ch',
              margin: '0 auto 40px',
              fontFamily: 'Kodchasan, Inter, sans-serif',
            }}
          >
            Schedule a pickup in 60 seconds. We wash, fold, and deliver — you relax.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease }}
            style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/book" className="btn-sky" style={{ fontSize: '1rem', padding: '14px 34px' }}>
              Schedule Free Pickup <ArrowRight size={16} />
            </Link>
            <Link to="/how-it-works" className="btn-ghost-dark">
              See How It Works
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75, ease }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '48px' }}
          >
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: '50%', marginLeft: i === 0 ? 0 : -8,
                  background: ['#4ECDC4','#45B7D1','#96CEB4','#88D8B0','#A8E6CF'][i],
                  border: '2px solid rgba(17,25,33,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, color: '#111921',
                  fontFamily: 'Kodchasan, sans-serif',
                }}>
                  {['SM','JK','PR','DL','AK'][i]}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#78EDB2" color="#78EDB2" />)}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 2, fontFamily: 'Kodchasan, sans-serif' }}>
                Loved by <strong style={{ color: '#78EDB2' }}>10,000+</strong> Canadians
              </p>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          MARQUEE TRUST STRIP
      ══════════════════════════════════════════ */}
      <div style={{ background: '#111921', padding: '14px 0', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', animation: 'marquee 28s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{
              fontFamily: 'Kodchasan, sans-serif',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              padding: '0 32px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {item}
              <span style={{ marginLeft: 32, color: '#78EDB2' }}>·</span>
            </span>
          ))}
        </div>
      </div>


      {/* ══════════════════════════════════════════
          STATS — dark, charcoal stat cards
      ══════════════════════════════════════════ */}
      <section style={{ background: '#111921', padding: '80px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }} className="stats-grid">
            {stats.map((s, i) => (
              <AnimatedContent key={s.label} delay={i * 0.08}>
                <div className="card-stat">
                  <p style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(2rem,3.5vw,2.8rem)',
                    letterSpacing: '-0.02em',
                    color: '#78EDB2',
                    lineHeight: 1,
                    marginBottom: '8px',
                  }}>
                    <Counter target={s.value} suffix={s.suffix} fixed={s.fixed} />
                  </p>
                  <p style={{ color: '#ffffff', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '4px' }}>{s.label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Kodchasan, sans-serif', fontSize: '0.8125rem' }}>{s.desc}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          HOW IT WORKS — light, timeline layout
      ══════════════════════════════════════════ */}
      <section style={{ padding: '96px 0', background: '#F7F7F7' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          <AnimatedContent style={{ marginBottom: '72px' }}>
            <span className="eyebrow" style={{ color: '#0a3547' }}>How It Works</span>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 600,
              fontSize: 'clamp(1.875rem,4vw,2.75rem)', letterSpacing: '-0.022em',
              color: '#09090B', maxWidth: '18ch',
            }}>
              Three steps to{' '}
              <span className="display-accent" style={{ fontWeight: 600 }}>clean.</span>
            </h2>
          </AnimatedContent>

          {/* Vertical timeline */}
          <div style={{ position: 'relative', paddingLeft: '48px' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: '9px', top: '16px', bottom: '16px',
              width: '2px', background: 'rgba(17,25,33,0.1)', borderRadius: 2,
            }} />

            {steps.map((step, i) => (
              <AnimatedContent key={step.label} delay={i * 0.1}>
                <div style={{ position: 'relative', marginBottom: i < steps.length - 1 ? '64px' : 0 }}>
                  {/* Orange dot */}
                  <div style={{
                    position: 'absolute', left: '-43px', top: '6px',
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#FF6B6B', flexShrink: 0,
                    boxShadow: '0 0 0 3px #F7F7F7, 0 0 0 5px rgba(255,107,107,0.25)',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span className="step-pill">{step.label}</span>
                  </div>

                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif', fontWeight: 600,
                    fontSize: '1.375rem', letterSpacing: '-0.015em',
                    color: '#09090B', marginBottom: '10px',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ color: '#52525B', fontSize: '1rem', lineHeight: 1.75, maxWidth: '55ch', marginBottom: '16px', fontFamily: 'Kodchasan, sans-serif' }}>
                    {step.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {step.tags.map(tag => (
                      <span key={tag} className="tag-outline-dark">{tag}</span>
                    ))}
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          SERVICES — white, pastel color-coded cards
      ══════════════════════════════════════════ */}
      <section style={{ padding: '96px 0', background: '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          <AnimatedContent style={{ marginBottom: '56px' }}>
            <span className="eyebrow" style={{ color: '#0a3547' }}>What We Offer</span>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 600,
              fontSize: 'clamp(1.875rem,4vw,2.75rem)', letterSpacing: '-0.022em', color: '#09090B',
            }}>
              Services built for{' '}
              <span className="display-accent" style={{ fontWeight: 600 }}>your life.</span>
            </h2>
          </AnimatedContent>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }} className="services-grid">
            {services.map((s, i) => (
              <AnimatedContent key={s.title} delay={i * 0.06}>
                <div style={{
                  background: pasteColors[i % pasteColors.length],
                  borderRadius: '20px',
                  padding: '32px 28px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <p style={{
                    fontFamily: 'Poppins, sans-serif', fontWeight: 600,
                    fontSize: '2rem', letterSpacing: '-0.03em', color: 'rgba(17,25,33,0.18)',
                    lineHeight: 1, marginBottom: '28px',
                  }}>
                    {s.num}
                  </p>
                  <div style={{ height: '1px', background: 'rgba(17,25,33,0.1)', marginBottom: '20px' }} />
                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif', fontWeight: 600,
                    fontSize: '1.125rem', letterSpacing: '-0.01em',
                    color: '#09090B', marginBottom: '10px',
                  }}>
                    {s.title}
                  </h3>
                  <p style={{ color: 'rgba(17,25,33,0.65)', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: 'Kodchasan, sans-serif', flexGrow: 1, marginBottom: '20px' }}>
                    {s.desc}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9375rem', color: '#0a3547' }}>{s.price}</p>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>

          <AnimatedContent style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/services" className="btn-ghost">
              View all services <ArrowRight size={14} />
            </Link>
          </AnimatedContent>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          PRICING PREVIEW — dark
      ══════════════════════════════════════════ */}
      <section style={{ background: '#111921', padding: '96px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          <AnimatedContent style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="eyebrow">Simple Pricing</span>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 600,
              fontSize: 'clamp(1.875rem,4vw,2.75rem)', letterSpacing: '-0.022em',
              color: '#FAFAFA', marginBottom: '12px',
            }}>
              Pricing that{' '}
              <span className="display-accent" style={{ fontWeight: 600 }}>works for you.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.0625rem', maxWidth: '50ch', margin: '0 auto', fontFamily: 'Kodchasan, sans-serif' }}>
              Pay per pound, or save with a monthly plan. No hidden fees, ever.
            </p>
          </AnimatedContent>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }} className="pricing-preview-grid">
            {[
              { name: 'Basic',    price: '$24',  period: '/mo', desc: 'Perfect for individuals',   features: ['10 lbs/month', '1 pickup/week', 'Free delivery'],         popular: false },
              { name: 'Standard', price: '$54',  period: '/mo', desc: 'Best for families',         features: ['30 lbs/month', '2 pickups/week', 'Priority service'],     popular: true  },
              { name: 'Premium',  price: '$99',  period: '/mo', desc: 'Unlimited for power users', features: ['Unlimited lbs', 'Daily pickup', '24hr turnaround'],       popular: false },
            ].map((plan, i) => (
              <AnimatedContent key={plan.name} delay={i * 0.08}>
                <div style={{
                  background: plan.popular ? '#ffffff' : 'rgba(255,255,255,0.04)',
                  border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  padding: '32px',
                  transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
                  position: 'relative',
                  boxShadow: plan.popular ? '0 24px 64px rgba(0,0,0,0.35)' : 'none',
                }}>
                  {plan.popular && (
                    <div style={{
                      position: 'absolute', top: 20, right: 20,
                      background: 'linear-gradient(180deg,#C9F8DE,#78EDB2)',
                      color: '#0a1a0f',
                      fontSize: '0.7rem', fontWeight: 700,
                      padding: '4px 12px', borderRadius: 999,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      fontFamily: 'Kodchasan, sans-serif',
                    }}>
                      Popular
                    </div>
                  )}
                  <p style={{ fontFamily: 'Kodchasan, sans-serif', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.popular ? 'rgba(17,25,33,0.45)' : 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>{plan.name}</p>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '2.75rem', letterSpacing: '-0.03em', color: plan.popular ? '#09090B' : '#FAFAFA', lineHeight: 1 }}>
                    {plan.price}<span style={{ fontSize: '1rem', fontWeight: 400 }}>{plan.period}</span>
                  </p>
                  <p style={{ color: plan.popular ? 'rgba(17,25,33,0.55)' : 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: '8px 0 24px', fontFamily: 'Kodchasan, sans-serif' }}>{plan.desc}</p>
                  <ul style={{ listStyle: 'none', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <CheckCircle size={15} color="#78EDB2" strokeWidth={2.5} />
                        <span style={{ color: plan.popular ? 'rgba(17,25,33,0.7)' : 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontFamily: 'Kodchasan, sans-serif' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/pricing" style={{
                    display: 'block', textAlign: 'center',
                    padding: '12px', borderRadius: '120px',
                    background: plan.popular ? 'linear-gradient(180deg,#C9F8DE,#78EDB2)' : 'transparent',
                    border: plan.popular ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
                    color: plan.popular ? '#0a1a0f' : 'rgba(255,255,255,0.6)',
                    fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem',
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


      {/* ══════════════════════════════════════════
          TESTIMONIALS — light
      ══════════════════════════════════════════ */}
      <section style={{ padding: '96px 0', background: '#F7F7F7' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          <AnimatedContent style={{ marginBottom: '48px' }}>
            <span className="eyebrow" style={{ color: '#0a3547' }}>What People Say</span>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 600,
              fontSize: 'clamp(1.875rem,4vw,2.75rem)', letterSpacing: '-0.022em', color: '#09090B',
            }}>
              Thousands of happy{' '}
              <span className="display-accent" style={{ fontWeight: 600 }}>customers.</span>
            </h2>
          </AnimatedContent>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }} className="testimonials-grid">
            {testimonials.map((t, i) => (
              <AnimatedContent key={t.name} delay={i * 0.06}>
                <div className="card" style={{ padding: '28px 32px', height: '100%' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: '16px' }}>
                    {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} fill="#78EDB2" color="#78EDB2" />)}
                  </div>
                  <p style={{ color: '#374151', fontSize: '1rem', lineHeight: 1.75, marginBottom: '24px', fontFamily: 'Kodchasan, sans-serif', fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                  <div style={{ borderTop: '1px solid rgba(17,25,33,0.06)', paddingTop: '16px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9375rem', color: '#09090B' }}>{t.name}</p>
                    <p style={{ color: 'rgba(17,25,33,0.4)', fontSize: '0.8125rem', fontFamily: 'Kodchasan, sans-serif' }}>{t.role}</p>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          TRUST BADGES — dark strip
      ══════════════════════════════════════════ */}
      <section style={{ background: '#111921', padding: '64px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '32px' }} className="trust-grid">
            {trust.map((t, i) => (
              <AnimatedContent key={t.title} delay={i * 0.07}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontFamily: 'Poppins, sans-serif', fontWeight: 600,
                    fontSize: '1rem', color: '#ffffff', marginBottom: '8px',
                  }}>
                    {t.title}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', lineHeight: 1.65, fontFamily: 'Kodchasan, sans-serif' }}>{t.desc}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          CTA BANNER — dark radial gradient
      ══════════════════════════════════════════ */}
      <section style={{
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(150% 160% at 50% 100%, #111921 0%, #0a3547 55%, #1b8fc0 85%, #f0fae5 100%)',
      }}>
        {/* Ghost watermark */}
        <div style={{
          position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '160px',
          color: 'rgba(240,250,229,0.06)', letterSpacing: '-8px', whiteSpace: 'nowrap',
          lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>
          StareX
        </div>

        <AnimatedContent style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center', padding: '0 24px', position: 'relative' }}>
          <span className="eyebrow">Get Started Today</span>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 500,
            fontSize: 'clamp(1.875rem,4vw,2.75rem)', letterSpacing: '-0.022em',
            color: '#ffffff', marginBottom: '16px',
          }}>
            Ready for{' '}
            <span className="display-accent" style={{ fontWeight: 600 }}>fresh clothes?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.0625rem', marginBottom: '40px', fontFamily: 'Kodchasan, sans-serif' }}>
            First pickup is on us. No minimums, no commitment.
          </p>
          <Link to="/book" className="btn-sky" style={{ fontSize: '1rem', padding: '15px 36px' }}>
            Schedule Free Pickup <ArrowRight size={16} />
          </Link>
        </AnimatedContent>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .stats-grid           { grid-template-columns: repeat(2,1fr) !important; }
          .services-grid        { grid-template-columns: 1fr !important; }
          .pricing-preview-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid    { grid-template-columns: 1fr !important; }
          .trust-grid           { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .trust-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
