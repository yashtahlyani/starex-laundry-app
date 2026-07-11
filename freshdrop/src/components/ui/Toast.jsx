import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id))

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9000, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#09090B', color: '#FAFAFA',
                borderRadius: 999, padding: '12px 20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '0.9rem',
                pointerEvents: 'all', whiteSpace: 'nowrap',
              }}
            >
              {t.type === 'success'
                ? <CheckCircle size={16} color="#78EDB2" />
                : <XCircle size={16} color="#F87171" />
              }
              {t.message}
              <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A', padding: '0 0 0 4px', display: 'flex' }}>
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
