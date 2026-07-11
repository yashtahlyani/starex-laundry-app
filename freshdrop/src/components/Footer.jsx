import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Leaf } from 'lucide-react'
import { useState } from 'react'

const links = {
  Services: [
    { label: 'Wash & Fold', href: '/services' },
    { label: 'Dry Cleaning', href: '/services' },
    { label: 'Express 24hr', href: '/services' },
    { label: 'Ironing & Press', href: '/services' },
    { label: 'Commercial', href: '/services' },
    { label: 'Pickup & Delivery', href: '/services' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Book Now', href: '/book' },
  ],
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="bg-navy-900 text-white">
      {/* Main footer */}
      <div className="container-base py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-brand">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                  <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
                  <circle cx="12" cy="12" r="2" fill="white" />
                  <circle cx="7" cy="7" r="1.5" fill="white" fillOpacity="0.7" />
                </svg>
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-white leading-none block">StareX</span>
                <span className="font-body text-xs text-brand-400 tracking-widest uppercase">Laundry</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Canada's premium laundry pickup and delivery service. Professional care for every garment, delivered fresh to your door.
            </p>
            <div className="flex items-center gap-1 text-eco-500 text-xs font-medium mb-5">
              <Leaf size={12} />
              <span>Eco-certified & Canadian owned</span>
            </div>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Instagram, href: '#', label: 'Instagram' },
                { Icon: Twitter, href: '#', label: 'Twitter' },
              ].map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-500 transition-all duration-200"
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wider">{title}</h3>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-slate-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact + Newsletter */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wider">Get in Touch</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin size={14} className="text-brand-400 mt-0.5 shrink-0" />
                <span>123 King St W, Toronto, ON M5H 1J9</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Phone size={14} className="text-brand-400 shrink-0" />
                <a href="tel:+14165551234" className="hover:text-white transition-colors">(416) 555-1234</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail size={14} className="text-brand-400 shrink-0" />
                <a href="mailto:hello@StareX.ca" className="hover:text-white transition-colors">hello@StareX.ca</a>
              </li>
            </ul>

            <h3 className="font-heading font-semibold text-white mb-3 text-sm uppercase tracking-wider">Newsletter</h3>
            {subscribed ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-eco-400 text-sm font-medium"
              >
                ✓ You're subscribed! Fresh deals incoming.
              </motion.p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-brand-400 focus:bg-white/15 transition-all"
                />
                <button type="submit" className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 shrink-0">
                  Join
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-base py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>© 2024 StareX Laundry Inc. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
