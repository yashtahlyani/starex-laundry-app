import { motion, useAnimation } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition() {
  const controls = useAnimation()
  const { pathname } = useLocation()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }

    const run = async () => {
      // Wipe in from bottom — covers old page
      await controls.start({
        clipPath: 'inset(0% 0% 0% 0%)',
        transition: { duration: 0.34, ease: [0.87, 0, 0.13, 1] },
      })
      // Hold one frame while page switches underneath
      await new Promise(r => setTimeout(r, 48))
      // Wipe out to top — reveals new page
      await controls.start({
        clipPath: 'inset(100% 0% 0% 0%)',
        transition: { duration: 0.38, ease: [0.87, 0, 0.13, 1] },
      })
      controls.set({ clipPath: 'inset(0% 0% 100% 0%)' })
    }
    run()
  }, [pathname])

  return (
    <motion.div
      initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      animate={controls}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'linear-gradient(160deg, #09090B 0%, #111827 100%)',
        pointerEvents: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Faint watermark brand in center */}
      <span style={{
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600, fontSize: '2rem',
        letterSpacing: '-0.02em',
        color: 'rgba(255,255,255,0.05)',
        userSelect: 'none',
      }}>
        StareX
      </span>
    </motion.div>
  )
}
