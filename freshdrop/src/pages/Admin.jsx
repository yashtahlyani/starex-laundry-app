import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Users, DollarSign, Clock, Star, ExternalLink, LogOut,
  Bell, ChevronRight, Check, Mail, CheckCircle,
} from 'lucide-react'
import { useStats, useAllOrders, useCustomers } from '../hooks/useStore'
import { logout, acknowledgeOrder } from '../lib/store'
import { supabase } from '../lib/supabaseClient'
import { StatusBadge, fmtMoney, fmtDate } from '../components/orders/orderBits'
import OrderDrawer from '../components/orders/OrderDrawer'

const ease = [0.25, 0.4, 0.25, 1]

const ORDER_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'In progress' },
  { id: 'delivered', label: 'Delivered' },
]

export default function Admin() {
  const navigate = useNavigate()
  const stats = useStats()
  const orders = useAllOrders()
  const customers = useCustomers()
  const [tab, setTab] = useState('orders')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!supabase) return
    supabase.from('contact_submissions').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setMessages(data) })
      .catch(() => {})
  }, [])

  const markRead = async (id) => {
    setMessages(m => m.map(x => x.id === id ? { ...x, status: 'read' } : x))
    await supabase?.from('contact_submissions').update({ status: 'read' }).eq('id', id)
  }

  const newOrders = orders.filter(o => o.isNew)
  const filtered = orders.filter(o =>
    filter === 'all' ? true : filter === 'active' ? o.status !== 'delivered' : o.status === 'delivered'
  )
  const signOut = () => { logout(); navigate('/') }

  const kpis = [
    { label: 'New orders', value: stats.newCount, icon: Bell, accent: stats.newCount > 0 },
    { label: 'In progress', value: stats.activeCount, icon: Clock },
    { label: 'Orders today', value: stats.todayCount, icon: Package },
    { label: 'Revenue (all)', value: fmtMoney(stats.revenue), icon: DollarSign },
    { label: 'Customers', value: stats.customers, icon: Users },
    { label: 'Avg rating', value: stats.avgRating ? stats.avgRating.toFixed(1) + '★' : '—', icon: Star },
  ]

  return (
    <div style={{ background: '#F4F5F7', minHeight: '100vh' }}>

      {/* Console header */}
      <header style={{ background: '#111921', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="#1a2530" />
              <line x1="9" y1="9" x2="27" y2="27" stroke="#78EDB2" strokeWidth="5" strokeLinecap="round" />
              <line x1="27" y1="9" x2="9" y2="27" stroke="#78EDB2" strokeWidth="5" strokeLinecap="round" />
              <circle cx="18" cy="18" r="3" fill="#1a2530" /><circle cx="18" cy="18" r="1.5" fill="#C9F8DE" />
            </svg>
            <div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', lineHeight: 1 }}>StareX</p>
              <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.68rem', color: '#78EDB2', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Owner console</p>
            </div>
            {stats.newCount > 0 && (
              <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#78EDB2', color: '#0a1a0f', borderRadius: 999, padding: '4px 12px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.75rem' }}>
                <Bell size={12} /> {stats.newCount} new
              </motion.span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontFamily: 'Kodchasan, sans-serif', fontSize: '0.82rem', padding: '8px 14px', borderRadius: 8 }}>
              <ExternalLink size={14} /> View site
            </Link>
            <button onClick={signOut} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontFamily: 'Kodchasan, sans-serif', fontSize: '0.82rem', padding: '8px 14px', borderRadius: 8 }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 28 }} className="admin-kpis">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.35, ease }}
              style={{ background: k.accent ? 'linear-gradient(135deg,#C9F8DE,#78EDB2)' : '#fff', border: '1px solid #EAEAEA', borderRadius: 14, padding: '16px 18px' }}>
              <k.icon size={16} color={k.accent ? '#0a3547' : '#78EDB2'} />
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#09090B', letterSpacing: '-0.02em', marginTop: 10 }}>{k.value}</p>
              <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.75rem', color: k.accent ? '#0a3547' : '#71717A', fontWeight: k.accent ? 600 : 400 }}>{k.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Incoming orders — needs action */}
        <AnimatePresence>
          {newOrders.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: 9, height: 9, borderRadius: '50%', background: '#78EDB2' }} />
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#09090B' }}>Incoming orders — need your action</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
                {newOrders.map(o => (
                  <motion.div key={o.id} layout initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{ background: '#fff', border: '2px solid #78EDB2', borderRadius: 16, padding: '20px', boxShadow: '0 6px 24px rgba(120,237,178,0.22)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#09090B' }}>{o.code}</span>
                      <span style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.72rem', color: '#A1A1AA' }}>{fmtDate(o.createdAt)}</span>
                    </div>
                    <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.85rem', color: '#52525B', marginBottom: 2 }}>{o.customerName} · {o.serviceTitle}</p>
                    <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.8rem', color: '#71717A', marginBottom: 14 }}>{o.date} · {o.timeSlot}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={async () => { await acknowledgeOrder(o.id) }} className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}><Check size={14} /> Accept</button>
                      <button onClick={() => setSelected(o)} className="btn-ghost" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>Details</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: '#fff', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid #EAEAEA' }}>
          {[{ id: 'orders', label: 'Orders', icon: Package }, { id: 'customers', label: 'Customers', icon: Users }, { id: 'messages', label: `Messages${messages.filter(m => m.status === 'new').length > 0 ? ` (${messages.filter(m => m.status === 'new').length})` : ''}`, icon: Mail }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: tab === t.id ? '#111921' : 'transparent', color: tab === t.id ? '#fff' : '#71717A',
              fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem',
            }}><t.icon size={15} /> {t.label}</button>
          ))}
        </div>

        {tab === 'orders' ? (
          <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, overflow: 'hidden' }}>
            {/* filter bar */}
            <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
              {ORDER_FILTERS.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{
                  padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: filter === f.id ? '#D1F9E3' : '#F4F4F5', color: filter === f.id ? '#047857' : '#71717A',
                  fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem',
                }}>{f.label}</button>
              ))}
            </div>
            {/* table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 1fr 0.8fr auto', gap: 16, padding: '12px 22px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }} className="admin-th">
              {['Order', 'Customer', 'Status', 'Total', ''].map((h, i) => (
                <span key={i} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#A1A1AA' }}>{h}</span>
              ))}
            </div>
            {filtered.length === 0 && <p style={{ padding: '40px', textAlign: 'center', fontFamily: 'Kodchasan, sans-serif', color: '#A1A1AA' }}>No orders in this view.</p>}
            {filtered.map((o, i) => (
              <button key={o.id} onClick={() => setSelected(o)} style={{
                width: '100%', display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 1fr 0.8fr auto', gap: 16, alignItems: 'center',
                padding: '16px 22px', borderBottom: i < filtered.length - 1 ? '1px solid #F4F4F5' : 'none',
                background: o.isNew ? '#F0FFF7' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }} className="admin-tr">
                <div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.88rem', color: '#09090B' }}>{o.code} {o.isNew && <span style={{ color: '#4ECDA0' }}>•</span>}</p>
                  <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.76rem', color: '#A1A1AA' }}>{o.serviceTitle} · {o.date}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.85rem', color: '#09090B', fontWeight: 500 }}>{o.customerName}</p>
                  <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.76rem', color: '#A1A1AA' }}>{o.phone}</p>
                </div>
                <StatusBadge status={o.status} size="sm" pulse={o.status !== 'delivered'} />
                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#09090B' }}>{fmtMoney(o.price)}</span>
                <ChevronRight size={16} color="#C0C0C0" />
              </button>
            ))}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 0.8fr 0.8fr', gap: 16, padding: '12px 22px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }} className="admin-th">
              {['Customer', 'Contact', 'Orders', 'Spent'].map((h, i) => (
                <span key={i} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#A1A1AA' }}>{h}</span>
              ))}
            </div>
            {customers.length === 0 && <p style={{ padding: '40px', textAlign: 'center', fontFamily: 'Kodchasan, sans-serif', color: '#A1A1AA' }}>No customers yet.</p>}
            {customers.map((c, i) => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 0.8fr 0.8fr', gap: 16, alignItems: 'center', padding: '16px 22px', borderBottom: i < customers.length - 1 ? '1px solid #F4F4F5' : 'none' }} className="admin-tr">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#C9F8DE,#78EDB2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#0a3547', flexShrink: 0 }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.88rem', color: '#09090B' }}>{c.name}</span>
                </div>
                <span style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.82rem', color: '#52525B' }}>{c.email}</span>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.88rem', color: '#09090B' }}>{c.orderCount}</span>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#09090B' }}>{fmtMoney(c.spent)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

        {tab === 'messages' && (
          <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, overflow: 'hidden' }}>
            {messages.length === 0 && (
              <p style={{ padding: '40px', textAlign: 'center', fontFamily: 'Kodchasan, sans-serif', color: '#A1A1AA' }}>
                No contact submissions yet.{supabase ? '' : ' (Run supabase/contact_submissions.sql first.)'}
              </p>
            )}
            {messages.map((m, i) => (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start', padding: '20px 24px', borderBottom: i < messages.length - 1 ? '1px solid #F4F4F5' : 'none', background: m.status === 'new' ? '#F0FFF7' : '#fff' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#09090B' }}>{m.name}</p>
                    <span style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.75rem', color: '#A1A1AA' }}>{m.email}</span>
                    {m.status === 'new' && <span style={{ fontSize: '0.65rem', background: '#D1F9E3', color: '#047857', padding: '2px 8px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>New</span>}
                  </div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#52525B', marginBottom: 4 }}>{m.subject}</p>
                  <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.82rem', color: '#71717A', lineHeight: 1.6 }}>{m.message}</p>
                  <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.72rem', color: '#C0C0C0', marginTop: 6 }}>{new Date(m.created_at).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                {m.status === 'new' && (
                  <button onClick={() => markRead(m.id)} title="Mark as read" style={{ background: 'none', border: '1px solid #E4E4E7', borderRadius: 8, cursor: 'pointer', padding: '6px 10px', color: '#4ECDA0', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Kodchasan, sans-serif', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <CheckCircle size={13} /> Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      <OrderDrawer order={selected} admin onClose={() => setSelected(null)} />

      <style>{`
        @media (max-width:900px){ .admin-kpis{ grid-template-columns:repeat(3,1fr)!important } }
        @media (max-width:560px){ .admin-kpis{ grid-template-columns:repeat(2,1fr)!important } .admin-th{ display:none!important } }
      `}</style>
    </div>
  )
}
