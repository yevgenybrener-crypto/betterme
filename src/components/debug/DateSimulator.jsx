import { useState } from 'react'
import { setSimulatedDate, getSimulatedDate } from '../../lib/simulatedDate'
import { useStore, getWeekStartDay, weekPeriodKey } from '../../store/useStore'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function localISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseLocalDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function shiftISO(iso, days) {
  const date = parseLocalDate(iso)
  date.setDate(date.getDate() + days)
  return localISO(date)
}

function isoForWeekday(iso, targetDay) {
  const date = parseLocalDate(iso)
  const diff = targetDay - date.getDay()
  const result = new Date(date)
  result.setDate(date.getDate() + diff)
  return localISO(result)
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
function buildSeedData(workdayPreset) {
  const today = getSimulatedDate()
  const todayISO = localISO(today)
  const weekStart = getWeekStartDay(workdayPreset)

  // Compute current week start
  const dow = (today.getDay() - weekStart + 7) % 7
  const ws = new Date(today)
  ws.setDate(today.getDate() - dow)

  // ISO for each day of the current week
  const weekISOs = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws)
    d.setDate(ws.getDate() + i)
    return localISO(d)
  })

  const thisMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const thisWeekKey = `${localISO(ws)}-W${weekStart}`

  const goals = [
    {
      id: 'test_daily_1',
      name: 'Run 5km',
      frequency: 'daily',
      category: 'lifestyle',
      streak: 5,
      archived: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'test_daily_2',
      name: 'Deep work session',
      frequency: 'daily',
      category: 'work',
      weekdaysOnly: true,
      streak: 3,
      archived: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'test_weekly_1',
      name: 'Read a book',
      frequency: 'weekly',
      category: 'smarter',
      weeklyDays: [weekStart === 0 ? 1 : 1, 3, 5], // Mon, Wed, Fri
      weeklyTarget: 3,
      streak: 2,
      archived: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'test_weekly_2',
      name: 'Surprise gesture',
      frequency: 'weekly',
      category: 'romance',
      weeklyDays: [],
      weeklyTarget: 2,
      streak: 1,
      archived: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'test_weekly_3',
      name: 'Date night',
      frequency: 'weekly',
      category: 'romance',
      weeklyDays: [5], // Friday
      weeklyTarget: 1,
      streak: 4,
      archived: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'test_weekly_4',
      name: 'Team standup',
      frequency: 'weekly',
      category: 'work',
      weeklyDays: workdayPreset === 'sun-thu' ? [0, 1, 2, 3, 4] : [1, 2, 3, 4, 5],
      weeklyTarget: 5,
      streak: 8,
      archived: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'test_monthly_1',
      name: 'Book an event',
      frequency: 'monthly',
      category: 'fun',
      streak: 1,
      archived: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'test_social_1',
      name: 'Meet someone new',
      frequency: 'weekly',
      category: 'social',
      weeklyDays: [],
      weeklyTarget: 1,
      streak: 0,
      archived: false,
      createdAt: new Date().toISOString(),
    },
  ]

  // Completions — simulate a realistic mid-week state
  const completions = {}

  // Run 5km: done Sun, Mon, Tue (first 3 days if past)
  for (let i = 0; i < 3 && i < weekISOs.length; i++) {
    if (weekISOs[i] < todayISO || weekISOs[i] === todayISO) {
      completions[`test_daily_1_${weekISOs[i]}`] = true
    }
  }

  // Deep work: done Mon, Tue
  for (let i = 1; i < 3 && i < weekISOs.length; i++) {
    if (weekISOs[i] < todayISO) {
      completions[`test_daily_2_${weekISOs[i]}`] = true
    }
  }

  // Read a book: done Mon (1/3)
  if (weekISOs[1] < todayISO) {
    completions[`test_weekly_1_${weekISOs[1]}`] = true
  }

  // Team standup: done Mon, Tue, Wed
  for (let i = 1; i < 4 && i < weekISOs.length; i++) {
    if (weekISOs[i] < todayISO) {
      completions[`test_weekly_4_${weekISOs[i]}`] = true
    }
  }

  // Weekly schedules — set planned days for "Surprise gesture" this week
  const weeklySchedules = {
    [`test_weekly_2_${thisWeekKey}`]: [2, 4], // Wed + Thu
  }

  // Monthly schedules — Book an event planned for the 20th
  const monthlySchedules = {
    [`test_monthly_1_${thisMonthKey}`]: 20,
  }

  // Weekly intentions
  const weeklyIntentions = {
    [`test_weekly_1_${weekISOs[1]}`]: 'Finish chapter 5 of Atomic Habits',
    [`test_weekly_3_${weekISOs[5] || weekISOs[4]}`]: 'Dinner at the Italian place on Rothschild',
  }

  return { goals, completions, weeklySchedules, monthlySchedules, weeklyIntentions }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DateSimulator({ onDateChange }) {
  const realToday = localISO(new Date())
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('date') // 'date' | 'seed'
  const [selectedDate, setSelectedDate] = useState(realToday)
  const [active, setActive] = useState(false)
  const [seedStatus, setSeedStatus] = useState(null)

  const { goals, workdayPreset, addGoal, clearStore } = useStore()
  const hasSeedData = goals.some(g => g.id?.startsWith('test_'))

  function applyDate(iso) {
    setSelectedDate(iso)
    if (active) {
      setSimulatedDate(iso)
      onDateChange?.()
    }
  }

  function toggleActive() {
    const next = !active
    setActive(next)
    setSimulatedDate(next ? selectedDate : null)
    onDateChange?.()
  }

  function resetToToday() {
    setSelectedDate(realToday)
    setSimulatedDate(active ? realToday : null)
    onDateChange?.()
  }

  function loadSeedData() {
    const { goals: seedGoals, completions, weeklySchedules, monthlySchedules, weeklyIntentions } = buildSeedData(workdayPreset)

    // Add goals that don't already exist
    const existing = useStore.getState().goals.map(g => g.id)
    seedGoals.forEach(g => {
      if (!existing.includes(g.id)) addGoal(g)
    })

    // Merge completions, schedules, intentions into store
    useStore.setState(s => ({
      completions: { ...s.completions, ...completions },
      weeklySchedules: { ...(s.weeklySchedules || {}), ...weeklySchedules },
      monthlySchedules: { ...(s.monthlySchedules || {}), ...monthlySchedules },
      weeklyIntentions: { ...(s.weeklyIntentions || {}), ...weeklyIntentions },
    }))

    setSeedStatus('loaded')
    setTimeout(() => setSeedStatus(null), 3000)
    onDateChange?.()
  }

  function clearSeedData() {
    useStore.setState(s => ({
      goals: s.goals.filter(g => !g.id?.startsWith('test_')),
      completions: Object.fromEntries(
        Object.entries(s.completions).filter(([k]) => !k.startsWith('test_'))
      ),
      weeklySchedules: Object.fromEntries(
        Object.entries(s.weeklySchedules || {}).filter(([k]) => !k.startsWith('test_'))
      ),
      monthlySchedules: Object.fromEntries(
        Object.entries(s.monthlySchedules || {}).filter(([k]) => !k.startsWith('test_'))
      ),
      weeklyIntentions: Object.fromEntries(
        Object.entries(s.weeklyIntentions || {}).filter(([k]) => !k.startsWith('test_'))
      ),
    }))
    setSeedStatus('cleared')
    setTimeout(() => setSeedStatus(null), 2000)
    onDateChange?.()
  }

  const displayDate = parseLocalDate(selectedDate)
  const dayName = FULL_DAY_NAMES[displayDate.getDay()]
  const isToday = selectedDate === realToday

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[999]">
      {/* Pill */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold shadow-card border transition-all
          ${active ? 'bg-amber-400 text-amber-900 border-amber-500' : 'bg-bg-card text-text-sec border-border opacity-60 hover:opacity-100'}
          ${hasSeedData ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}>
        {active ? '🧪' : hasSeedData ? '🌱' : '🗓️'}
        {active ? `Simulating ${dayName}` : hasSeedData ? 'Seed active' : 'Date Sim'}
        <span className={`transition-transform inline-block ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-2 bg-bg-card rounded-card shadow-modal border border-border p-4 w-80">

          {/* Tabs */}
          <div className="flex gap-1.5 mb-4 bg-bg-surface rounded-xl p-1">
            {['date', 'seed'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all
                  ${tab === t ? 'bg-white text-brand-primary shadow-sm' : 'text-text-sec'}`}>
                {t === 'date' ? '📅 Date Sim' : '🌱 Test Data'}
              </button>
            ))}
          </div>

          {/* ── Date Tab ── */}
          {tab === 'date' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-text-pri">Simulate a date</p>
                <button onClick={toggleActive}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-pill border transition-all
                    ${active ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-bg-surface text-text-sec border-border'}`}>
                  {active ? '● ON' : '○ OFF'}
                </button>
              </div>

              <input type="date" value={selectedDate}
                onChange={(e) => e.target.value && applyDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg-surface text-sm text-text-pri mb-3 focus:outline-none focus:border-brand-primary"
              />

              <div className="flex gap-1.5 mb-3">
                {[-7, -1, +1, +7].map(n => (
                  <button key={n} onClick={() => applyDate(shiftISO(selectedDate, n))}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-semibold bg-bg-surface border border-border text-text-sec hover:border-brand-primary hover:text-brand-primary transition-all">
                    {n > 0 ? `+${n}d` : `${n}d`}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-text-sec mb-1.5">Jump to day this week:</p>
              <div className="flex gap-1 mb-3">
                {DAY_NAMES.map((name, i) => {
                  const iso = isoForWeekday(selectedDate, i)
                  const isSelected = displayDate.getDay() === i
                  return (
                    <button key={i} onClick={() => applyDate(iso)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all
                        ${isSelected ? 'bg-brand-primary text-white' : 'bg-bg-surface border border-border text-text-sec'}`}>
                      {name}
                    </button>
                  )
                })}
              </div>

              <div className={`rounded-xl p-2 text-center text-[11px] font-medium ${active ? 'bg-amber-50 text-amber-700' : 'bg-bg-surface text-text-sec'}`}>
                {active ? `🧪 Showing: ${dayName}, ${selectedDate}` : `Toggle ON to activate • real date: ${realToday}`}
              </div>

              {!isToday && (
                <button onClick={resetToToday}
                  className="w-full mt-2 py-2 rounded-xl text-xs font-semibold text-brand-primary border border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 transition-all">
                  ↩ Reset to today
                </button>
              )}
            </>
          )}

          {/* ── Seed Data Tab ── */}
          {tab === 'seed' && (
            <>
              <p className="text-xs font-bold text-text-pri mb-1">Test Data Seed</p>
              <p className="text-[11px] text-text-sec mb-4">
                Loads 8 goals covering every type + realistic completions for this week.
              </p>

              <div className="flex flex-col gap-2 mb-4 text-[11px] text-text-sec bg-bg-surface rounded-xl p-3">
                <p className="font-semibold text-text-pri mb-1">What's included:</p>
                <p>🏃 Run 5km — daily (3 done this week)</p>
                <p>💼 Deep work — daily, weekdays only</p>
                <p>📚 Read a book — weekly 3×, Mon/Wed/Fri</p>
                <p>💕 Surprise gesture — weekly 2×, no default days</p>
                <p>💕 Date night — weekly 1×, Fri</p>
                <p>💼 Team standup — weekly 5×, all workdays</p>
                <p>🎭 Book an event — monthly (planned 20th)</p>
                <p>🤝 Meet someone new — weekly 1×, flexible</p>
              </div>

              {seedStatus === 'loaded' && (
                <div className="bg-green-50 text-green-700 rounded-xl p-2.5 text-center text-[11px] font-semibold mb-3">
                  ✅ Test data loaded! Check the app.
                </div>
              )}
              {seedStatus === 'cleared' && (
                <div className="bg-red-50 text-red-600 rounded-xl p-2.5 text-center text-[11px] font-semibold mb-3">
                  🗑️ Test data cleared.
                </div>
              )}

              <button onClick={loadSeedData}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary/90 transition-all mb-2">
                🌱 Load Test Data
              </button>

              {hasSeedData && (
                <button onClick={clearSeedData}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-all">
                  🗑️ Clear Test Data
                </button>
              )}

              {!hasSeedData && (
                <p className="text-center text-[10px] text-text-mut mt-1">No test data loaded</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
