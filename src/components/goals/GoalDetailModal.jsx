import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, weekPeriodKey, getWeekStartDay } from '../../store/useStore'
import { CATEGORIES } from '../../lib/constants'
import { getSimulatedDate } from '../../lib/simulatedDate'

function localISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function weekLabel(offset) {
  if (offset === 0) return 'This week'
  if (offset === 1) return 'Next week'
  if (offset === -1) return 'Last week'
  if (offset > 1) return `In ${offset} weeks`
  return `${Math.abs(offset)} weeks ago`
}

function getWeekRange(offset, workdayPreset) {
  const today = getSimulatedDate()
  const anchor = new Date(today)
  anchor.setDate(today.getDate() + offset * 7)
  const weekStart = getWeekStartDay(workdayPreset)
  const dayOfWeek = (anchor.getDay() - weekStart + 7) % 7
  const start = new Date(anchor)
  start.setDate(anchor.getDate() - dayOfWeek)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (d) => `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
  return { label: `${fmt(start)} – ${fmt(end)}`, key: weekPeriodKeyForOffset(offset, workdayPreset) }
}

function weekPeriodKeyForOffset(offset, workdayPreset) {
  const today = getSimulatedDate()
  const anchor = new Date(today)
  anchor.setDate(today.getDate() + offset * 7)
  const weekStart = getWeekStartDay(workdayPreset)
  const dayOfWeek = (anchor.getDay() - weekStart + 7) % 7
  const ws = new Date(anchor)
  ws.setDate(anchor.getDate() - dayOfWeek)
  const y = ws.getFullYear()
  const m = String(ws.getMonth() + 1).padStart(2, '0')
  const d = String(ws.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}-W${weekStart}`
}

const MAX_FUTURE = 4
const MAX_PAST = 4

export default function GoalDetailModal({ goal, open, onClose }) {
  const { workdayPreset, getIntention, setIntention, journalEntries } = useStore()
  const [weekOffset, setWeekOffset] = useState(0)
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  const [showAllJournal, setShowAllJournal] = useState(false)
  const textareaRef = useRef(null)

  const { label: rangeLabel, key: currentWeekKey } = getWeekRange(weekOffset, workdayPreset)
  const isPast = weekOffset < 0

  // Load intention when week changes
  useEffect(() => {
    if (!goal) return
    setText(getIntention(goal, currentWeekKey))
    setSaved(false)
  }, [weekOffset, goal?.id])

  // Reset offset when modal opens
  useEffect(() => {
    if (open) {
      setWeekOffset(0)
      setShowAllJournal(false)
    }
  }, [open])

  function handleBlur() {
    if (isPast) return
    setIntention(goal, currentWeekKey, text)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!goal) return null

  const category = CATEGORIES.find((c) => c.id === goal.category)

  // Filter journal entries for this goal
  const goalJournal = journalEntries.filter((e) => e.goalId === goal.id)
  const visibleJournal = showAllJournal ? goalJournal : goalJournal.slice(0, 3)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 bg-bg-base rounded-t-3xl z-50 max-h-[88vh] overflow-y-auto shadow-modal"
          >
            <div className="p-5 pb-10">
              {/* Drag pill */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{category?.emoji}</span>
                    <h2 className="text-xl font-bold text-text-pri leading-tight">{goal.name}</h2>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-pill"
                      style={{ background: `${category?.color}22`, color: category?.color }}>
                      {category?.label}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-pill bg-bg-surface text-text-sec capitalize">
                      {goal.frequency}
                    </span>
                    {goal.streak > 0 && (
                      <span className="text-[11px] font-bold text-orange-500">🔥 {goal.streak}</span>
                    )}
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center text-text-sec text-base ml-2 flex-shrink-0">
                  ✕
                </button>
              </div>

              <div className="border-t border-border my-4" />

              {/* Your Plan */}
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-3">Your plan</p>

              {/* Week navigator */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setWeekOffset(o => Math.max(o - 1, -MAX_PAST))}
                  disabled={weekOffset <= -MAX_PAST}
                  className="text-brand-primary font-bold text-lg px-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-brand-primary/8 disabled:opacity-25">
                  ←
                </button>
                <div className="text-center">
                  <p className="text-sm font-bold text-text-pri">{rangeLabel}</p>
                  <p className="text-[10px] text-text-sec mt-0.5">{weekLabel(weekOffset)}</p>
                </div>
                <button
                  onClick={() => setWeekOffset(o => Math.min(o + 1, MAX_FUTURE))}
                  disabled={weekOffset >= MAX_FUTURE}
                  className="text-brand-primary font-bold text-lg px-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-brand-primary/8 disabled:opacity-25">
                  →
                </button>
              </div>

              {/* Intention field */}
              {isPast ? (
                /* Past week — read only */
                <div className="bg-bg-surface rounded-card px-4 py-3 min-h-[56px]">
                  {text ? (
                    <p className="text-sm text-text-sec">📝 {text}</p>
                  ) : (
                    <p className="text-sm text-text-mut italic">No plan was set for this week</p>
                  )}
                </div>
              ) : (
                /* Current / future week — editable */
                <>
                  <motion.textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="What's the plan this week? e.g. John from DevOps"
                    animate={{ borderColor: saved ? '#43E97B' : text ? '#6C63FF' : 'rgba(108,99,255,0.3)' }}
                    transition={{ duration: 0.3 }}
                    className="w-full min-h-[80px] px-4 py-3 rounded-card border-2 bg-bg-surface text-base text-text-pri placeholder:text-text-mut resize-none focus:outline-none leading-relaxed"
                    style={{ borderColor: saved ? '#43E97B' : text ? '#6C63FF' : 'rgba(108,99,255,0.3)' }}
                  />
                  <p className="text-[10px] text-text-mut mt-1.5 pl-1">
                    {saved ? '✅ Saved' : '💾 Auto-saves when you leave the field'}
                  </p>
                </>
              )}

              <div className="border-t border-border my-4" />

              {/* Reflections */}
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-3">Reflections</p>

              {goalJournal.length === 0 ? (
                <p className="text-sm text-text-mut text-center py-4">
                  Complete this goal and drop a reflection to see it here
                </p>
              ) : (
                <>
                  {visibleJournal.map((entry, i) => (
                    <div key={i} className="flex gap-3 py-2.5 border-b border-border/50 last:border-0">
                      <span className="text-[11px] text-text-mut w-11 flex-shrink-0 mt-0.5">
                        {new Date(entry.createdAt).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm text-text-pri flex-1 leading-snug">{entry.note}</span>
                    </div>
                  ))}
                  {goalJournal.length > 3 && !showAllJournal && (
                    <button onClick={() => setShowAllJournal(true)}
                      className="w-full text-center text-xs font-semibold text-brand-primary mt-2 py-2">
                      See all {goalJournal.length} reflections ↓
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
