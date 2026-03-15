import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES } from '../../lib/constants'
import ReflectModal from './ReflectModal'
import GoalOptionsMenu from './GoalOptionsMenu'
import GoalDetailModal from './GoalDetailModal'
import { useStore, weekPeriodKey } from '../../store/useStore'
import { getSimulatedDate } from '../../lib/simulatedDate'

export default function GoalCard({ goal }) {
  const { isCompleted, setCompletion, updateGoal, showToast, workdayPreset, weeklyCount, getIntention } = useStore()
  const [showReflect, setShowReflect] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  // Intention preview — today's plan for weekly/daily, month plan for monthly
  const intention = (() => {
    if (goal.frequency === 'weekly' || goal.frequency === 'daily') {
      const today = getSimulatedDate()
      const iso = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
      return getIntention(goal, iso)
    }
    if (goal.frequency === 'monthly') {
      const today = getSimulatedDate()
      return getIntention(goal, `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`)
    }
    return ''
  })()

  const complete = isCompleted(goal)
  const category = CATEGORIES.find((c) => c.id === goal.category)

  // Weekly progress
  const isWeekly = goal.frequency === 'weekly'
  const count = isWeekly ? weeklyCount(goal) : 0

  // Urgency for monthly goals
  const urgency = getUrgency({ goal, complete })

  // Can complete: not already done today
  const canComplete = !complete

  function handleComplete() {
    if (!canComplete) return
    setCompletion(goal, true)

    const newStreak = (goal.streak || 0) + 1
    updateGoal(goal.id, { streak: newStreak })
    setShowReflect(true)

    const milestones = [3, 7, 14, 30, 60, 100]
    if (milestones.includes(newStreak)) {
      setTimeout(() => showToast({
        emoji: '🔥',
        title: `${newStreak}-day streak!`,
        message: getMilestoneMessage(newStreak),
      }), 600)
    }
  }

  const borderColor = urgency === 'last' ? '#FF4757' : urgency === 'warn' ? '#F7B731' : undefined

  return (
    <>
      <motion.div layout
        className={`bg-bg-card rounded-card p-4 flex items-center gap-3 border shadow-card mb-2.5
          ${urgency ? 'border-l-[4px]' : 'border-border'}
          ${complete ? 'opacity-60 bg-bg-surface' : ''}`}
        style={{ borderLeftColor: borderColor }}
        onContextMenu={(e) => { e.preventDefault(); setShowOptions(true) }}
      >
        <span className="text-2xl flex-shrink-0">{category?.emoji}</span>

        {/* Card body — tap opens detail modal */}
        <div className="flex-1 min-w-0" onClick={() => setShowDetail(true)}>
          <p className={`font-semibold text-sm ${complete ? 'line-through text-text-sec' : 'text-text-pri'}`}>
            {goal.name}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill"
              style={{ background: `${category?.color}22`, color: category?.color }}>
              {category?.label}
            </span>
            {goal.streak > 0 && (
              <span className="text-[11px] font-semibold text-orange-500">🔥 {goal.streak}</span>
            )}
            {/* Weekly progress badge */}
            {isWeekly && count > 0 && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-purple-100 text-purple-700">
                {count}× this week
              </span>
            )}
            {/* Monthly urgency */}
            {urgency === 'warn' && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-yellow-100 text-yellow-700">
                🟡 Last days of the month
              </span>
            )}
            {urgency === 'last' && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-red-100 text-red-600">
                🔴 Last day of the month
              </span>
            )}
          </div>
          {/* Intention preview */}
          {intention && (
            <p className="text-[11px] text-text-sec mt-1 truncate max-w-[220px]">
              📝 {intention}
            </p>
          )}
        </div>

        {/* Options button */}
        <button onClick={() => setShowOptions(true)}
          className="text-text-mut text-lg px-1 min-w-[32px] min-h-[44px] flex items-center justify-center">
          ···
        </button>

        {/* Complete button */}
        <button onClick={handleComplete} disabled={!canComplete}
          className="flex-shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px]">
          {complete ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="w-7 h-7 rounded-full bg-brand-accent flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-brand-primary" />
          )}
        </button>
      </motion.div>

      <ReflectModal open={showReflect} goal={goal} onClose={() => setShowReflect(false)} />
      <GoalOptionsMenu open={showOptions} goal={goal} onClose={() => setShowOptions(false)} />
      <GoalDetailModal open={showDetail} goal={goal} onClose={() => setShowDetail(false)} />
    </>
  )
}

function getUrgency({ goal, complete }) {
  if (complete) return null
  if (goal.frequency !== 'monthly') return null
  const now = getSimulatedDate()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const d = lastDay - now.getDate()
  if (d === 0) return 'last'
  if (d <= 2) return 'warn'
  return null
}

function getMilestoneMessage(streak) {
  const msgs = {
    3: '3 days in. The habit is forming. 🌱',
    7: "7 days of showing up. That's real.",
    14: "2 weeks strong. You're building something. 💪",
    30: "30 days! You're a force of nature. 🏆",
    60: 'This is who you are now. ⚡',
    100: 'Legendary. 🌟',
  }
  return msgs[streak] || 'Keep going!'
}
