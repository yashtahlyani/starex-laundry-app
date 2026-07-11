import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-hero"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo icon */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="2.5" />
            <circle cx="24" cy="24" r="12" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
            <circle cx="24" cy="24" r="5" fill="white" />
            <circle cx="14" cy="14" r="3" fill="white" fillOpacity="0.7" />
          </svg>
        </motion.div>

        <div className="text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-heading font-bold text-white"
          >
            StareX
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-brand-200 font-body text-sm mt-1 tracking-widest uppercase"
          >
            Laundry
          </motion.p>
        </div>

        {/* Loading bar */}
        <motion.div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
            className="h-full w-full bg-white rounded-full"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/60 text-sm font-body"
        >
          Freshening things up...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
