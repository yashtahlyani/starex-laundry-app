import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Preloader from './components/layout/Preloader'
import ScrollProgress from './components/ui/ScrollProgress'
import FloatingCTA from './components/ui/FloatingCTA'
import { ToastProvider } from './components/ui/Toast'
import { getSession, isOwner } from './lib/store'
import { useAuthReady } from './hooks/useStore'

import Home from './pages/Home'
import Services from './pages/Services'
import Pricing from './pages/Pricing'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Contact from './pages/Contact'
import BookNow from './pages/BookNow'
import FAQ from './pages/FAQ'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Account from './pages/Account'
import Admin from './pages/Admin'
import ResetPassword from './pages/ResetPassword'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import NotFound from './pages/NotFound'

const AUTH_PATHS = ['/login', '/signup']

// route guards
function Protected({ children }) {
  const location = useLocation()
  const ready = useAuthReady()
  if (!ready) return null                    // cloud backend still hydrating
  if (!getSession()) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}
function OwnerOnly({ children }) {
  const ready = useAuthReady()
  if (!ready) return null
  if (!getSession()) return <Navigate to="/login" replace />
  if (!isOwner()) return <Navigate to="/dashboard" replace />
  return children
}

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
}

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false)
  const location = useLocation()
  const isAuth = AUTH_PATHS.includes(location.pathname)
  const isAdmin = location.pathname.startsWith('/admin')
  const chromeless = isAuth || isAdmin

  useEffect(() => {
    if (preloaderDone) window.scrollTo(0, 0)
  }, [location.pathname, preloaderDone])

  if (!preloaderDone) {
    return <Preloader onDone={() => setPreloaderDone(true)} />
  }

  return (
    <ToastProvider>
      {!chromeless && <ScrollProgress />}
      {!chromeless && <FloatingCTA />}
      {!chromeless && <Navbar />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Routes location={location}>
            <Route path="/"             element={<Home />} />
            <Route path="/services"     element={<Services />} />
            <Route path="/pricing"      element={<Pricing />} />
            <Route path="/about"        element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/book"         element={<BookNow />} />
            <Route path="/contact"      element={<Contact />} />
            <Route path="/faq"          element={<FAQ />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/signup"       element={<Signup />} />
            <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
            <Route path="/orders"       element={<Protected><Orders /></Protected>} />
            <Route path="/account"      element={<Protected><Account /></Protected>} />
            <Route path="/admin"          element={<OwnerOnly><Admin /></OwnerOnly>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms"          element={<TermsOfService />} />
            <Route path="/privacy"        element={<PrivacyPolicy />} />
            <Route path="*"               element={<NotFound />} />
          </Routes>
          {!chromeless && <Footer />}
        </motion.div>
      </AnimatePresence>
    </ToastProvider>
  )
}
