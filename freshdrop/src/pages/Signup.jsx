import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { useToast } from '../components/ui/Toast'
import { signup } from '../lib/store'

const ease = [0.25, 0.4, 0.25, 1]

const benefits = [
  'Free pickup on every order over $15',
  '24-hour standard turnaround',
  'Real-time SMS + app tracking',
  'No hidden fees, ever',
]

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validEmail = v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim())

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast('Please fill in all fields', 'error'); return }
    if (!validEmail(form.email)) { toast('Enter a valid email (e.g. name@domain.com)', 'error'); return }
    if (form.password.length < 6) { toast('Password must be at least 6 characters', 'error'); return }
    if (!agreed) { toast('Please agree to the terms', 'error'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const res = await signup({ name: form.name, email: form.email, password: form.password })
    setLoading(false)
    if (!res.ok) { toast(res.error, 'error'); return }
    // If the project requires email confirmation, there's no session yet.
    if (!res.user) { toast('Account created! Check your email to confirm, then sign in.', 'success'); navigate('/login'); return }
    toast('Account created — welcome!', 'success')
    navigate('/dashboard')
  }

  const inputStyle = {
    width: '100%', padding: '13px 14px',
    border: '1.5px solid #E4E4E7', borderRadius: 10,
    fontFamily: 'Kodchasan, sans-serif', fontSize: '0.9375rem', color: '#09090B',
    background: '#FAFAFA', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const labelStyle = { display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#09090B', marginBottom: 6, letterSpacing: '0.02em' }
  const onFocus = e => { e.target.style.borderColor = '#78EDB2'; e.target.style.boxShadow = '0 0 0 3px rgba(120,237,178,0.12)' }
  const onBlur = e => { e.target.style.borderColor = '#E4E4E7'; e.target.style.boxShadow = 'none' }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '45fr 55fr' }}>

      {/* LEFT — dark brand panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        style={{
          background: '#111921', padding: '48px 52px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '20%', right: '-15%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(120,237,178,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '-5%', width: 260, height: 260, background: 'radial-gradient(circle, rgba(10,53,71,0.4) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.1rem', color: '#ffffff', letterSpacing: '-0.01em' }}>StareX</span>
        </Link>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease }}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(1.7rem, 2.5vw, 2.25rem)', color: '#ffffff', lineHeight: 1.2, letterSpacing: '-0.022em', marginBottom: 14 }}
          >
            Join 10,000+<br />
            <em className="display-accent" style={{ display: 'inline' }}>happy customers.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5, ease }}
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.75, maxWidth: 300, marginBottom: 36, fontFamily: 'Kodchasan, sans-serif' }}
          >
            Create your free account and get your first pickup scheduled in under 60 seconds.
          </motion.p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {benefits.map((b, i) => (
              <motion.div
                key={b}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.45, ease }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <CheckCircle size={14} color="#78EDB2" style={{ flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', fontFamily: 'Kodchasan, sans-serif' }}>{b}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p style={{ color: '#3F3F46', fontSize: '0.75rem', fontFamily: 'Kodchasan, sans-serif' }}>© {new Date().getFullYear()} StareX Inc. — Canada's Premium Laundry</p>
      </motion.div>

      {/* RIGHT — form */}
      <motion.div
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease }}
        style={{ background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 60px' }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#71717A', textDecoration: 'none', fontSize: '0.85rem', fontFamily: 'Kodchasan, sans-serif', marginBottom: 44, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#09090B'}
            onMouseLeave={e => e.currentTarget.style.color = '#71717A'}
          >
            <ArrowLeft size={14} /> Already have an account? Sign in
          </Link>

          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.5, ease }}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '2rem', color: '#09090B', letterSpacing: '-0.022em', marginBottom: 6 }}>
            Create account.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.45, ease }}
            style={{ color: '#71717A', fontSize: '0.9375rem', marginBottom: 32, fontFamily: 'Kodchasan, sans-serif' }}>
            Free to join — no credit card required.
          </motion.p>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'Full name', type: 'text', placeholder: 'Jane Doe' },
              { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
            ].map(({ key, label, type, placeholder }, i) => (
              <motion.div key={key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 + i * 0.07, duration: 0.42, ease }}
                style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{label}</label>
                <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                  onFocus={onFocus} onBlur={onBlur} style={inputStyle} />
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46, duration: 0.42, ease }}
              style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 characters"
                  onFocus={onFocus} onBlur={onBlur} style={{ ...inputStyle, padding: '13px 44px 13px 14px' }} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A1A1AA', display: 'flex', padding: 4 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.42, ease }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24 }}>
              <div
                onClick={() => setAgreed(a => !a)}
                style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, cursor: 'pointer',
                  border: agreed ? 'none' : '1.5px solid #D4D4D8',
                  background: agreed ? '#78EDB2' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s, border 0.15s',
                }}
              >
                {agreed && <CheckCircle size={12} color="#0a3547" />}
              </div>
              <span style={{ color: '#71717A', fontSize: '0.825rem', fontFamily: 'Kodchasan, sans-serif', lineHeight: 1.6 }}>
                I agree to StareX's{' '}
                <Link to="/terms" style={{ color: '#4ECDA0', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" style={{ color: '#4ECDA0', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</Link>
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58, duration: 0.42, ease }}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#52525B' : 'linear-gradient(135deg, #C9F8DE, #78EDB2)', color: '#0a3547',
                  border: 'none', borderRadius: 120, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9375rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(120,237,178,0.3)',
                }}
              >
                {loading ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'block', width: 15, height: 15, border: '2px solid rgba(10,53,71,0.25)', borderTopColor: '#0a3547', borderRadius: '50%' }} />
                    Creating account...
                  </>
                ) : <>Get started free <ArrowRight size={15} /></>}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 45fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
