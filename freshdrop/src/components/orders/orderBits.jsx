import { motion } from 'framer-motion'
import { Check, Package, ClipboardCheck, Truck, Waves, Shirt, MapPin, PartyPopper } from 'lucide-react'
import { ORDER_STAGES, STAGE_INDEX } from '../../lib/store'

/* ── Status meta ─────────────────────────────────────────────── */
export const STATUS_META = {
  placed:           { label: 'New order',       bg: '#EAEDf9', fg: '#4338CA', dot: '#6366F1', icon: Package },
  confirmed:        { label: 'Confirmed',        bg: '#E4F4FB', fg: '#0369A1', dot: '#0EA5E9', icon: ClipboardCheck },
  picked_up:        { label: 'Picked up',        bg: '#EAEDf9', fg: '#6D28D9', dot: '#8B5CF6', icon: Truck },
  washing:          { label: 'Washing',          bg: '#D1F9E3', fg: '#047857', dot: '#4ECDA0', icon: Waves },
  folding:          { label: 'Folding',          bg: '#FDF1E1', fg: '#B45309', dot: '#F59E0B', icon: Shirt },
  out_for_delivery: { label: 'Out for delivery', bg: '#D1F9E3', fg: '#065F46', dot: '#10B981', icon: MapPin },
  delivered:        { label: 'Delivered',        bg: '#DCFCE7', fg: '#15803D', dot: '#22C55E', icon: PartyPopper },
}

const STAGE_ICONS = {
  placed: Package, confirmed: ClipboardCheck, picked_up: Truck,
  washing: Waves, folding: Shirt, out_for_delivery: MapPin, delivered: PartyPopper,
}

export function fmtDate(iso, opts) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-CA', opts || { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
export function fmtMoney(n) {
  if (n == null) return 'TBD'
  return '$' + Number(n).toFixed(2)
}

/* ── Status pill ─────────────────────────────────────────────── */
export function StatusBadge({ status, pulse = false, size = 'md' }) {
  const m = STATUS_META[status] || STATUS_META.placed
  const pad = size === 'sm' ? '3px 10px' : '5px 13px'
  const fs = size === 'sm' ? '0.72rem' : '0.8rem'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: m.bg, color: m.fg, borderRadius: 999, padding: pad,
      fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: fs, whiteSpace: 'nowrap',
    }}>
      <motion.span
        animate={pulse ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{ width: 7, height: 7, borderRadius: '50%', background: m.dot, flexShrink: 0 }}
      />
      {m.label}
    </span>
  )
}

/* ── Compact horizontal progress (dashboard active card) ─────── */
export function ProgressTrack({ status }) {
  const current = STAGE_INDEX[status] ?? 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
      {ORDER_STAGES.map((s, i) => {
        const done = i <= current
        const active = i === current
        return (
          <div key={s.id} style={{ flex: i === 0 ? '0 0 auto' : 1, display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div style={{ flex: 1, height: 3, background: done ? '#78EDB2' : '#E4E4E7', transition: 'background .4s', minWidth: 8 }} />
            )}
            <motion.div
              animate={{ scale: active ? [1, 1.18, 1] : 1 }}
              transition={{ duration: 1.2, repeat: active ? Infinity : 0, repeatDelay: 1.5 }}
              style={{
                width: active ? 26 : 20, height: active ? 26 : 20, borderRadius: '50%', flexShrink: 0,
                background: done ? 'linear-gradient(180deg,#C9F8DE,#78EDB2)' : '#EDEDED',
                border: active ? '3px solid #C9F8DE' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {done && i < current && <Check size={11} color="#0a3547" strokeWidth={3} />}
              {active && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0a3547' }} />}
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Vertical timeline (order detail) ────────────────────────── */
export function OrderTimeline({ order }) {
  const current = STAGE_INDEX[order.status] ?? 0
  const historyAt = Object.fromEntries((order.statusHistory || []).map(h => [h.status, h.at]))
  return (
    <div style={{ position: 'relative' }}>
      {ORDER_STAGES.map((s, i) => {
        const done = i <= current
        const active = i === current
        const Icon = STAGE_ICONS[s.id] || Package
        return (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 14, position: 'relative', paddingBottom: i < ORDER_STAGES.length - 1 ? 22 : 0 }}>
            {i < ORDER_STAGES.length - 1 && (
              <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: i < current ? '#78EDB2' : '#E4E4E7' }} />
            )}
            <div style={{
              width: 40, height: 40, borderRadius: '50%', zIndex: 1,
              background: done ? 'linear-gradient(180deg,#C9F8DE,#78EDB2)' : '#F4F4F5',
              border: active ? '3px solid #C9F8DE' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: active ? '0 0 0 4px rgba(120,237,178,0.2)' : 'none',
            }}>
              <Icon size={17} color={done ? '#0a3547' : '#A1A1AA'} />
            </div>
            <div style={{ paddingTop: 3 }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: done ? '#09090B' : '#A1A1AA' }}>
                {s.label} {active && <span className="display-accent" style={{ fontSize: '0.8rem' }}>· in progress</span>}
              </p>
              <p style={{ fontFamily: 'Kodchasan, sans-serif', fontSize: '0.78rem', color: '#A1A1AA', marginTop: 1 }}>
                {historyAt[s.id] ? fmtDate(historyAt[s.id]) : done ? '' : 'Pending'}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
