import { useScroll, useSpring, motion } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #C9F8DE, #78EDB2)',
        scaleX, transformOrigin: '0%',
        zIndex: 9998, pointerEvents: 'none',
      }}
    />
  )
}
