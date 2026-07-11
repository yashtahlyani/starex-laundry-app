import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, MapPin, Phone, Mail, StickyNote, Package, ArrowRight, Check } from 'lucide-react'
import { OrderTimeline, StatusBadge, fmtMoney } from './orderBits'
import { rateOrder, advanceOrder, acknowledgeOrder, ORDER_STAGES, STAGE_INDEX } from '../../lib/store'
import { useOrder } from '../../hooks/useStore'

const ease = [0.25, 0.4, 0.25, 1]

function Row({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F4F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color="#52525B" />
      </div>
      <div>
        <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', fontWeight: 700 }}>{label}</p>
        <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.9rem', color: '#09090B', fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  )
}

export default function OrderDrawer({ order: orderProp, onClose, onReorder, admin = false }) {
  // Stay in sync with the store so status changes reflect live in the open drawer
  const live = useOrder(orderProp?.id)
  const order = live || orderProp
  const stageIdx = order ? (STAGE_INDEX[order.status] ?? 0) : 0
  const nextStage = order && stageIdx < ORDER_STAGES.length - 1 ? ORDER_STAGES[stageIdx + 1] : null
  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(9,9,11,0.5)', backdropFilter: 'blur(3px)', zIndex: 1000 }}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(460px, 100vw)', zIndex: 1001,
              background: '#FFFFFF', boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ background: '#111921', padding: '24px 28px', position: 'relative' }}>
              <button onClick={onClose} aria-label="Close" style={{
                position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.08)', border: 'none',
                borderRadius: 8, width: 34, height: 34, cursor: 'pointer', color: 'rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={17} /></button>
              <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.75rem', color: '#78EDB2', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>{order.serviceTitle}</p>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#fff', letterSpacing: '-0.02em', marginBottom: 12 }}>Order {order.code}</h3>
              <StatusBadge status={order.status} pulse={order.status !== 'delivered'} />
            </div>

            {/* Body */}
            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#71717A', marginBottom: 16 }}>Progress</p>
              <OrderTimeline order={order} />

              <div style={{ height: 1, background: '#F0F0F0', margin: '24px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Row icon={Package} label="Schedule" value={`${order.date} · ${order.timeSlot}`} />
                <Row icon={MapPin} label="Pickup address" value={order.address} />
                <Row icon={Phone} label="Phone" value={order.phone} />
                <Row icon={Mail} label="Email" value={order.email} />
                <Row icon={StickyNote} label="Notes" value={order.notes} />
              </div>

              <div style={{ height: 1, background: '#F0F0F0', margin: '24px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.8rem', color: '#71717A' }}>Estimated total</p>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#09090B' }}>{fmtMoney(order.price)}</p>
                </div>
                <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.72rem', color: '#A1A1AA', maxWidth: 160, textAlign: 'right' }}>Weight: {order.weight}. Final price confirmed at pickup.</p>
              </div>

              {/* Rating for delivered orders (customer view) */}
              {!admin && order.status === 'delivered' && (
                <div style={{ marginTop: 24, background: '#D1F9E3', borderRadius: 14, padding: '18px 20px' }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#0a3547', marginBottom: 10 }}>
                    {order.rating ? 'You rated this order' : 'How did we do?'}
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => rateOrder(order.id, n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }} aria-label={`Rate ${n} stars`}>
                        <Star size={22} fill={order.rating >= n ? '#F59E0B' : 'transparent'} color={order.rating >= n ? '#F59E0B' : '#0a3547'} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer — customer reorder */}
            {!admin && onReorder && order.status === 'delivered' && (
              <div style={{ padding: '16px 28px', borderTop: '1px solid #F0F0F0' }}>
                <button onClick={() => onReorder(order)} className="btn-primary" style={{ width: '100%' }}>Reorder this</button>
              </div>
            )}

            {/* Footer — owner controls */}
            {admin && (
              <div style={{ padding: '16px 28px', borderTop: '1px solid #F0F0F0', background: '#FAFAFA' }}>
                {order.isNew && (
                  <button onClick={() => acknowledgeOrder(order.id)} className="btn-primary" style={{ width: '100%', marginBottom: 10 }}>
                    <Check size={16} /> Accept &amp; confirm order
                  </button>
                )}
                {nextStage ? (
                  <button onClick={() => advanceOrder(order.id)} style={{
                    width: '100%', padding: '13px', borderRadius: 120, border: 'none', cursor: 'pointer',
                    background: '#111921', color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    Advance to: {nextStage.label} <ArrowRight size={16} />
                  </button>
                ) : (
                  <p style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#15803D', padding: '10px' }}>✓ Order completed &amp; delivered</p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
