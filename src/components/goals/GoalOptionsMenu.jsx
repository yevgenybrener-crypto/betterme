import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function GoalOptionsMenu({ open, goal, onClose }) {
  const { archiveGoal, deleteGoal, updateGoal } = useStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(goal?.name || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleArchive() {
    archiveGoal(goal.id)
    onClose()
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteGoal(goal.id)
    onClose()
  }

  function handleSaveEdit() {
    if (name.trim()) updateGoal(goal.id, { name: name.trim() })
    setEditing(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50" onClick={onClose} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-bg-card rounded-t-3xl p-5 z-50 shadow-modal">

            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

            <p className="font-bold text-text-pri mb-4 truncate">{goal?.name}</p>

            {editing ? (
              <div className="mb-4">
                <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
                  className="w-full px-4 py-3 rounded-card border-2 border-brand-primary bg-bg-surface text-sm text-text-pri focus:outline-none mb-3" />
                <div className="flex gap-3">
                  <button onClick={() => setEditing(false)}
                    className="flex-1 py-3 rounded-card border border-border text-text-sec font-semibold text-sm">Cancel</button>
                  <button onClick={handleSaveEdit}
                    className="flex-1 py-3 rounded-card bg-brand-primary text-white font-semibold text-sm">Save</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={() => setEditing(true)}
                  className="w-full py-3.5 px-4 rounded-card bg-bg-surface text-text-pri font-medium text-sm text-left flex items-center gap-3">
                  <span>✏️</span> Edit name
                </button>
                <button onClick={handleArchive}
                  className="w-full py-3.5 px-4 rounded-card bg-bg-surface text-text-pri font-medium text-sm text-left flex items-center gap-3">
                  <span>📦</span> Archive goal
                </button>
                <button onClick={handleDelete}
                  className={`w-full py-3.5 px-4 rounded-card font-medium text-sm text-left flex items-center gap-3
                    ${confirmDelete ? 'bg-red-500 text-white' : 'bg-bg-surface text-red-500'}`}>
                  <span>🗑️</span> {confirmDelete ? 'Tap again to confirm delete' : 'Delete goal'}
                </button>
                <button onClick={onClose}
                  className="w-full py-3.5 rounded-card border border-border text-text-sec font-semibold text-sm mt-2">
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
