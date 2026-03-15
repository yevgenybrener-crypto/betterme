import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import GoalCard from '../components/goals/GoalCard'
import ProgressRing from '../components/dashboard/ProgressRing'
import WeekGrid from '../components/dashboard/WeekGrid'
import { CATEGORIES } from '../lib/constants'
import { getSimulatedDate } from '../lib/simulatedDate'
import { todayKey, weekPeriodKey, getWeekStartDay, isWorkday } from '../store/useStore'

export default function Home() {
  const { goals, completions, user, workdayPreset, getEffectiveDays } = useStore()
  const [view, setView] = useState('daily') // 'daily' | 'weekly'

  const activeGoals = goals.filter((g) => !g.archived)
  const thisWeekKey = weekPeriodKey(workdayPreset)
  const todayDayNum = getSimulatedDate().getDay()

  // Group 1: scheduled for today
  // - daily goals active today
  // - weekly goals where today is in their effective days (default or this-week override)
  const scheduledToday = activeGoals.filter((g) => {
    if (g.frequency === 'daily') return isActiveToday(g, workdayPreset)
    if (g.frequency === 'weekly') {
      return getEffectiveDays(g, thisWeekKey).includes(todayDayNum)
    }
    return false
  })

  // Group 2: flexible — no fixed day today
  // - weekly goals with no effective days today
  // - monthly goals
  const flexibleGoals = activeGoals.filter((g) => {
    if (g.frequency === 'weekly') {
      return !getEffectiveDays(g, thisWeekKey).includes(todayDayNum)
    }
    if (g.frequency === 'monthly') return true
    return false
  })

  const lifeStreak = useMemo(() => {
    if (!activeGoals.length) return 0
    return Math.min(...activeGoals.map((g) => g.streak || 0))
  }, [activeGoals])

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const greeting = getGreeting()
  const allTodayGoals = [...scheduledToday, ...flexibleGoals]
  const completedToday = allTodayGoals.filter((g) => completions[`${g.id}_${todayKey()}`] || isCompletedThisPeriod(g, completions)).length
  const ringGoals = activeGoals.filter((g) => g.frequency === 'weekly' || g.frequency === 'monthly')

  return (
    <div className="min-h-screen bg-bg-base pb-20">
      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <p className="text-sm text-text-sec mb-1">{greeting}, {name} 👋</p>
        {lifeStreak > 0 ? (
          <h1 className="text-xl font-bold text-brand-primary">🔥 {lifeStreak}-day streak</h1>
        ) : (
          <h1 className="text-xl font-bold text-text-pri">Let's build your streak 🎯</h1>
        )}
      </div>

      {/* Daily / Weekly toggle */}
      <div className="px-5 mb-4">
        <div className="flex bg-bg-surface rounded-pill p-1 gap-1">
          {['daily', 'weekly'].map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`flex-1 py-2 rounded-pill text-sm font-semibold text-center transition-all
                ${view === v ? 'bg-white text-brand-primary shadow-card' : 'text-text-sec'}`}>
              {v === 'daily' ? 'Daily' : 'Weekly'}
            </button>
          ))}
        </div>
      </div>

      {/* View content */}
      <AnimatePresence mode="wait">
        {view === 'daily' ? (
          <motion.div key="daily"
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}>

            {/* Today's Stack */}
            <div className="px-5">
              {/* Empty state */}
              {allTodayGoals.length === 0 && (
                <div className="flex flex-col items-center py-16 gap-4">
                  <span className="text-5xl">🎯</span>
                  <p className="text-text-sec text-center text-sm">Your life balance starts here</p>
                  <p className="text-text-mut text-center text-xs">Tap + to add your first goal</p>
                </div>
              )}

              {/* Scheduled for today */}
              {scheduledToday.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-mut mb-3">
                    Today's Tasks
                  </p>
                  {scheduledToday.map((g) => <GoalCard key={g.id} goal={g} />)}
                </>
              )}

              {/* Flexible — any day this period */}
              {flexibleGoals.length > 0 && (
                <>
                  <p className={`text-[10px] font-semibold tracking-[0.1em] uppercase text-text-mut mb-3 ${scheduledToday.length > 0 ? 'mt-5' : ''}`}>
                    This Week / Month
                  </p>
                  {flexibleGoals.map((g) => <GoalCard key={g.id} goal={g} />)}
                </>
              )}
            </div>

            {/* Progress Rails */}
            {ringGoals.length > 0 && (
              <div className="px-5 mt-4">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-mut mb-3">Weekly Progress</p>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {ringGoals.map((g) => {
                    const cat = CATEGORIES.find((c) => c.id === g.category)
                    const { value, max } = getRingProgress(g, completions, workdayPreset)
                    return (
                      <ProgressRing key={g.id} value={value} max={max}
                        color={cat?.color || '#6C63FF'} label={cat?.label?.split(' ')[0]} period={g.frequency} />
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="weekly"
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}>
            <WeekGrid />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function isCompletedThisPeriod(goal, completions) {
  if (goal.frequency === 'monthly') {
    const n = getSimulatedDate()
    const key = `${goal.id}_${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
    return !!completions[key]
  }
  return false
}

function isActiveToday(goal, workdayPreset) {
  const day = getSimulatedDate().getDay()
  if (goal.frequency === 'daily') {
    if (goal.weekdaysOnly && !isWorkday(day, workdayPreset)) return false
    if (goal.weekendsOnly && isWorkday(day, workdayPreset)) return false
    return true
  }
  return true
}

function getGreeting() {
  const h = getSimulatedDate().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function localISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Returns { value, max } for the progress ring of a goal
function getRingProgress(goal, completions, workdayPreset) {
  if (goal.frequency === 'monthly') {
    const key = `${goal.id}_${goal.frequency === 'monthly'
      ? (() => { const n = getSimulatedDate(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}` })()
      : ''}`
    return { value: completions[key] ? 1 : 0, max: 1 }
  }

  if (goal.frequency === 'weekly') {
    // Count per-day completions this week
    const weekStart = getWeekStartDay(workdayPreset)
    const today = getSimulatedDate()
    const dayOfWeek = (today.getDay() - weekStart + 7) % 7
    const ws = new Date(today)
    ws.setDate(today.getDate() - dayOfWeek)
    let completed = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(ws)
      d.setDate(ws.getDate() + i)
      if (completions[`${goal.id}_${localISO(d)}`]) completed++
    }
    const max = goal.weeklyTarget ?? (goal.weeklyDays?.length || 1)
    return { value: completed, max }
  }

  return { value: 0, max: 1 }
}
