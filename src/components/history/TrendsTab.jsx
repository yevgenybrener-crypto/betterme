import { useMemo } from 'react'
import { useStore, getWeekStartDay, isWorkday } from '../../store/useStore'
import { CATEGORIES } from '../../lib/constants'
import { getSimulatedDate } from '../../lib/simulatedDate'

function localISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getWeekStartDate(anchorDate, weekStartDay) {
  const dayOfWeek = (anchorDate.getDay() - weekStartDay + 7) % 7
  const ws = new Date(anchorDate)
  ws.setDate(anchorDate.getDate() - dayOfWeek)
  return ws
}

function weekKey(weekStartDate, weekStartDay) {
  const y = weekStartDate.getFullYear()
  const m = String(weekStartDate.getMonth() + 1).padStart(2, '0')
  const d = String(weekStartDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}-W${weekStartDay}`
}

function shortWeekLabel(weekStartDate, isCurrentWeek) {
  if (isCurrentWeek) return 'This wk'
  const m = weekStartDate.toLocaleString('default', { month: 'short' })
  return `${m} ${weekStartDate.getDate()}`
}

// ─── Weekly Score data ───────────────────────────────────────────────────────
function buildWeeklyScores(goals, completions, workdayPreset, numWeeks = 8) {
  const today = getSimulatedDate()
  const weekStartDay = getWeekStartDay(workdayPreset)
  const currentWeekStart = getWeekStartDate(today, weekStartDay)
  const activeGoals = goals.filter(g => !g.archived)

  return Array.from({ length: numWeeks }, (_, i) => {
    const offset = -(numWeeks - 1 - i)
    const ws = new Date(currentWeekStart)
    ws.setDate(currentWeekStart.getDate() + offset * 7)
    const we = new Date(ws)
    we.setDate(ws.getDate() + 6)

    const wKey = weekKey(ws, weekStartDay)
    const isCurrentWeek = offset === 0
    const isFuture = offset > 0

    if (isFuture) return { label: 'Next', pct: null, isFuture: true, isCurrentWeek: false }

    let completed = 0
    let possible = 0

    for (const goal of activeGoals) {
      if (goal.frequency === 'daily') {
        // Count each day of the week that was active
        for (let d = 0; d < 7; d++) {
          const dayDate = new Date(ws)
          dayDate.setDate(ws.getDate() + d)
          if (dayDate > today) break
          const dayNum = dayDate.getDay()
          if (goal.weekdaysOnly && !isWorkday(dayNum, workdayPreset)) continue
          if (goal.weekendsOnly && isWorkday(dayNum, workdayPreset)) continue
          possible++
          const key = `${goal.id}_${localISO(dayDate)}`
          if (completions[key]) completed++
        }
      } else if (goal.frequency === 'weekly') {
        if (goal.weeklyMode === 'days') {
          const scheduledDays = goal.weeklyDays || []
          for (let d = 0; d < 7; d++) {
            const dayDate = new Date(ws)
            dayDate.setDate(ws.getDate() + d)
            if (dayDate > today) break
            if (!scheduledDays.includes(dayDate.getDay())) continue
            possible++
            const key = `${goal.id}_${localISO(dayDate)}`
            if (completions[key]) completed++
          }
        } else {
          // Mode A: 1 possible per week
          possible++
          const count = completions[`${goal.id}_${wKey}`] || 0
          const target = goal.weeklyTimes ?? 1
          if (count >= target) completed++
        }
      }
    }

    const pct = possible > 0 ? Math.round((completed / possible) * 100) : 0
    return { label: shortWeekLabel(ws, isCurrentWeek), pct, isCurrentWeek, isFuture: false }
  })
}

// ─── Life Balance data ────────────────────────────────────────────────────────
function buildCategoryScores(goals, completions, workdayPreset) {
  const today = getSimulatedDate()
  const year = today.getFullYear()
  const month = today.getMonth()
  const weekStartDay = getWeekStartDay(workdayPreset)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysSoFar = today.getDate()
  const activeGoals = goals.filter(g => !g.archived)

  return CATEGORIES.map(cat => {
    const catGoals = activeGoals.filter(g => g.category === cat.id)
    if (catGoals.length === 0) return { ...cat, pct: 0, hasGoals: false }

    let completed = 0, possible = 0

    for (const goal of catGoals) {
      if (goal.frequency === 'daily') {
        for (let d = 1; d <= daysSoFar; d++) {
          const date = new Date(year, month, d)
          const dayNum = date.getDay()
          if (goal.weekdaysOnly && !isWorkday(dayNum, workdayPreset)) continue
          if (goal.weekendsOnly && isWorkday(dayNum, workdayPreset)) continue
          possible++
          const key = `${goal.id}_${localISO(date)}`
          if (completions[key]) completed++
        }
      } else if (goal.frequency === 'weekly') {
        // Count weeks this month
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month, daysInMonth)
        let cursor = new Date(firstDay)
        while (cursor <= lastDay && cursor <= today) {
          const ws = getWeekStartDate(cursor, weekStartDay)
          const wKey = weekKey(ws, weekStartDay)
          if (goal.weeklyMode === 'days') {
            const scheduled = goal.weeklyDays || []
            for (let d = 0; d < 7; d++) {
              const dd = new Date(ws)
              dd.setDate(ws.getDate() + d)
              if (dd < firstDay || dd > today) { cursor.setDate(cursor.getDate() + 1); continue }
              if (!scheduled.includes(dd.getDay())) continue
              possible++
              if (completions[`${goal.id}_${localISO(dd)}`]) completed++
            }
          } else {
            possible++
            const count = completions[`${goal.id}_${wKey}`] || 0
            if (count >= (goal.weeklyTimes ?? 1)) completed++
          }
          // Move to start of next week
          cursor = new Date(ws)
          cursor.setDate(ws.getDate() + 7)
        }
      }
    }

    const pct = possible > 0 ? Math.round((completed / possible) * 100) : 0
    return { ...cat, pct, hasGoals: true }
  })
}

// ─── Radar SVG ───────────────────────────────────────────────────────────────
function RadarChart({ scores }) {
  const cx = 110, cy = 110, r = 80
  const n = scores.length

  const point = (i, value) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const dist = r * (value / 100)
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  const labelPoint = (i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const dist = r + 28
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  const gridLevels = [20, 40, 60, 80, 100]
  const axisPoints = scores.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  const dataPoints = scores.map((s, i) => point(i, Math.max(s.pct, 5)))
  const polyline = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg width="280" height="280" viewBox="0 0 280 280" className="overflow-visible">
      {/* Grid circles */}
      {gridLevels.map(lvl => (
        <polygon key={lvl}
          points={scores.map((_, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2
            const d = r * (lvl / 100)
            return `${cx + d * Math.cos(angle)},${cy + d * Math.sin(angle)}`
          }).join(' ')}
          fill="none" stroke="#E8E7F5" strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axisPoints.map((pt, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="#E8E7F5" strokeWidth="1" />
      ))}

      {/* Data polygon */}
      <polygon points={polyline}
        fill="rgba(108,99,255,0.12)" stroke="#6C63FF" strokeWidth="2" strokeLinejoin="round" />

      {/* Data points */}
      {dataPoints.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="4" fill={scores[i].color} />
      ))}

      {/* Labels */}
      {scores.map((s, i) => {
        const lp = labelPoint(i)
        const anchor = lp.x < cx - 5 ? 'end' : lp.x > cx + 5 ? 'start' : 'middle'
        return (
          <g key={i}>
            <text x={lp.x} y={lp.y - 6} textAnchor={anchor}
              fontSize="9" fontWeight="700" fill={s.color}>
              {s.emoji} {s.label.split(' ')[0]}
            </text>
            <text x={lp.x} y={lp.y + 6} textAnchor={anchor}
              fontSize="10" fontWeight="800" fill={s.hasGoals ? s.color : '#B0B0C8'}>
              {s.hasGoals ? `${s.pct}%` : '–'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Smart Insight ───────────────────────────────────────────────────────────
function getInsight(scores) {
  const withGoals = scores.filter(s => s.hasGoals)
  if (withGoals.length === 0) return null
  const weakest = withGoals.reduce((a, b) => a.pct < b.pct ? a : b)
  const strongest = withGoals.reduce((a, b) => a.pct > b.pct ? a : b)
  if (weakest.pct === strongest.pct) return `You're balanced across all categories this month. Keep it up! 🎯`
  return `${weakest.emoji} <strong>${weakest.label}</strong> needs attention — only ${weakest.pct}% this month. You're crushing ${strongest.emoji} <strong>${strongest.label}</strong> at ${strongest.pct}%.`
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TrendsTab() {
  const { goals, completions, workdayPreset } = useStore()

  const weeklyScores = useMemo(() =>
    buildWeeklyScores(goals, completions, workdayPreset),
    [goals, completions, workdayPreset]
  )

  const categoryScores = useMemo(() =>
    buildCategoryScores(goals, completions, workdayPreset),
    [goals, completions, workdayPreset]
  )

  const insight = getInsight(categoryScores)
  const maxPct = Math.max(...weeklyScores.filter(w => w.pct !== null).map(w => w.pct), 1)

  const thisWeek = weeklyScores.find(w => w.isCurrentWeek)
  const lastWeek = weeklyScores.filter(w => !w.isCurrentWeek && !w.isFuture).slice(-2, -1)[0]
  const trend = thisWeek && lastWeek && lastWeek.pct > 0
    ? thisWeek.pct - lastWeek.pct
    : null

  return (
    <div className="px-5 pb-6">

      {/* ── Weekly Score ── */}
      <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-3">Weekly score</p>
      <div className="bg-bg-card rounded-[20px] border border-border shadow-card p-5 mb-5">
        <p className="text-[15px] font-bold text-text-pri mb-0.5">Completion Rate</p>
        <p className="text-[11px] text-text-sec mb-4">% of goals completed each week</p>

        {/* Bars */}
        <div className="flex items-end gap-1.5 h-28">
          {weeklyScores.map((week, i) => {
            const height = week.pct !== null ? Math.max((week.pct / maxPct) * 96, 4) : 6
            const isThis = week.isCurrentWeek
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                {week.pct !== null && (
                  <span className={`text-[9px] font-bold ${isThis ? 'text-brand-primary' : 'text-text-sec'}`}>
                    {week.pct}%
                  </span>
                )}
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${height}px`,
                    background: week.isFuture ? '#F0EFFB'
                      : isThis ? '#6C63FF'
                      : `rgba(108,99,255,${0.2 + (week.pct / 100) * 0.5})`,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* X-axis */}
        <div className="border-t border-border mt-1.5 mb-1.5" />
        <div className="flex gap-1.5">
          {weeklyScores.map((week, i) => (
            <div key={i} className={`flex-1 text-center text-[9px] font-medium
              ${week.isCurrentWeek ? 'text-brand-primary font-bold' : 'text-text-mut'}`}>
              {week.label}
            </div>
          ))}
        </div>

        {/* Trend badge */}
        {trend !== null && (
          <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-pill text-[11px] font-bold
            ${trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
            {trend >= 0 ? ' · keep going 🔥' : ' · you can bounce back 💪'}
          </div>
        )}
      </div>

      {/* ── Life Balance Radar ── */}
      <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-3">Life balance</p>
      <div className="bg-bg-card rounded-[20px] border border-border shadow-card p-5">
        <p className="text-[15px] font-bold text-text-pri mb-0.5">This Month's Balance</p>
        <p className="text-[11px] text-text-sec mb-4">
          Completion rate per life category — {getSimulatedDate().toLocaleString('default', { month: 'long' })}
        </p>

        {categoryScores.every(s => !s.hasGoals) ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🕸️</p>
            <p className="text-text-sec text-sm">Add goals across categories to see your balance</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-2">
              <RadarChart scores={categoryScores} />
            </div>

            {/* Insight */}
            {insight && (
              <div className="bg-bg-surface rounded-[14px] px-4 py-3 text-[12px] text-text-sec leading-relaxed">
                💡 <span dangerouslySetInnerHTML={{ __html: insight }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
