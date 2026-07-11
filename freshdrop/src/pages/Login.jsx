import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Zap, Shield, Star } from 'lucide-react'
import { useToast } from '../components/ui/Toast'
import { login } from '../lib/store'
import { supabase } from '../lib/supabaseClient'

const ease = [0.25, 0.4, 0.25, 1]

const perks = [
  { icon: Zap, label: 'Real-time order tracking' },
  { icon: Shield, label: 'Secure & fully insured' },
  { icon: Star, label: 'Loved by 10,000+ Canadians' },
]


function FloatingInput({ label, type = 'text', value, onChange, placeholder, right }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#09090B', marginBottom: 6, letterSpacing: '0.02em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={e => { setFocused(true); e.target.style.borderColor = '#78EDB2'; e.target.style.boxShadow = '0 0 0 3px rgba(120,237,178,0.12)' }}
          onBlur={e => { setFocused(false); e.target.style.borderColor = '#E4E4E7'; e.target.style.boxShadow = 'none' }}
          style={{
            width: '100%', padding: right ? '13px 44px 13px 14px' : '13px 14px',
            border: '1.5px solid #E4E4E7', borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontSize: '0.9375rem', color: '#09090B',
            background: '#FAFAFA', outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />
        {right}
      </div>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('signin') // 'signin' | 'forgot' | 'sent'
  const [resetEmail, setResetEmail] = useState('')
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast('Please fill in all fields', 'error'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const res = await login(email, password)
    setLoading(false)
    if (!res.ok) { toast(res.error, 'error'); return }
    toast(`Welcome back, ${res.user.name.split(' ')[0]}!`, 'success')
    navigate(res.user.role === 'owner' ? '/admin' : '/dashboard')
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!resetEmail) { toast('Please enter your email', 'error'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: window.location.origin + '/reset-password',
    })
    setLoading(false)
    if (error) { toast(error.message, 'error'); return }
    setMode('sent')
  }

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
        <div style={{ position: 'absolute', top: '25%', left: '-10%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(120,237,178,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 240, height: 240, background: 'radial-gradient(circle, rgba(10,53,71,0.4) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.1rem', color: '#ffffff', letterSpacing: '-0.01em' }}>StareX</span>
        </Link>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease }}
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 'clamp(1.7rem, 2.5vw, 2.25rem)', color: '#ffffff', lineHeight: 1.2, letterSpacing: '-0.022em', marginBottom: 14 }}
          >
            Your laundry,<br />
            <em className="display-accent" style={{ display: 'inline' }}>perfectly clean.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5, ease }}
            style={{ color: '#71717A', fontSize: '0.9rem', lineHeight: 1.75, maxWidth: 300, marginBottom: 40 }}
          >
            Sign in to track orders, manage pickups, and keep your wardrobe fresh.
          </motion.p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {perks.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.45, ease }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(120,237,178,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} color="#78EDB2" />
                </div>
                <span style={{ color: '#A1A1AA', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{label}</span>
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

          {mode === 'signin' && (
            <>
              <Link to="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#71717A', textDecoration: 'none', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', marginBottom: 44, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#09090B'}
                onMouseLeave={e => e.currentTarget.style.color = '#71717A'}
              >
                <ArrowLeft size={14} /> Back to home
              </Link>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.5, ease }}
                style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '2rem', color: '#09090B', letterSpacing: '-0.022em', marginBottom: 6 }}>
                Welcome back.
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.45, ease }}
                style={{ color: '#71717A', fontSize: '0.9375rem', marginBottom: 36, fontFamily: 'Kodchasan, sans-serif' }}>
                Sign in to your StareX account.
              </motion.p>
              <form onSubmit={handleSubmit}>
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.42, ease }}>
                  <FloatingInput label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39, duration: 0.42, ease }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#09090B', letterSpacing: '0.02em' }}>Password</label>
                    <button type="button" onClick={() => { setResetEmail(email); setMode('forgot') }} style={{ fontSize: '0.8rem', color: '#78EDB2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500, padding: 0 }}>Forgot password?</button>
                  </div>
                  <div style={{ position: 'relative', marginBottom: 18 }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      onFocus={e => { e.target.style.borderColor = '#78EDB2'; e.target.style.boxShadow = '0 0 0 3px rgba(120,237,178,0.12)' }}
                      onBlur={e => { e.target.style.borderColor = '#E4E4E7'; e.target.style.boxShadow = 'none' }}
                      style={{ width: '100%', padding: '13px 44px 13px 14px', border: '1.5px solid #E4E4E7', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: '0.9375rem', color: '#09090B', background: '#FAFAFA', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A1A1AA', display: 'flex', padding: 4 }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46, duration: 0.42, ease }}>
                  <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
                    style={{ width: '100%', padding: '14px', background: loading ? '#52525B' : '#111921', color: '#ffffff', border: 'none', borderRadius: 120, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
                    {loading ? (<><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }} style={{ display: 'block', width: 15, height: 15, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%' }} />Signing in...</>) : <>Sign In <ArrowRight size={15} /></>}
                  </motion.button>
                </motion.div>
              </form>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.54 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#E4E4E7' }} />
                <span style={{ color: '#A1A1AA', fontSize: '0.8rem', fontFamily: 'Kodchasan, sans-serif', whiteSpace: 'nowrap' }}>new to StareX?</span>
                <div style={{ flex: 1, height: 1, background: '#E4E4E7' }} />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.58 }}>
                <Link to="/signup"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', border: '1.5px solid #E4E4E7', borderRadius: 10, color: '#09090B', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem', transition: 'border-color 0.2s, background 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#78EDB2'; e.currentTarget.style.background = '#F0FFF7' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4E4E7'; e.currentTarget.style.background = 'transparent' }}
                >
                  Create a free account <ArrowRight size={14} />
                </Link>
              </motion.div>
            </>
          )}

          {mode === 'forgot' && (
            <motion.div key="forgot" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <button onClick={() => setMode('signin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#71717A', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', marginBottom: 44, padding: 0 }}>
                <ArrowLeft size={14} /> Back to sign in
              </button>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '2rem', color: '#09090B', letterSpacing: '-0.022em', marginBottom: 6 }}>Reset password.</h1>
              <p style={{ color: '#71717A', fontSize: '0.9375rem', marginBottom: 36, fontFamily: 'Kodchasan, sans-serif' }}>
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleForgot}>
                <FloatingInput label="Email address" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="you@example.com" />
                <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
                  style={{ width: '100%', marginTop: 8, padding: '14px', background: loading ? '#52525B' : '#111921', color: '#ffffff', border: 'none', borderRadius: 120, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? 'Sending...' : <>Send reset link <ArrowRight size={15} /></>}
                </motion.button>
              </form>
            </motion.div>
          )}

          {mode === 'sent' && (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} style={{ textAlign: 'center', paddingTop: 60 }}>
              <div style={{ width: 64, height: 64, background: '#D1F9E3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <ArrowRight size={28} color="#4ECDA0" />
              </div>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.75rem', color: '#09090B', marginBottom: 10 }}>Check your email.</h2>
              <p style={{ color: '#52525B', fontFamily: 'Kodchasan, sans-serif', marginBottom: 28, lineHeight: 1.7 }}>
                We sent a password reset link to <strong style={{ color: '#09090B' }}>{resetEmail}</strong>. Click it to set a new password.
              </p>
              <button onClick={() => setMode('signin')} style={{ color: '#78EDB2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem' }}>
                Back to sign in
              </button>
            </motion.div>
          )}

        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 45fr"] { grid-template-columns: 1fr !important; }
          div[style*="background: #111921"][style*="padding: 48px 52px"] { display: none !important; }
        }
      `}</style>
    </div>
  )
}
