import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore, getWeekStartDay, isWorkday } from '../../store/useStore'
import { CATEGORIES } from '../../lib/constants'
import { getSimulatedDate } from '../../lib/simulatedDate'
import GoalDetailModal from '../goals/GoalDetailModal'

function localISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getWeekDates(anchorDate, weekStartDay) {
  const dayOfWeek = (anchorDate.getDay() - weekStartDay + 7) % 7
  const weekStart = new Date(anchorDate)
  weekStart.setDate(anchorDate.getDate() - dayOfWeek)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Group goals by category, preserving category order from CATEGORIES
function groupByCategory(goals) {
  const groups = []
  const seen = {}
  for (const cat of CATEGORIES) {
    const catGoals = goals.filter(g => g.category === cat.id)
    if (catGoals.length > 0) {
      groups.push({ cat, goals: catGoals })
      seen[cat.id] = true
    }
  }
  // Uncategorised fallback
  const uncat = goals.filter(g => !seen[g.category])
  if (uncat.length > 0) groups.push({ cat: { id: 'other', label: 'Other', color: '#B0B0C8', emoji: '📌' }, goals: uncat })
  return groups
}

export default function WeekGrid() {
  const { goals, completions, workdayPreset, toggleDayCompletion, weeklyCount, getWeeklySchedule, getMonthlySchedule, getIntention } = useStore()
  const weekStartDay = getWeekStartDay(workdayPreset)
  const today = getSimulatedDate()
  const todayISO = localISO(today)

  const [weekOffset, setWeekOffset] = useState(0)
  const [detailGoal, setDetailGoal] = useState(null)

  const anchorDate = new Date(today)
  anchorDate.setDate(today.getDate() + weekOffset * 7)
  const weekDates = getWeekDates(anchorDate, weekStartDay)
  const weekStart = weekDates[0]
  const weekEnd = weekDates[6]

  const activeGoals = goals.filter(g => !g.archived)

  // Mode A goals that have planned days for the displayed week → treated as scheduled
  const modeAWithPlan = (g) =>
    g.frequency === 'weekly' &&
    g.weeklyMode !== 'days' &&
    (getWeeklySchedule(g, displayedWeekKey) || []).length > 0

  // Section 1: Scheduled grid
  // - daily goals
  // - Mode B weekly (fixed days)
  // - Mode A goals that have planned days THIS week
  const scheduledGoals = activeGoals.filter(g =>
    g.frequency === 'daily' ||
    (g.frequency === 'weekly' && g.weeklyMode === 'days') ||
    modeAWithPlan(g)
  )

  // Section 2: Flexible — Mode A with NO planned days + monthly
  const flexibleGoals = activeGoals.filter(g =>
    (g.frequency === 'weekly' && g.weeklyMode !== 'days' && !modeAWithPlan(g)) ||
    g.frequency === 'monthly'
  )

  // Week period key for this displayed week
  const displayedWeekKey = (() => {
    const ws = weekDates[0]
    const y = ws.getFullYear()
    const m = String(ws.getMonth() + 1).padStart(2, '0')
    const d = String(ws.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}-W${weekStartDay}`
  })()

  // Month key for this displayed week's month
  const displayedMonthKey = (() => {
    const ws = weekDates[0]
    return `${ws.getFullYear()}-${String(ws.getMonth() + 1).padStart(2, '0')}`
  })()

  const fmtDate = (d) => `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
  const isCurrentWeek = weekOffset === 0
  const rangeLabel = `${fmtDate(weekStart)} – ${fmtDate(weekEnd)}`

  function isCellActive(goal, date) {
    const dayNum = date.getDay()
    if (goal.frequency === 'daily') {
      if (goal.weekdaysOnly && !isWorkday(dayNum, workdayPreset)) return false
      if (goal.weekendsOnly && isWorkday(dayNum, workdayPreset)) return false
      return true
    }
    if (goal.frequency === 'weekly' && goal.weeklyMode === 'days') {
      return (goal.weeklyDays || []).includes(dayNum)
    }
    // Mode A with planned days — use weeklySchedules for this week
    if (goal.frequency === 'weekly' && goal.weeklyMode !== 'days') {
      const plannedDays = getWeeklySchedule(goal, displayedWeekKey) || []
      return plannedDays.includes(dayNum)
    }
    return false
  }

  const scheduledGroups = groupByCategory(scheduledGoals)
  const flexGroups = groupByCategory(flexibleGoals)

  return (
    <><div className="px-3 pb-4">

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button onClick={() => setWeekOffset(o => Math.max(o - 1, -4))}
          className="text-brand-primary text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-primary/8 active:bg-brand-primary/15">
          ← Prev
        </button>
        <div className="text-center">
          <p className="text-xs font-bold text-text-pri">{isCurrentWeek ? 'This week' : rangeLabel}</p>
          {isCurrentWeek && <p className="text-[10px] text-text-sec">{rangeLabel}</p>}
        </div>
        <button onClick={() => setWeekOffset(o => Math.min(o + 1, 4))}
          className="text-brand-primary text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-primary/8 active:bg-brand-primary/15">
          Next →
        </button>
      </div>

      {/* ── Section 1: Scheduled Goals Grid ── */}
      {scheduledGoals.length > 0 && (
        <>
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-2 px-1">📅 Scheduled days</p>
          <div className="bg-bg-card rounded-[20px] border border-border shadow-card overflow-hidden mb-5">

            {/* Day header */}
            <div className="flex border-b border-border py-2">
              <div className="w-[120px] flex-shrink-0" />
              {weekDates.map((date) => {
                const iso = localISO(date)
                const isToday = iso === todayISO
                return (
                  <div key={iso} className="flex-1 flex flex-col items-center gap-0.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${isToday ? 'text-brand-primary' : 'text-text-sec'}`}>
                      {SHORT_DAYS[date.getDay()]}
                    </span>
                    <span className={`text-[11px] font-bold flex items-center justify-center
                      ${isToday ? 'w-[20px] h-[20px] rounded-full bg-brand-primary text-white text-[9px]' : 'text-text-sec'}`}>
                      {date.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Category groups */}
            {scheduledGroups.map(({ cat, goals: catGoals }, gi) => (
              <div key={cat.id}>
                {/* Category divider */}
                <div className={`flex items-center gap-2 px-3 py-1.5 ${gi > 0 ? 'border-t border-border' : ''}`}
                  style={{ background: `${cat.color}0D` }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: cat.color }}>
                    {cat.label}
                  </span>
                </div>

                {/* Goal rows */}
                {catGoals.map((goal, idx) => {
                  return (
                    <div key={goal.id}
                      className={`flex items-center min-h-[46px] ${idx < catGoals.length - 1 ? 'border-b border-border/40' : ''}`}>

                      {/* Goal name — tap opens modal */}
                      <div className="w-[120px] flex-shrink-0 px-3 py-1.5 cursor-pointer"
                        onClick={() => setDetailGoal(goal)}>
                        <span className="text-[11px] font-semibold text-text-pri leading-snug line-clamp-2">
                          {goal.name}
                        </span>
                        {/* Mode A: show week count badge */}
                        {goal.frequency === 'weekly' && goal.weeklyMode !== 'days' && (
                          <span className="text-[9px] font-bold text-brand-primary">
                            {weeklyCount(goal) || 0}/{goal.weeklyTimes ?? 1}×
                          </span>
                        )}
                      </div>

                      {/* Day cells */}
                      {weekDates.map((date) => {
                        const iso = localISO(date)
                        const active = isCellActive(goal, date)
                        const done = active && !!completions[`${goal.id}_${iso}`]
                        const isToday = iso === todayISO
                        const isFuture = iso > todayISO

                        return (
                          <div key={iso}
                            className={`flex-1 flex items-center justify-center min-h-[44px] ${isToday ? 'bg-brand-primary/[0.03]' : ''}`}>
                            {!active ? (
                              <div className="w-[5px] h-[5px] rounded-full bg-border" />
                            ) : isFuture ? (
                              <div className="w-[22px] h-[22px] rounded-full border-2 border-border/40 bg-bg-surface/50" />
                            ) : done ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className="w-[22px] h-[22px] rounded-full bg-brand-accent flex items-center justify-center">
                                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                  <path d="M2 7l4 4 6-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </motion.div>
                            ) : (
                              <motion.button whileTap={{ scale: 0.85 }}
                                onClick={() => toggleDayCompletion(goal, iso)}
                                className="w-[22px] h-[22px] rounded-full border-2 border-border bg-white" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Section 2: Flexible Goals Cards ── */}
      {flexibleGoals.length > 0 && (
        <>
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-2 px-1">🔄 No fixed days</p>
          <div className="flex flex-col gap-3">
            {flexGroups.map(({ cat, goals: catGoals }) =>
              catGoals.map(goal => {
                const isModeA = goal.frequency === 'weekly'
                const isMonthly = goal.frequency === 'monthly'
                const count = isModeA ? (weeklyCount(goal) || 0) : 0
                const target = isModeA ? (goal.weeklyTimes ?? 1) : 1
                const pct = isModeA ? Math.min(100, (count / target) * 100) : 0

                // Planned days for Mode A
                const plannedDays = isModeA ? getWeeklySchedule(goal, displayedWeekKey) : []
                // Planned date for monthly
                const plannedDate = isMonthly ? getMonthlySchedule(goal, displayedMonthKey) : null
                const monthDone = isMonthly && !!completions[`${goal.id}_${displayedMonthKey}`]

                const hasPlanned = plannedDays.length > 0 || plannedDate !== null

                return (
                  <div key={goal.id}
                    className="bg-bg-card rounded-[16px] border border-border shadow-card p-4 flex items-center gap-3"
                    onClick={() => setDetailGoal(goal)}>

                    <div className="flex-1 min-w-0">
                      {/* Category label */}
                      <p className="text-[10px] font-bold mb-0.5" style={{ color: cat.color }}>
                        {cat.emoji} {cat.label}
                      </p>

                      {/* Goal name */}
                      <p className="text-[13px] font-bold text-text-pri leading-snug mb-2">{goal.name}</p>

                      {/* Progress bar (Mode A) */}
                      {isModeA && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-1.5 bg-bg-surface rounded-pill overflow-hidden max-w-[100px]">
                            <div className="h-full bg-brand-primary rounded-pill transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-brand-primary">{count}/{target} this week</span>
                        </div>
                      )}

                      {/* Monthly status */}
                      {isMonthly && (
                        <p className="text-[10px] font-bold text-brand-primary mb-2">
                          {monthDone ? '✅ Done this month' : '0/1 this month'}
                        </p>
                      )}

                      {/* Planned day chips */}
                      {plannedDays.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {weekDates
                            .filter(d => plannedDays.includes(d.getDay()))
                            .map(d => {
                              const iso = localISO(d)
                              const done = !!completions[`${goal.id}_${iso}`]
                              return (
                                <span key={iso}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-pill border
                                    ${done
                                      ? 'bg-brand-accent/15 text-green-700 border-brand-accent/30'
                                      : 'bg-brand-primary/8 text-brand-primary border-brand-primary/30 border-dashed'}`}>
                                  {done ? '✓ ' : ''}{SHORT_DAYS[d.getDay()]}
                                </span>
                              )
                            })}
                        </div>
                      )}

                      {/* Monthly planned date */}
                      {plannedDate && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-brand-primary/8 text-brand-primary border border-dashed border-brand-primary/30">
                          📅 {plannedDate} {SHORT_DAYS[(new Date(weekDates[0].getFullYear(), weekDates[0].getMonth(), plannedDate)).getDay()]}
                        </span>
                      )}

                      {/* No plan yet */}
                      {!hasPlanned && !monthDone && (
                        <p className="text-[10px] text-text-mut">
                          {isModeA ? 'Tap to plan your days →' : 'Tap to pick a date →'}
                        </p>
                      )}
                    </div>

                    {/* Plan/Edit button */}
                    <div className={`flex-shrink-0 text-[11px] font-bold px-3 py-2 rounded-xl
                      ${hasPlanned || monthDone
                        ? 'bg-brand-accent/10 text-green-700'
                        : 'bg-brand-primary/8 text-brand-primary'}`}>
                      {hasPlanned || monthDone ? '✏️ Edit' : '📅 Plan'}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* Empty state */}
      {scheduledGoals.length === 0 && flexibleGoals.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3">
          <span className="text-4xl">📅</span>
          <p className="text-text-sec text-xs text-center">Add goals to see your week at a glance</p>
        </div>
      )}

    </div>

    <GoalDetailModal
      open={!!detailGoal}
      goal={detailGoal}
      onClose={() => setDetailGoal(null)}
    /></>
  )
}
