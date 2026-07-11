import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function GlassCard({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const spotlightX = useTransform(mouseX, (v) => `${v}px`)
  const spotlightY = useTransform(mouseY, (v) => `${v}px`)

  function handleMouseMove(e) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`glass-card relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: [0.25, 0.4, 0.25, 1], delay }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(200px circle at ${spotlightX} ${spotlightY}, rgba(34,211,238,0.07), transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
