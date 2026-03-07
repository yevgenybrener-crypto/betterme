import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function ReflectModal({ open, goal, onClose }) {
  const [note, setNote] = useState('')
  const addJournalEntry = useStore((s) => s.addJournalEntry)

  function handleSave() {
    if (note.trim()) {
      addJournalEntry({
        id: Date.now().toString(),
        goalId: goal.id,
        goalName: goal.name,
        category: goal.category,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      })
    }
    setNote('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-bg-card rounded-t-3xl p-6 z-50 shadow-modal"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-text-pri">{goal?.name} — Done!</p>
                <p className="text-sm text-text-sec">Drop a gold nugget 💛</p>
              </div>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you feel or learn?"
              className="w-full h-28 p-3 rounded-2xl border border-border bg-bg-surface text-sm text-text-pri resize-none focus:outline-none focus:border-brand-primary"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl border border-border text-text-sec font-semibold text-sm"
              >
                Skip
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-2xl bg-brand-primary text-white font-semibold text-sm"
              >
                Save note ✨
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
