import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/ui/Toast'

const ease = [0.25, 0.4, 0.25, 1]

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  // Supabase puts the session tokens in the URL hash; the client picks them up automatically
  useEffect(() => {
    supabase?.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // session is now valid; user can update their password
      }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return }
    if (password !== confirm) { toast('Passwords do not match', 'error'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { toast(error.message, 'error'); return }
    setDone(true)
    setTimeout(() => navigate('/login'), 2500)
  }

  const inputStyle = {
    width: '100%', padding: '13px 44px 13px 14px',
    border: '1.5px solid #E4E4E7', borderRadius: 10,
    fontFamily: 'Inter, sans-serif', fontSize: '0.9375rem', color: '#09090B',
    background: '#FAFAFA', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}
        style={{ background: '#fff', borderRadius: 20, padding: '48px 44px', width: '100%', maxWidth: 420, boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: '#D1F9E3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={32} color="#4ECDA0" />
            </div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.6rem', color: '#09090B', marginBottom: 8 }}>Password updated!</h2>
            <p style={{ color: '#71717A', fontFamily: 'Kodchasan, sans-serif' }}>Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#111921' }}>StareX</span>
            </div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.8rem', color: '#09090B', letterSpacing: '-0.022em', marginBottom: 8 }}>Set new password.</h1>
            <p style={{ color: '#71717A', fontFamily: 'Kodchasan, sans-serif', marginBottom: 32 }}>Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#09090B', marginBottom: 6 }}>New password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                    onFocus={e => { e.target.style.borderColor = '#78EDB2'; e.target.style.boxShadow = '0 0 0 3px rgba(120,237,178,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = '#E4E4E7'; e.target.style.boxShadow = 'none' }}
                    style={inputStyle} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A1A1AA', display: 'flex', padding: 4 }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#09090B', marginBottom: 6 }}>Confirm password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                  onFocus={e => { e.target.style.borderColor = '#78EDB2'; e.target.style.boxShadow = '0 0 0 3px rgba(120,237,178,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = '#E4E4E7'; e.target.style.boxShadow = 'none' }}
                  style={{ ...inputStyle, padding: '13px 14px' }} />
              </div>
              <motion.button type="submit" disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
                style={{ padding: '14px', background: loading ? '#52525B' : '#111921', color: '#ffffff', border: 'none', borderRadius: 120, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                {loading ? 'Updating...' : <>Update password <ArrowRight size={15} /></>}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
