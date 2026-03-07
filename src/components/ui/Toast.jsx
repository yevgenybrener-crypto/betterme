import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function Toast() {
  const { toast, clearToast } = useStore()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(clearToast, 4000)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 bg-bg-card rounded-2xl p-4 shadow-modal border-l-4 border-brand-primary z-50"
          style={{ borderLeftColor: '#6C63FF' }}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{toast.emoji || '🔥'}</span>
            <div className="flex-1">
              <p className="font-bold text-text-pri">{toast.title}</p>
              <p className="text-sm text-text-sec mt-0.5">{toast.message}</p>
            </div>
            <button onClick={clearToast} className="text-text-mut text-lg min-w-[44px] min-h-[44px] flex items-center justify-center">✕</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
