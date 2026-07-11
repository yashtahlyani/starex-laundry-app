import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function FloatingCTA() {
  const [show, setShow] = useState(false)
  const location = useLocation()

  const hiddenPaths = ['/book', '/dashboard', '/orders', '/account', '/admin']
  const isBookPage = hiddenPaths.some(p => location.pathname.startsWith(p))

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && !isBookPage && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{ position: 'fixed', bottom: 28, right: 24, zIndex: 400 }}
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/book"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#111921', color: '#ffffff',
                fontFamily: 'Poppins, sans-serif', fontWeight: 600,
                fontSize: '0.9rem', padding: '13px 22px',
                borderRadius: 999,
                boxShadow: '0 4px 24px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.12)',
                textDecoration: 'none',
              }}
            >
              Book Pickup
              <span style={{
                background: 'linear-gradient(135deg, #C9F8DE, #78EDB2)', borderRadius: '50%',
                width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ArrowRight size={13} color="#0a3547" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
