import { motion } from 'framer-motion'

const ORB_DATA = [
  { color: 'rgba(34,211,238,0.15)', size: 500, x: '10%', y: '20%', duration: 25 },
  { color: 'rgba(167,139,250,0.12)', size: 600, x: '75%', y: '60%', duration: 32 },
  { color: 'rgba(34,211,238,0.10)', size: 400, x: '50%', y: '80%', duration: 28 },
]

export default function Orbs({ count = 3 }) {
  const orbs = ORB_DATA.slice(0, count)

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(80px)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -30, 20, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        />
      ))}
    </div>
  )
}
