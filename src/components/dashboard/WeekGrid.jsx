import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore, getWeekStartDay } from '../../store/useStore'
import { CATEGORIES } from '../../lib/constants'
import { getSimulatedDate } from '../../lib/simulatedDate'
import GoalDetailModal from '../goals/GoalDetailModal'

// Local ISO string (avoids UTC timezone shift)
function localISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Get the 7 dates of a week containing the given date, starting on weekStartDay
function getWeekDates(anchorDate, weekStartDay) {
  const day = anchorDate.getDay()
  const dayOfWeek = (day - weekStartDay + 7) % 7
  const weekStart = new Date(anchorDate)
  weekStart.setDate(anchorDate.getDate() - dayOfWeek)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function WeekGrid() {
  const { goals, completions, workdayPreset, toggleDayCompletion, weeklyCount, getIntention } = useStore()
  const weekStartDay = getWeekStartDay(workdayPreset)
  const today = getSimulatedDate()
  const todayISO = localISO(today)

  const [weekOffset, setWeekOffset] = useState(0)
  const [detailGoal, setDetailGoal] = useState(null)

  // Anchor date for the displayed week
  const anchorDate = new Date(today)
  anchorDate.setDate(today.getDate() + weekOffset * 7)
  const weekDates = getWeekDates(anchorDate, weekStartDay)
  const weekStart = weekDates[0]
  const weekEnd = weekDates[6]

  const activeGoals = goals.filter((g) => !g.archived)
  const gridGoals = activeGoals.filter((g) =>
    g.frequency === 'daily' || g.frequency === 'weekly'
  )

  // Week period key for the displayed week
  const displayedWeekKey = (() => {
    const ws = weekDates[0]
    const y = ws.getFullYear()
    const m = String(ws.getMonth() + 1).padStart(2, '0')
    const d = String(ws.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}-W${weekStartDay}`
  })()

  // Format date range label
  const fmtDate = (d) => `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
  const isCurrentWeek = weekOffset === 0
  const rangeLabel = `${fmtDate(weekStart)} – ${fmtDate(weekEnd)}`

  function isCellCompleted(goal, dateISO) {
    return !!completions[`${goal.id}_${dateISO}`]
  }

  function isCellActive(goal, date) {
    const dayNum = date.getDay()
    if (goal.frequency === 'daily') {
      if (goal.weekdaysOnly && (dayNum === 0 || dayNum === 6)) return false
      return true
    }
    if (goal.frequency === 'weekly') {
      if (goal.weeklyMode === 'days') {
        return (goal.weeklyDays || []).includes(dayNum)
      }
      return false // Mode A: no per-day cells
    }
    return false
  }

  const isModeA = (goal) =>
    goal.frequency === 'weekly' && goal.weeklyMode !== 'days'

  return (
    <><div className="px-3">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => setWeekOffset(o => Math.max(o - 1, -4))}
          className="text-brand-primary text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-primary/8 active:bg-brand-primary/15">
          ← Prev
        </button>
        <div className="text-center">
          <p className="text-xs font-bold text-text-pri">
            {isCurrentWeek ? 'This week' : rangeLabel}
          </p>
          {isCurrentWeek && <p className="text-[10px] text-text-sec">{rangeLabel}</p>}
        </div>
        <button
          onClick={() => setWeekOffset(o => Math.min(o + 1, 1))}
          className="text-brand-primary text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-primary/8 active:bg-brand-primary/15">
          Next →
        </button>
      </div>

      {/* Grid */}
      <div className="bg-bg-card rounded-[20px] border border-border shadow-card overflow-hidden">

        {/* Day header row */}
        <div className="flex border-b border-border py-2">
          <div className="w-[115px] flex-shrink-0" />
          {weekDates.map((date) => {
            const iso = localISO(date)
            const isToday = iso === todayISO
            return (
              <div key={iso} className={`flex-1 flex flex-col items-center gap-0.5 ${isToday ? 'rounded-lg mx-0.5' : ''}`}>
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? 'text-brand-primary' : 'text-text-sec'}`}>
                  {SHORT_DAYS[date.getDay()]}
                </span>
                <span className={`text-[11px] font-bold flex items-center justify-center
                  ${isToday
                    ? 'w-[22px] h-[22px] rounded-full bg-brand-primary text-white text-[10px]'
                    : 'text-text-sec'}`}>
                  {date.getDate()}
                </span>
              </div>
            )
          })}
        </div>

        {/* Goal rows */}
        {gridGoals.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <span className="text-4xl">📅</span>
            <p className="text-text-sec text-xs text-center">Add daily or weekly goals<br/>to see your week at a glance</p>
          </div>
        ) : (
          gridGoals.map((goal, idx) => {
            const cat = CATEGORIES.find((c) => c.id === goal.category)
            const modeA = isModeA(goal)

            return (
              <div key={goal.id}
                className={`flex items-center min-h-[52px] py-1.5 ${idx < gridGoals.length - 1 ? 'border-b border-border/50' : ''}`}>

                {/* Goal label — tap opens detail modal */}
                <div className="w-[115px] flex-shrink-0 flex items-start gap-1.5 px-2.5 py-1"
                  onClick={() => setDetailGoal(goal)}>
                  <span className="text-[10px] flex-shrink-0 mt-1 leading-none">
                    {getIntention(goal, displayedWeekKey) ? '📝' : ''}
                  </span>
                  <span className="text-[15px] flex-shrink-0 mt-0.5">{cat?.emoji}</span>
                  <span className="text-[11px] font-semibold text-text-pri leading-snug line-clamp-2 flex-1">
                    {goal.name}
                  </span>
                </div>

                {/* Mode A: full-width progress bar */}
                {modeA ? (
                  <div className="flex-1 flex items-center gap-2 pr-3">
                    <div className="flex-1 h-2 bg-bg-surface rounded-pill overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-pill transition-all"
                        style={{ width: `${Math.min(100, ((weeklyCount(goal) || 0) / (goal.weeklyTimes ?? 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-brand-primary whitespace-nowrap">
                      {weeklyCount(goal) || 0}/{goal.weeklyTimes ?? 1}
                    </span>
                  </div>
                ) : (
                  /* Per-day cells */
                  weekDates.map((date) => {
                    const iso = localISO(date)
                    const active = isCellActive(goal, date)
                    const done = active && isCellCompleted(goal, iso)
                    const isToday = iso === todayISO

                    return (
                      <div key={iso}
                        className={`flex-1 flex items-center justify-center min-h-[44px] ${isToday ? 'bg-brand-primary/[0.03]' : ''}`}>
                        {!active ? (
                          <div className="w-[5px] h-[5px] rounded-full bg-border" />
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleDayCompletion(goal, iso)}
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                            {done ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center">
                                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                                  <path d="M2 7l4 4 6-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </motion.div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-border bg-white" />
                            )}
                          </motion.button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )
          })
        )}
      </div>
    </div>

    <GoalDetailModal
      open={!!detailGoal}
      goal={detailGoal}
      onClose={() => setDetailGoal(null)}
    /></>
  )
}
