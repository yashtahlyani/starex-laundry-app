import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const TiltCard = ({
  children,
  className = '',
  style = {},
  tiltAngle = 10,
  scale = 1.03,
  glare = true,
  glareOpacity = 0.12,
  springConfig = { stiffness: 300, damping: 25 },
}) => {
  const ref = useRef(null)
  const [hovering, setHovering] = useState(false)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const rotateX = useSpring(
    useTransform(rawY, [-0.5, 0.5], [tiltAngle, -tiltAngle]),
    springConfig
  )
  const rotateY = useSpring(
    useTransform(rawX, [-0.5, 0.5], [-tiltAngle, tiltAngle]),
    springConfig
  )
  const scaleSpring = useSpring(1, springConfig)

  // Always compute glare position — hooks must not be conditional
  const glareX = useTransform(rawX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(rawY, [-0.5, 0.5], ['0%', '100%'])
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,${glareOpacity}), transparent 60%)`
  )

  const handleMouseMove = e => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    rawX.set((e.clientX - rect.left) / rect.width - 0.5)
    rawY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseEnter = () => {
    setHovering(true)
    scaleSpring.set(scale)
  }

  const handleMouseLeave = () => {
    setHovering(false)
    rawX.set(0)
    rawY.set(0)
    scaleSpring.set(1)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale: scaleSpring,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        position: 'relative',
        ...style,
      }}
      className={className}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 10,
            background: glareBackground,
            opacity: hovering ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
      )}
    </motion.div>
  )
}

export default TiltCard
