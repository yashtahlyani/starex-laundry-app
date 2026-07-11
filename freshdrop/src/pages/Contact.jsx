import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react'
import AnimatedContent from '../components/reactbits/AnimatedContent'
import { supabase } from '../lib/supabaseClient'

const ease = [0.25, 0.4, 0.25, 1]

const infos = [
  { icon: Phone,  label: 'Phone',        value: '(416) 555-1234',      desc: 'Mon–Sat 8am – 8pm', color: '#E4F4FB' },
  { icon: Mail,   label: 'Email',        value: 'hello@starex.ca',  desc: 'We reply within 2 hours', color: '#D1F9E3' },
  { icon: MapPin, label: 'Service Area', value: 'Greater Toronto Area', desc: 'Toronto, Mississauga, North York, Brampton', color: '#FDF1E1' },
  { icon: Clock,  label: 'Pickup Hours', value: '7am – 9pm',           desc: '7 days a week', color: '#EAEDf9' },
]

const inputStyle = {
  width: '100%', padding: '13px 16px',
  border: '1.5px solid #E4E4E7', borderRadius: 12,
  fontSize: '0.9375rem', color: '#09090B',
  fontFamily: 'Kodchasan, sans-serif', outline: 'none',
  background: '#ffffff', transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    try {
      if (supabase) {
        const { error } = await supabase.from('contact_submissions').insert({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        })
        if (error) console.error('contact_submissions insert:', error.message)
      }
    } catch (err) {
      console.error('contact submit:', err)
    }
    setStatus('success')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div style={{ background: '#F7F7F7' }}>

      {/* Hero — dark */}
      <section style={{ paddingTop: 120, paddingBottom: 72, textAlign: 'center', background: '#111921', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0a3547 0%, #111921 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>Contact</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(2.5rem,5vw,3.75rem)', letterSpacing: '-0.022em', lineHeight: 1.1, color: '#ffffff', marginBottom: 16 }}
          >
            Get in <em className="display-accent" style={{ display: 'inline' }}>touch.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.22 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.0625rem', lineHeight: 1.75, fontFamily: 'Kodchasan, sans-serif' }}
          >
            Questions, feedback, or partnership inquiries. We reply within 2 hours during business hours.
          </motion.p>
        </div>
      </section>

      {/* Form + info */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }} className="contact-layout">

          {/* Form */}
          <AnimatedContent>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <div style={{ width: 64, height: 64, background: '#D1F9E3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={32} color="#4ECDA0" />
                </div>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.75rem', color: '#09090B', marginBottom: 12, letterSpacing: '-0.02em' }}>Message sent!</h2>
                <p style={{ color: '#52525B', fontFamily: 'Kodchasan, sans-serif' }}>We'll get back to you within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#09090B', marginBottom: 8, letterSpacing: '-0.02em' }}>Send us a message</h2>
                {[
                  { key: 'name',    label: 'Full name',      type: 'text',  placeholder: 'Jane Smith' },
                  { key: 'email',   label: 'Email address',  type: 'email', placeholder: 'jane@example.com' },
                  { key: 'subject', label: 'Subject',        type: 'text',  placeholder: 'How can we help?' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#09090B', marginBottom: 6 }}>{label}</label>
                    <input
                      type={type} required
                      value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#78EDB2'}
                      onBlur={e => e.target.style.borderColor = '#E4E4E7'}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#09090B', marginBottom: 6 }}>Message</label>
                  <textarea
                    required rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us how we can help..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = '#78EDB2'}
                    onBlur={e => e.target.style.borderColor = '#E4E4E7'}
                  />
                </div>
                <motion.button
                  type="submit" className="btn-primary"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  disabled={status === 'loading'}
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: status === 'loading' ? 0.7 : 1 }}
                >
                  {status === 'loading' ? 'Sending…' : <><ArrowRight size={14} /> Send Message</>}
                </motion.button>
              </form>
            )}
          </AnimatedContent>

          {/* Info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {infos.map((info, i) => (
              <AnimatedContent key={info.label} delay={i * 0.07}>
                <div style={{ background: info.color, borderRadius: 20, padding: '24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <info.icon size={18} color="#111921" />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Kodchasan, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 4 }}>{info.label}</p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#09090B', marginBottom: 2 }}>{info.value}</p>
                    <p style={{ color: '#52525B', fontSize: '0.875rem', fontFamily: 'Kodchasan, sans-serif' }}>{info.desc}</p>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>

        </div>
      </section>

      <style>{`
        @media (max-width: 768px) { .contact-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
