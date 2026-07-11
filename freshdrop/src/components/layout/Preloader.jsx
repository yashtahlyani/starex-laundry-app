import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LETTERS = ['S', 'T', 'A', 'R', 'E', 'X']

export default function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const seen = sessionStorage.getItem('sx-preloader')
    if (seen) { onDone(); return }

    const start = Date.now()
    const duration = 1800
    let raf
    const tick = () => {
      const elapsed = Date.now() - start
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      if (p < 1) { raf = requestAnimationFrame(tick) }
      else {
        setTimeout(() => {
          setVisible(false)
          setTimeout(() => { sessionStorage.setItem('sx-preloader', '1'); onDone() }, 450)
        }, 300)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#111921',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 32,
          }}
        >
          <div style={{ display: 'flex', gap: 2 }}>
            {LETTERS.map((letter, i) => {
              const threshold = i / LETTERS.length
              const filled = progress > threshold
              return (
                <motion.span
                  key={`${letter}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease: [0.25, 0.4, 0.25, 1] }}
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                    letterSpacing: '-0.02em',
                    color: filled ? '#78EDB2' : 'rgba(255,255,255,0.15)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {letter}
                </motion.span>
              )
            })}
          </div>
          <div style={{ width: 120, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #C9F8DE, #78EDB2)', borderRadius: 1, width: `${progress * 100}%`, transition: 'width 0.05s linear' }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
