import { useState } from 'react'
import { motion } from 'framer-motion'
import { CATEGORIES } from '../../lib/constants'
import ReflectModal from './ReflectModal'
import { useStore } from '../../store/useStore'

export default function GoalCard({ goal }) {
  const { completions, setCompletion, showToast } = useStore()
  const [showReflect, setShowReflect] = useState(false)
  const isComplete = !!completions[goal.id]
  const category = CATEGORIES.find((c) => c.id === goal.category)

  const urgency = getUrgency(goal)

  function handleComplete() {
    if (isComplete) return
    setCompletion(goal.id, true)
    setShowReflect(true)

    // Check streak milestone
    const newStreak = (goal.streak || 0) + 1
    const milestones = [3, 7, 14, 30, 60, 100]
    if (milestones.includes(newStreak)) {
      setTimeout(() => showToast({
        emoji: '🔥',
        title: `${newStreak}-day streak!`,
        message: getMilestoneMessage(newStreak),
      }), 600)
    }
  }

  return (
    <>
      <motion.div
        layout
        className={`bg-bg-card rounded-card p-4 flex items-center gap-3 border shadow-card mb-2.5
          ${urgency === 'last' ? 'border-l-4' : urgency === 'warn' ? 'border-l-4' : 'border-border'}
          ${isComplete ? 'opacity-70 bg-bg-surface' : ''}
        `}
        style={{
          borderLeftColor: urgency === 'last' ? '#FF4757' : urgency === 'warn' ? '#F7B731' : undefined,
        }}
      >
        <span className="text-2xl flex-shrink-0">{category?.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${isComplete ? 'line-through text-text-sec' : 'text-text-pri'}`}>
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
            {urgency === 'warn' && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-yellow-100 text-yellow-700">
                🟡 {daysLeft(goal)} days left
              </span>
            )}
            {urgency === 'last' && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-red-100 text-red-600">
                🔴 Today's last chance
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleComplete}
          disabled={isComplete}
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px]"
        >
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-7 h-7 rounded-full bg-brand-accent flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-brand-primary" />
          )}
        </button>
      </motion.div>

      <ReflectModal
        open={showReflect}
        goal={goal}
        onClose={() => setShowReflect(false)}
      />
    </>
  )
}

function getUrgency(goal) {
  if (goal.frequency === 'daily') return null
  const days = daysLeft(goal)
  if (days === 0) return 'last'
  if (days <= 2) return 'warn'
  return null
}

function daysLeft(goal) {
  const now = new Date()
  if (goal.frequency === 'weekly') {
    const day = now.getDay()
    return day === 0 ? 0 : 7 - day
  }
  if (goal.frequency === 'monthly') {
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return lastDay - now.getDate()
  }
  return 99
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
