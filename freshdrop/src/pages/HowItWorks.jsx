import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Phone, Truck, Shirt, CheckCircle, ArrowRight } from 'lucide-react'
import AnimatedContent from '../components/reactbits/AnimatedContent'

const ease = [0.25, 0.4, 0.25, 1]

const steps = [
  { num: '01', icon: Phone,       title: 'Schedule Online',  desc: 'Book your pickup in under 2 minutes. Choose your service type, preferred date, and 2-hour time window. No account needed for your first order.', tags: ['60-Second Booking', 'Any Day'], color: '#E4F4FB' },
  { num: '02', icon: Truck,       title: 'We Collect',       desc: 'Our driver arrives in your chosen window. Contactless pickup — leave your bag outside and we\'ll grab it. We confirm via SMS when collected.', tags: ['Contactless', 'GPS Tracked'], color: '#D1F9E3' },
  { num: '03', icon: Shirt,       title: 'Expert Cleaning',  desc: 'Your laundry is weighed and you receive a price SMS before we begin. We wash, dry and fold using premium eco-certified detergents — separated by colour.', tags: ['Eco Detergents', 'Colour-sorted'], color: '#FDF1E1' },
  { num: '04', icon: CheckCircle, title: 'Fresh Delivery',   desc: 'Clean, folded clothes delivered back to your door within 24-48 hours. We send tracking updates at every stage. Job done.', tags: ['24hr Return', 'Insured'], color: '#EAEDf9' },
]

const faqs = [
  { q: 'What if I have fragile or delicate items?', a: 'Add a note at booking. We hand-process all delicates and follow care label instructions.' },
  { q: 'Do I need to sort my laundry first?', a: 'No need. We sort by colour and fabric type at our facility, using professional-grade equipment.' },
  { q: 'What if I miss the pickup?', a: 'No problem — simply reschedule from your confirmation SMS. No fees for rescheduling.' },
]

export default function HowItWorks() {
  const timelineRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start 0.7', 'end 0.3'] })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div style={{ background: '#F7F7F7' }}>

      {/* Hero — dark */}
      <section style={{ paddingTop: 120, paddingBottom: 72, textAlign: 'center', background: '#111921', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0a3547 0%, #111921 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>The Process</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(2.5rem,5vw,3.75rem)', letterSpacing: '-0.022em', lineHeight: 1.1, color: '#ffffff', marginBottom: 16 }}
          >
            Laundry made <em className="display-accent" style={{ display: 'inline' }}>effortless.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.0625rem', lineHeight: 1.75, fontFamily: 'Kodchasan, sans-serif' }}
          >
            Four simple steps — from scheduling to fresh delivery. Most customers are done in 30 seconds.
          </motion.p>
        </div>
      </section>

      {/* Timeline steps — light */}
      <section style={{ padding: '96px 0', background: '#F7F7F7' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', position: 'relative' }} ref={timelineRef}>

          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 44, top: 0, bottom: 0, width: 2, background: '#E4E4E7' }} className="hiw-line">
            <motion.div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(to bottom, #C9F8DE, #78EDB2)', height: lineHeight }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {steps.map((step, i) => (
              <AnimatedContent key={step.num} delay={i * 0.1}>
                <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: 24, alignItems: 'flex-start' }}>
                  {/* Dot */}
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FF6B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #F7F7F7', boxShadow: '0 0 0 2px #FF6B6B', flexShrink: 0 }}>
                      <step.icon size={16} color="#fff" />
                    </div>
                  </div>

                  {/* Card */}
                  <div style={{ background: step.color, borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                      <span className="step-pill">{`Step ${i + 1}`}</span>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '2.5rem', color: 'rgba(9,9,11,0.07)', letterSpacing: '-0.04em', lineHeight: 1 }}>{step.num}</span>
                    </div>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.2rem', color: '#09090B', marginBottom: 8, letterSpacing: '-0.01em' }}>{step.title}</h3>
                    <p style={{ color: '#374151', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: 16, fontFamily: 'Kodchasan, sans-serif' }}>{step.desc}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {step.tags.map(t => (
                        <span key={t} className="tag-outline-dark">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — dark */}
      <section style={{ padding: '64px 0', background: '#111921' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          <AnimatedContent style={{ marginBottom: 40, textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(1.75rem,3vw,2.25rem)', color: '#ffffff', marginBottom: 8, letterSpacing: '-0.022em' }}>
              Common <em className="display-accent" style={{ display: 'inline' }}>questions.</em>
            </h2>
          </AnimatedContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {faqs.map((f, i) => (
              <AnimatedContent key={i} delay={i * 0.06}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 24px' }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#ffffff', marginBottom: 8, fontSize: '0.9375rem' }}>{f.q}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem', lineHeight: 1.7, fontFamily: 'Kodchasan, sans-serif' }}>{f.a}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 0', background: '#F7F7F7', textAlign: 'center' }}>
        <AnimatedContent style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: '#09090B', marginBottom: 16, letterSpacing: '-0.022em' }}>
            Ready to try it <em className="display-accent" style={{ display: 'inline' }}>yourself?</em>
          </h2>
          <p style={{ color: '#52525B', marginBottom: 32, fontSize: '1.0625rem', fontFamily: 'Kodchasan, sans-serif' }}>First pickup is free. No commitment required.</p>
          <Link to="/book" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '1rem', padding: '14px 32px' }}>
            Schedule My First Pickup <ArrowRight size={16} />
          </Link>
        </AnimatedContent>
      </section>

      <style>{`
        @media (max-width: 640px) { .hiw-line { display: none !important; } }
      `}</style>
    </div>
  )
}
