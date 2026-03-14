import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES } from '../../lib/constants'
import ReflectModal from './ReflectModal'
import GoalOptionsMenu from './GoalOptionsMenu'
import GoalDetailModal from './GoalDetailModal'
import { useStore, isTodayScheduled, nextScheduledDay, daysLeftInWeek, weekPeriodKey, getWeekStartDay } from '../../store/useStore'
import { getSimulatedDate } from '../../lib/simulatedDate'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function GoalCard({ goal }) {
  const { isCompleted, setCompletion, updateGoal, showToast, workdayPreset, weeklyCount, getIntention, isModeACompletedToday } = useStore()
  const [showReflect, setShowReflect] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  // Intention preview — key depends on goal type
  const intention = (() => {
    if (goal.frequency === 'weekly' && goal.weeklyMode === 'days') {
      // Mode B: show today's plan if today is scheduled
      const today = getSimulatedDate()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      return getIntention(goal, `${y}-${m}-${d}`)
    }
    if (goal.frequency === 'weekly') {
      // Mode A / legacy: show this week's plan
      return getIntention(goal, weekPeriodKey(workdayPreset))
    }
    if (goal.frequency === 'monthly') {
      const today = getSimulatedDate()
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
      return getIntention(goal, key)
    }
    return ''
  })()

  const complete = isCompleted(goal)
  const category = CATEGORIES.find((c) => c.id === goal.category)

  // Weekly mode helpers
  const isWeekly = goal.frequency === 'weekly'
  const isModeB = isWeekly && goal.weeklyMode === 'days'
  const isModeA = isWeekly && goal.weeklyMode === 'times'
  const isLegacyWeekly = isWeekly && !goal.weeklyMode

  // Mode B: is today a scheduled day?
  const todayScheduled = isModeB ? isTodayScheduled(goal.weeklyDays || []) : true
  const nextDay = isModeB && !todayScheduled ? nextScheduledDay(goal.weeklyDays || []) : null

  // Mode A: count & target
  const count = (isModeA || isLegacyWeekly) ? weeklyCount(goal) : 0
  const target = goal.weeklyTimes ?? 1
  const daysLeft = daysLeftInWeek(workdayPreset)
  const remaining = target - count

  // Urgency
  const urgency = getUrgency({ goal, complete, isModeA, isLegacyWeekly, isModeB, todayScheduled, remaining, daysLeft, workdayPreset })

  // Mode A: already tapped today?
  const modeADoneToday = (isModeA || isLegacyWeekly) ? isModeACompletedToday(goal) : false

  // Can the user tap complete?
  const canComplete = !complete && (isModeB ? todayScheduled : true) && !modeADoneToday

  function handleComplete() {
    if (!canComplete) return
    setCompletion(goal, true)

    const newStreak = (goal.streak || 0) + 1
    updateGoal(goal.id, { streak: newStreak })

    // Show reflect only when fully done (Mode A: hit target; others: always)
    const nowCount = count + 1
    const isDone = isModeA ? nowCount >= target : true
    if (isDone) setShowReflect(true)

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
          ${complete ? 'opacity-60 bg-bg-surface' : ''}
          ${isModeB && !todayScheduled ? 'opacity-80' : ''}`}
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

            {/* Mode A: progress badge */}
            {(isModeA || isLegacyWeekly) && !complete && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-purple-100 text-purple-700">
                {count}/{target} this week
              </span>
            )}

            {/* Mode B: next day badge */}
            {isModeB && !todayScheduled && nextDay && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-bg-surface text-text-sec">
                🗓️ Next: {nextDay}
              </span>
            )}

            {/* Urgency badges */}
            {urgency === 'warn' && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-yellow-100 text-yellow-700">
                🟡 Need {remaining} more, {daysLeft} days left
              </span>
            )}
            {urgency === 'last' && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-red-100 text-red-600">
                🔴 Today's last chance
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
          ) : modeADoneToday ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="w-7 h-7 rounded-full bg-brand-primary/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-7" stroke="#6C63FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          ) : (
            <div className={`w-7 h-7 rounded-full border-2 ${canComplete ? 'border-brand-primary' : 'border-border'}`} />
          )}
        </button>
      </motion.div>

      <ReflectModal open={showReflect} goal={goal} onClose={() => setShowReflect(false)} />
      <GoalOptionsMenu open={showOptions} goal={goal} onClose={() => setShowOptions(false)} />
      <GoalDetailModal open={showDetail} goal={goal} onClose={() => setShowDetail(false)} />
    </>
  )
}

function getUrgency({ goal, complete, isModeA, isLegacyWeekly, isModeB, todayScheduled, remaining, daysLeft, workdayPreset }) {
  if (complete) return null
  if (goal.frequency !== 'weekly' && goal.frequency !== 'monthly') {
    // Daily: no urgency
    return null
  }
  if (goal.frequency === 'monthly') {
    const now = getSimulatedDate()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const d = lastDay - now.getDate()
    if (d === 0) return 'last'
    if (d <= 2) return 'warn'
    return null
  }
  // Weekly
  if (isModeB) {
    if (!todayScheduled) return null // off-day, no urgency
    // On a scheduled day — is it the last scheduled day of the week?
    const weekStartDay = workdayPreset === 'sun-thu' ? 0 : 1
    const todayDay = getSimulatedDate().getDay()
    const remainingScheduled = (goal.weeklyDays || []).filter(d => {
      const daysFromToday = (d - todayDay + 7) % 7
      return daysFromToday > 0
    })
    if (remainingScheduled.length === 0) return 'last' // no more scheduled days this week
    return null
  }
  // Mode A or legacy
  if (remaining <= 0) return null
  if (daysLeft === 0 && remaining > 0) return 'last'
  if (remaining > daysLeft) return 'warn'
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
