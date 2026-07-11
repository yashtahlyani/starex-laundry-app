import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ChevronRight, ArrowRight } from 'lucide-react'
import { useUserOrders } from '../hooks/useStore'
import { StatusBadge, fmtMoney, fmtDate } from '../components/orders/orderBits'
import OrderDrawer from '../components/orders/OrderDrawer'

const ease = [0.25, 0.4, 0.25, 1]
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'delivered', label: 'Delivered' },
]

export default function Orders() {
  const navigate = useNavigate()
  const orders = useUserOrders()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = orders.filter(o =>
    filter === 'all' ? true : filter === 'active' ? o.status !== 'delivered' : o.status === 'delivered'
  )

  return (
    <div style={{ background: '#F7F7F7', minHeight: '100vh', paddingTop: 112 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 96px' }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} style={{ marginBottom: 28 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Your account</p>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#09090B', letterSpacing: '-0.022em' }}>
            My <em className="display-accent" style={{ display: 'inline' }}>orders.</em>
          </h1>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '8px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: filter === f.id ? '#111921' : '#fff',
              color: filter === f.id ? '#fff' : '#52525B',
              fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem',
              boxShadow: filter === f.id ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
            }}>{f.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #EDEDED', borderRadius: 20, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F4F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Package size={24} color="#A1A1AA" />
            </div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#09090B', marginBottom: 6 }}>No orders here yet</p>
            <p style={{ fontFamily: 'Kodchasan, sans-serif', color: '#71717A', marginBottom: 24 }}>Your {filter !== 'all' ? filter : ''} orders will show up here.</p>
            <Link to="/book" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>Book a pickup <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((o, i) => (
              <motion.button key={o.id} onClick={() => setSelected(o)}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.35, ease }}
                style={{
                  background: '#fff', border: '1px solid #EDEDED', borderRadius: 16, padding: '20px 24px',
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 18, alignItems: 'center',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0FFF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={19} color="#4ECDA0" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#09090B' }}>{o.serviceTitle} <span style={{ color: '#A1A1AA', fontWeight: 400 }}>· {o.code}</span></p>
                  <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.8rem', color: '#A1A1AA' }}>Placed {fmtDate(o.createdAt, { month: 'short', day: 'numeric' })} · {o.timeSlot}</p>
                </div>
                <StatusBadge status={o.status} size="sm" pulse={o.status !== 'delivered'} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#09090B' }}>{fmtMoney(o.price)}</span>
                  <ChevronRight size={16} color="#C0C0C0" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <OrderDrawer order={selected} onClose={() => setSelected(null)} onReorder={() => { setSelected(null); navigate('/book') }} />

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none} .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  )
}
