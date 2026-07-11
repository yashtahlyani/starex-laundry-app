import { useState } from 'react'

const items = ['WASH & FOLD', 'DRY CLEANING', '24HR EXPRESS', 'PICKUP & DELIVERY', 'IRONING & PRESS', 'ECO CERTIFIED']

function Row({ reverse = false, paused }) {
  return (
    <div style={{ overflow: 'hidden', display: 'flex' }}>
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: `${reverse ? 'marquee-reverse' : 'marquee'} 30s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="word-outlined font-display font-bold"
            style={{ fontSize: '2.5rem', padding: '0 1.5rem', flexShrink: 0 }}
          >
            {item} <span style={{ opacity: 0.3 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Marquee() {
  const [paused, setPaused] = useState(false)

  return (
    <div
      className="py-8 overflow-hidden"
      style={{ background: '#111113', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Row paused={paused} />
      <div style={{ marginTop: '0.5rem' }}>
        <Row reverse paused={paused} />
      </div>
    </div>
  )
}
