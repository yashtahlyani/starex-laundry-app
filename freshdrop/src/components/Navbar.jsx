import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Menu, X, ChevronDown, Phone } from 'lucide-react'

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const location = useLocation()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      setScrolled(current > 20)
      setHidden(current > lastScrollY.current && current > 80)
      lastScrollY.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href) => location.pathname === href

  return (
    <>
      <motion.nav
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-md border-b'
            : 'bg-transparent'
        }`}
        style={scrolled ? { background: 'rgba(17,25,33,0.92)', borderColor: 'rgba(255,255,255,0.07)' } : {}}
      >
        <div className="container-base">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{ width: 36, height: 36, background: 'linear-gradient(180deg,#C9F8DE,#78EDB2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" stroke="#0a1a0f" strokeWidth="1.8" />
                  <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#0a1a0f" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </motion.div>
              <div>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.1rem', color: '#ffffff', lineHeight: 1 }}>
                  StareX
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  style={{
                    fontFamily: 'Kodchasan, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: isActive(link.href) ? '#78EDB2' : 'rgba(255,255,255,0.7)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    transition: 'color 0.2s',
                    textDecoration: 'none',
                    background: isActive(link.href) ? 'rgba(120,237,178,0.1)' : 'transparent',
                  }}
                  className="relative"
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="nav-underline"
                      style={{ position: 'absolute', bottom: 2, left: 14, right: 14, height: 2, background: '#78EDB2', borderRadius: 999 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="tel:+14165551234"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'Kodchasan, sans-serif', textDecoration: 'none', transition: 'color 0.2s' }}
              >
                <Phone size={14} />
                (416) 555-1234
              </a>
              <Link to="/book" className="btn-primary" style={{ fontSize: '0.875rem', padding: '9px 22px' }}>
                Book Pickup
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-white shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <div style={{ width: 32, height: 32, background: 'linear-gradient(180deg,#C9F8DE,#78EDB2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" stroke="#0a1a0f" strokeWidth="1.8" />
                      <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#0a1a0f" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#111921' }}>StareX</span>
                </Link>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-6 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: 'block', padding: '12px 16px', borderRadius: 12,
                        fontFamily: 'Kodchasan, sans-serif', fontWeight: 500,
                        color: isActive(link.href) ? '#0a3547' : '#374151',
                        background: isActive(link.href) ? '#D1F9E3' : 'transparent',
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="p-6 border-t border-slate-100 space-y-3">
                <a href="tel:+14165551234" className="flex items-center gap-2 text-slate-500 text-sm">
                  <Phone size={14} /> (416) 555-1234
                </a>
                <Link to="/book" onClick={() => setIsOpen(false)} className="btn-primary w-full justify-center">
                  Book a Pickup
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
