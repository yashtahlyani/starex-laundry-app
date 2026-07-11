import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, MapPin, Plus, Trash2, LogOut, Check, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useStore'
import { updateProfile, addAddress, removeAddress, logout } from '../lib/store'
import { useToast } from '../components/ui/Toast'

const ease = [0.25, 0.4, 0.25, 1]

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #E4E4E7', borderRadius: 12,
  fontSize: '0.9375rem', color: '#09090B', fontFamily: 'Kodchasan, sans-serif', outline: 'none',
  background: '#fff', transition: 'border-color .2s', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#09090B', marginBottom: 6 }

function Card({ title, icon: Icon, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDEDED', borderRadius: 20, padding: '26px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F0FFF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color="#4ECDA0" />
        </div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.05rem', color: '#09090B' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function Account() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [prefs, setPrefs] = useState(user?.prefs || {})
  const [newAddr, setNewAddr] = useState({ label: '', line: '' })

  // Sync form fields when Supabase session hydrates after mount
  useEffect(() => {
    if (user) {
      setProfile(p => ({ name: p.name || user.name || '', phone: p.phone || user.phone || '' }))
      setPrefs(user.prefs || {})
    }
  }, [user?.id])

  if (!user) return null

  const saveProfile = () => { updateProfile({ name: profile.name, phone: profile.phone }); toast('Profile updated', 'success') }
  const savePrefs = (p) => { const next = { ...prefs, ...p }; setPrefs(next); updateProfile({ prefs: next }) }
  const handleAddAddress = () => {
    if (!newAddr.line.trim()) { toast('Enter an address', 'error'); return }
    addAddress({ label: newAddr.label || 'Address', line: newAddr.line })
    setNewAddr({ label: '', line: '' }); toast('Address added', 'success')
  }
  const signOut = () => { logout(); navigate('/') }

  const detergents = ['Standard', 'Hypoallergenic', 'Fragrance-free']
  const folds = ['Standard fold', 'Hang delicates', 'Fold + hang']

  return (
    <div style={{ background: '#F7F7F7', minHeight: '100vh', paddingTop: 112 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 96px' }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Your account</p>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#09090B', letterSpacing: '-0.022em' }}>
              Account <em className="display-accent" style={{ display: 'inline' }}>settings.</em>
            </h1>
          </div>
          <button onClick={signOut} className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', fontSize: '0.85rem' }}>
            <LogOut size={15} /> Sign out
          </button>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Profile */}
          <Card title="Profile" icon={User}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="acct-grid">
              <div>
                <label style={labelStyle}>Full name</label>
                <input style={inputStyle} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#78EDB2'} onBlur={e => e.target.style.borderColor = '#E4E4E7'} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={profile.phone} placeholder="(416) 555-1234" onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#78EDB2'} onBlur={e => e.target.style.borderColor = '#E4E4E7'} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input style={{ ...inputStyle, background: '#F7F7F7', color: '#A1A1AA' }} value={user.email} disabled />
            </div>
            <button onClick={saveProfile} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.875rem' }}>Save changes</button>
          </Card>

          {/* Addresses */}
          <Card title="Saved addresses" icon={MapPin}>
            {user.addresses?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {user.addresses.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: '#F7F7F7', borderRadius: 12, padding: '12px 16px' }}>
                    <div>
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#09090B', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {a.label}
                        {a.isDefault && <span style={{ fontSize: '0.65rem', background: '#D1F9E3', color: '#047857', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>Default</span>}
                      </p>
                      <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.82rem', color: '#71717A' }}>{a.line}</p>
                    </div>
                    <button onClick={() => removeAddress(a.id)} aria-label="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0C0C0', padding: 6 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 10 }} className="addr-add">
              <input style={inputStyle} placeholder="Label (Home)" value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))} />
              <input style={inputStyle} placeholder="123 King St W, Toronto, ON M5H 1A1" value={newAddr.line} onChange={e => setNewAddr(p => ({ ...p, line: e.target.value }))} />
              <button onClick={handleAddAddress} className="btn-primary" style={{ padding: '0 18px', fontSize: '0.85rem' }}><Plus size={15} /></button>
            </div>
          </Card>

          {/* Preferences */}
          <Card title="Laundry preferences" icon={Sparkles}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Detergent</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {detergents.map(d => (
                  <button key={d} onClick={() => savePrefs({ detergent: d })} style={chip(prefs.detergent === d)}>
                    {prefs.detergent === d && <Check size={13} />} {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Folding</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {folds.map(f => (
                  <button key={f} onClick={() => savePrefs({ fold: f })} style={chip(prefs.fold === f)}>
                    {prefs.fold === f && <Check size={13} />} {f}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`@media (max-width:560px){ .acct-grid{ grid-template-columns:1fr!important } .addr-add{ grid-template-columns:1fr auto!important } }`}</style>
    </div>
  )
}

function chip(active) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
    border: active ? '1.5px solid #78EDB2' : '1.5px solid #E4E4E7',
    background: active ? '#D1F9E3' : '#fff',
    color: active ? '#0a3547' : '#52525B',
    fontFamily: 'Kodchasan, sans-serif', fontWeight: active ? 700 : 500, fontSize: '0.85rem',
  }
}
