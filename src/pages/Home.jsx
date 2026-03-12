import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import GoalCard from '../components/goals/GoalCard'
import ProgressRing from '../components/dashboard/ProgressRing'
import WeekGrid from '../components/dashboard/WeekGrid'
import { CATEGORIES } from '../lib/constants'
import { getSimulatedDate } from '../lib/simulatedDate'

export default function Home() {
  const { goals, completions, user } = useStore()
  const [view, setView] = useState('daily') // 'daily' | 'weekly'

  const activeGoals = goals.filter((g) => !g.archived)
  const todayGoals = activeGoals.filter((g) => isActiveToday(g))
  const weeklyGoals = activeGoals.filter((g) => g.frequency === 'weekly')
  const monthlyGoals = activeGoals.filter((g) => g.frequency === 'monthly')

  const lifeStreak = useMemo(() => {
    if (!activeGoals.length) return 0
    return Math.min(...activeGoals.map((g) => g.streak || 0))
  }, [activeGoals])

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const greeting = getGreeting()
  const completedToday = todayGoals.filter((g) => completions[g.id]).length
  const ringGoals = [...weeklyGoals, ...monthlyGoals]

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
              <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-mut mb-3">
                Today's Stack {completedToday > 0 && `· ${completedToday}/${todayGoals.length} done`}
              </p>
              {todayGoals.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-4">
                  <span className="text-5xl">🎯</span>
                  <p className="text-text-sec text-center text-sm">Your life balance starts here</p>
                  <p className="text-text-mut text-center text-xs">Tap + to add your first goal</p>
                </div>
              ) : (
                todayGoals.map((g) => <GoalCard key={g.id} goal={g} />)
              )}
            </div>

            {/* Progress Rails */}
            {ringGoals.length > 0 && (
              <div className="px-5 mt-4">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-mut mb-3">Weekly Progress</p>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {ringGoals.map((g) => {
                    const cat = CATEGORIES.find((c) => c.id === g.category)
                    const completed = completions[g.id] ? 1 : 0
                    return (
                      <ProgressRing key={g.id} value={completed} max={1}
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

function isActiveToday(goal) {
  const day = getSimulatedDate().getDay()
  if (goal.frequency === 'daily') {
    if (goal.weekdaysOnly && (day === 0 || day === 6)) return false
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
