import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, getWeekStartDay } from '../../store/useStore'
import { CATEGORIES } from '../../lib/constants'
import { getSimulatedDate } from '../../lib/simulatedDate'
import BookPanel from './BookPanel'

// Detect if a goal is a "reading" goal based on name keywords
function isBookGoal(goal) {
  if (!goal) return false
  const name = (goal.name || '').toLowerCase()
  return ['book', 'read', 'reading'].some(k => name.includes(k))
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function localISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function monthKey(offset) {
  const d = getSimulatedDate()
  const shifted = new Date(d.getFullYear(), d.getMonth() + offset, 1)
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(offset) {
  const d = getSimulatedDate()
  const shifted = new Date(d.getFullYear(), d.getMonth() + offset, 1)
  return shifted.toLocaleString('default', { month: 'long', year: 'numeric' })
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

function getWeekDatesForOffset(offset, workdayPreset) {
  const today = getSimulatedDate()
  const anchor = new Date(today)
  anchor.setDate(today.getDate() + offset * 7)
  const weekStart = getWeekStartDay(workdayPreset)
  const dayOfWeek = (anchor.getDay() - weekStart + 7) % 7
  const ws = new Date(anchor)
  ws.setDate(anchor.getDate() - dayOfWeek)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws)
    d.setDate(ws.getDate() + i)
    return d
  })
}

function weekRangeLabel(offset, workdayPreset) {
  const dates = getWeekDatesForOffset(offset, workdayPreset)
  const fmt = (d) => `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
  if (offset === 0) return 'This week'
  if (offset === 1) return 'Next week'
  if (offset === -1) return 'Last week'
  return `${fmt(dates[0])} – ${fmt(dates[6])}`
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MAX_NAV = 4
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Plan type detection ──────────────────────────────────────────────────────
function getPlanType(goal) {
  if (!goal) return null
  if (goal.frequency === 'monthly') return 'monthly'
  if (goal.frequency === 'weekly') return 'weekly'
  return 'daily'
}

// ─── Unified Weekly Day Picker ─────────────────────────────────────────────────
// Works for all weekly goals: shows scheduled days, allows changing them per-week
function WeeklyDayPicker({ goal, offset, workdayPreset, completions, getEffectiveDays, getWeeklySchedule, setWeeklySchedule }) {
  const weekDates = getWeekDatesForOffset(offset, workdayPreset)
  const weekKey = weekPeriodKeyForOffset(offset, workdayPreset)
  // Effective days = week-specific override if set, otherwise goal's default days
  const effectiveDays = getEffectiveDays(goal, weekKey)
  const today = getSimulatedDate()
  const todayISO = localISO(today)
  const isPastWeek = offset < 0

  const completedCount = weekDates.filter(d => !!completions[`${goal.id}_${localISO(d)}`]).length

  function toggleDay(dayNum) {
    if (isPastWeek) return
    const isSelected = effectiveDays.includes(dayNum)
    const newDays = isSelected
      ? effectiveDays.filter(d => d !== dayNum)
      : [...effectiveDays, dayNum]
    setWeeklySchedule(goal, weekKey, newDays)
  }

  return (
    <div>
      <p className="text-sm font-semibold text-text-pri mb-1">
        {isPastWeek ? 'Scheduled days' : 'Which days this week?'}
      </p>
      <p className="text-xs text-text-sec mb-3">
        {isPastWeek
          ? `${effectiveDays.length} day${effectiveDays.length !== 1 ? 's' : ''} scheduled · ${completedCount} completed`
          : effectiveDays.length > 0
            ? `${effectiveDays.length} day${effectiveDays.length !== 1 ? 's' : ''} planned — tap to adjust`
            : "Tap to pick the days you'll do it this week"}
      </p>
      <div className="flex gap-1.5 mb-1">
        {weekDates.map(date => {
          const dayNum = date.getDay()
          const iso = localISO(date)
          const isScheduled = effectiveDays.includes(dayNum)
          const isDone = !!completions[`${goal.id}_${iso}`]
          const isToday = iso === todayISO

          return (
            <button key={iso}
              onClick={() => toggleDay(dayNum)}
              disabled={isPastWeek}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl border-2 transition-all gap-1
                ${isDone
                  ? 'border-brand-accent bg-brand-accent/10'
                  : isScheduled
                    ? 'border-brand-primary bg-brand-primary/8'
                    : 'border-border bg-bg-surface'}`}>
              <span className={`text-[9px] font-bold uppercase ${
                isDone ? 'text-green-600' : isScheduled ? 'text-brand-primary' : isToday ? 'text-brand-primary' : 'text-text-sec'}`}>
                {SHORT_DAYS[dayNum]}
              </span>
              <span className={`text-[13px] font-bold ${
                isDone ? 'text-green-700' : isScheduled ? 'text-brand-primary' : 'text-text-pri'}`}>
                {date.getDate()}
              </span>
              {isDone
                ? <span className="text-[10px]">✅</span>
                : isScheduled
                  ? <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  : <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
              }
            </button>
          )
        })}
      </div>
      {!isPastWeek && (
        <p className="text-[10px] text-text-mut pl-1 mt-1.5">Tap a day to schedule it · tap again to remove</p>
      )}
    </div>
  )
}

// ─── Monthly Date Picker ──────────────────────────────────────────────────────
function MonthlyDatePicker({ goal, offset, completions, getMonthlySchedule, setMonthlySchedule }) {
  const today = getSimulatedDate()
  const shifted = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const year = shifted.getFullYear()
  const month = shifted.getMonth()
  const mKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const plannedDate = getMonthlySchedule(goal, mKey)
  const isDone = !!completions[`${goal.id}_${mKey}`]
  const isPast = offset < 0

  const dateNums = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div>
      <p className="text-xs text-text-sec mb-3">
        {isDone ? '✅ Completed this month'
          : plannedDate ? `📅 Planned for the ${plannedDate}${ordinal(plannedDate)}`
          : 'Pick a date for this month'}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {dateNums.map(d => {
          const isSelected = plannedDate === d
          const isTodayDate = offset === 0 && today.getDate() === d
          return (
            <button key={d}
              onClick={() => !isPast && setMonthlySchedule(goal, mKey, isSelected ? null : d)}
              disabled={isPast}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all
                ${isSelected
                  ? 'bg-brand-primary text-white'
                  : isTodayDate
                    ? 'border-2 border-brand-primary text-brand-primary bg-white'
                    : 'bg-bg-surface text-text-sec border border-border'}`}>
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ordinal(n) {
  if (n > 3 && n < 21) return 'th'
  switch (n % 10) { case 1: return 'st'; case 2: return 'nd'; case 3: return 'rd'; default: return 'th' }
}

// ─── Single intention field ───────────────────────────────────────────────────
function IntentionField({ intentionKey, isPast, getIntention, setIntention, goal, placeholder }) {
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setText(getIntention(goal, intentionKey))
    setSaved(false)
  }, [intentionKey, goal?.id])

  function handleBlur() {
    if (isPast) return
    setIntention(goal, intentionKey, text)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isPast) {
    return (
      <div className="bg-bg-surface rounded-card px-4 py-3 min-h-[52px]">
        {text
          ? <p className="text-sm text-text-sec">📝 {text}</p>
          : <p className="text-sm text-text-mut italic">No plan was set</p>
        }
      </div>
    )
  }

  return (
    <>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full min-h-[72px] px-4 py-3 rounded-card border-2 bg-bg-surface text-base text-text-pri placeholder:text-text-mut resize-none focus:outline-none leading-relaxed transition-colors"
        style={{ borderColor: saved ? '#43E97B' : text ? '#6C63FF' : 'rgba(108,99,255,0.3)' }}
      />
      <p className="text-[10px] text-text-mut mt-1 pl-1">
        {saved ? '✅ Saved' : '💾 Auto-saves when you leave the field'}
      </p>
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GoalDetailModal({ goal, open, onClose }) {
  const { workdayPreset, getIntention, setIntention, journalEntries, completions,
          getEffectiveDays, getWeeklySchedule, setWeeklySchedule, getMonthlySchedule, setMonthlySchedule } = useStore()
  const [offset, setOffset] = useState(0)
  const [showAllJournal, setShowAllJournal] = useState(false)

  const planType = getPlanType(goal)

  // Reset on open
  useEffect(() => {
    if (open) {
      setOffset(0)
      setShowAllJournal(false)
    }
  }, [open])

  if (!goal) return null

  const category = CATEGORIES.find((c) => c.id === goal.category)
  const goalJournal = journalEntries.filter((e) => e.goalId === goal.id)
  const visibleJournal = showAllJournal ? goalJournal : goalJournal.slice(0, 3)

  const isPast = offset < 0

  // ── Period label for navigator ──
  let periodLabel = ''
  if (planType === 'monthly') {
    periodLabel = monthLabel(offset)
  } else {
    periodLabel = weekRangeLabel(offset, workdayPreset)
  }

  // ── Plan section content ──
  let planContent = null

  if (planType === 'daily') {
    const todayISO = localISO(getSimulatedDate())
    planContent = (
      <IntentionField
        intentionKey={todayISO}
        isPast={false}
        getIntention={getIntention}
        setIntention={setIntention}
        goal={goal}
        placeholder="What's your plan for today?"
      />
    )
  } else if (planType === 'weekly') {
    const weekKey = weekPeriodKeyForOffset(offset, workdayPreset)
    const weekDates = getWeekDatesForOffset(offset, workdayPreset)
    const effectiveDays = getEffectiveDays(goal, weekKey)
    const scheduledDates = weekDates.filter(d => effectiveDays.includes(d.getDay()))

    planContent = (
      <div className="flex flex-col gap-4">
        {/* Day picker — set/change which days this week */}
        <WeeklyDayPicker
          goal={goal} offset={offset} workdayPreset={workdayPreset}
          completions={completions}
          getEffectiveDays={getEffectiveDays}
          getWeeklySchedule={getWeeklySchedule}
          setWeeklySchedule={setWeeklySchedule}
        />

        {/* Per-day intention fields — hidden for reading/book goals */}
        {!isBookGoal(goal) && scheduledDates.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut">Plans per day</p>
            {scheduledDates.map(date => {
              const iso = localISO(date)
              const dayName = DAY_NAMES[date.getDay()]
              const dayFmt = `${dayName}, ${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`
              return (
                <div key={iso}>
                  <p className="text-xs font-semibold text-text-sec mb-1.5">📅 {dayFmt}</p>
                  <IntentionField
                    intentionKey={iso}
                    isPast={isPast}
                    getIntention={getIntention}
                    setIntention={setIntention}
                    goal={goal}
                    placeholder={`What's your plan for ${dayName}?`}
                  />
                </div>
              )
            })}
          </div>
        )}

        {!isBookGoal(goal) && scheduledDates.length === 0 && !isPast && (
          <p className="text-sm text-text-mut italic text-center py-2 bg-bg-surface rounded-xl">
            Pick days above to set plans for each one
          </p>
        )}
      </div>
    )
  } else if (planType === 'monthly') {
    const mKey = monthKey(offset)
    planContent = (
      <div className="flex flex-col gap-4">
        <MonthlyDatePicker
          goal={goal} offset={offset} completions={completions}
          getMonthlySchedule={getMonthlySchedule}
          setMonthlySchedule={setMonthlySchedule}
        />
        <IntentionField
          intentionKey={mKey}
          isPast={isPast}
          getIntention={getIntention}
          setIntention={setIntention}
          goal={goal}
          placeholder="Any notes for this month? (optional)"
        />
      </div>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
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

              {/* Plan section — all goal types */}
              {planType && (
                <>
                  <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-3">
                    {planType === 'daily' ? "Today's plan"
                      : planType === 'weekly' ? 'Plan your week'
                      : planType === 'monthly' ? 'Plan this month'
                      : 'Your plan'}
                  </p>

                  {/* Week/month navigator — not shown for daily goals */}
                  {planType !== 'daily' && (
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setOffset(o => Math.max(o - 1, -MAX_NAV))}
                        disabled={offset <= -MAX_NAV}
                        className="text-brand-primary font-bold text-lg px-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-brand-primary/8 disabled:opacity-25">
                        ←
                      </button>
                      <p className="text-sm font-bold text-text-pri text-center">{periodLabel}</p>
                      <button
                        onClick={() => setOffset(o => Math.min(o + 1, MAX_NAV))}
                        disabled={offset >= MAX_NAV}
                        className="text-brand-primary font-bold text-lg px-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-brand-primary/8 disabled:opacity-25">
                        →
                      </button>
                    </div>
                  )}

                  {planContent}

                  <div className="border-t border-border my-4" />
                </>
              )}

              {/* Book Panel — for reading goals */}
              {isBookGoal(goal) && (
                <>
                  <BookPanel goal={goal} />
                  <div className="border-t border-border my-4" />
                </>
              )}

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
