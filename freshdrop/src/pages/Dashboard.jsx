import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Package, Plus, Clock, Star, ChevronRight, Sparkles } from 'lucide-react'
import { useAuth, useUserOrders } from '../hooks/useStore'
import { StatusBadge, ProgressTrack, fmtMoney } from '../components/orders/orderBits'
import OrderDrawer from '../components/orders/OrderDrawer'
import { STATUS_META } from '../components/orders/orderBits'

const ease = [0.25, 0.4, 0.25, 1]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
const today = new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const orders = useUserOrders()
  const [selected, setSelected] = useState(null)

  const first = user?.name?.split(' ')[0] || 'there'
  const active = orders.filter(o => o.status !== 'delivered')

  // Prioritise in-flight stages over pending so the most urgent order shows first
  const ACTIVE_PRIORITY = { washing: 0, folding: 0, out_for_delivery: 0, picked_up: 1, confirmed: 2, placed: 3 }
  const activeOrder = [...active].sort((a, b) => (ACTIVE_PRIORITY[a.status] ?? 4) - (ACTIVE_PRIORITY[b.status] ?? 4))[0]

  const recent = orders.slice(0, 4)

  const stats = useMemo(() => {
    const delivered = orders.filter(o => o.status === 'delivered')
    const rated = delivered.filter(o => o.rating)
    return {
      total: orders.length,
      active: active.length,
      spent: orders.reduce((s, o) => s + (o.price || 0), 0),
      rating: rated.length ? (rated.reduce((a, o) => a + o.rating, 0) / rated.length).toFixed(1) : '—',
    }
  }, [orders, active.length])

  const statCards = [
    { label: 'Total orders', value: stats.total, icon: Package },
    { label: 'Active now', value: stats.active, icon: Clock },
    { label: 'Total spent', value: fmtMoney(stats.spent), icon: Sparkles },
    { label: 'Avg rating', value: stats.rating, icon: Star },
  ]

  return (
    <div style={{ background: '#F7F7F7', minHeight: '100vh', paddingTop: 96 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 96px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#C9F8DE,#78EDB2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#0a3547' }}>
              {first.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.55rem', color: '#09090B', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {greeting()}, {first}.
              </h1>
              <p style={{ color: '#71717A', fontSize: '0.875rem', fontFamily: 'Kodchasan, sans-serif' }}>{today}</p>
            </div>
          </div>
          <Link to="/book" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Schedule pickup
          </Link>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }} className="dash-stats">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.05, duration: 0.4, ease }}
              style={{ background: '#fff', border: '1px solid #EDEDED', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <s.icon size={15} color="#78EDB2" />
                <span style={{ color: '#71717A', fontSize: '0.78rem', fontFamily: 'Kodchasan, sans-serif' }}>{s.label}</span>
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#09090B', letterSpacing: '-0.02em' }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Active order — live tracking */}
        {activeOrder ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.45, ease }} style={{ marginBottom: 32 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Active order</p>
            <div style={{ background: '#fff', border: '1.5px solid #C9F8DE', borderRadius: 20, padding: '28px 30px', boxShadow: '0 4px 20px rgba(120,237,178,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#09090B' }}>{activeOrder.code}</span>
                    <StatusBadge status={activeOrder.status} pulse />
                  </div>
                  <p style={{ color: '#71717A', fontSize: '0.85rem', fontFamily: 'Kodchasan, sans-serif', marginTop: 4 }}>
                    {activeOrder.serviceTitle} · {activeOrder.date} · {activeOrder.timeSlot}
                  </p>
                </div>
                <button onClick={() => setSelected(activeOrder)} className="btn-ghost" style={{ padding: '9px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Track order <ChevronRight size={14} />
                </button>
              </div>
              <ProgressTrack status={activeOrder.status} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.72rem', color: '#A1A1AA' }}>{STATUS_META[activeOrder.status]?.label}</span>
                <span style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.72rem', color: '#A1A1AA' }}>Est. {fmtMoney(activeOrder.price)}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.45, ease }}
            style={{ background: '#111921', borderRadius: 20, padding: '40px', textAlign: 'center', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 50% 0%, #0a3547 0%, #111921 70%)' }} />
            <div style={{ position: 'relative' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#fff', marginBottom: 8 }}>
                No active orders — <em className="display-accent" style={{ display: 'inline' }}>enjoy your weekend.</em>
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Kodchasan, sans-serif', marginBottom: 24 }}>Schedule a pickup and we'll handle the rest.</p>
              <Link to="/book" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>Book a pickup <ArrowRight size={16} /></Link>
            </div>
          </motion.div>
        )}

        {/* Recent orders */}
        {recent.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45, ease }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p className="eyebrow" style={{ margin: 0 }}>Recent orders</p>
              {orders.length > 4 && (
                <Link to="/orders" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#4ECDA0', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  View all <ChevronRight size={13} />
                </Link>
              )}
            </div>
            <div style={{ background: '#fff', border: '1px solid #EDEDED', borderRadius: 16, overflow: 'hidden' }}>
              {recent.map((o, i) => (
                <button key={o.id} onClick={() => setSelected(o)} style={{
                  width: '100%', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'center',
                  padding: '16px 22px', borderBottom: i < recent.length - 1 ? '1px solid #F4F4F5' : 'none',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderBottomWidth: i < recent.length - 1 ? 1 : 0,
                }}>
                  <div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#09090B' }}>{o.serviceTitle} <span style={{ color: '#A1A1AA', fontWeight: 400 }}>· {o.code}</span></p>
                    <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.78rem', color: '#A1A1AA' }}>{o.date} · {o.timeSlot}</p>
                  </div>
                  <StatusBadge status={o.status} size="sm" pulse={o.status !== 'delivered'} />
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#09090B', minWidth: 60, textAlign: 'right' }}>{fmtMoney(o.price)}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <OrderDrawer order={selected} onClose={() => setSelected(null)}
        onReorder={(o) => { setSelected(null); navigate('/book') }} />

      <style>{`@media (max-width:720px){ .dash-stats{ grid-template-columns:repeat(2,1fr)!important } }`}</style>
    </div>
  )
}
