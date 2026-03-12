import { useState, useEffect } from 'react'
import { setSimulatedDate, isSimulating, getSimulatedDateISO } from '../../lib/simulatedDate'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function DateSimulator({ onDateChange }) {
  const realToday = new Date().toISOString().slice(0, 10)
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(realToday)
  const [active, setActive] = useState(false)

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
    if (next) {
      setSimulatedDate(selectedDate)
    } else {
      setSimulatedDate(null)
    }
    onDateChange?.()
  }

  function resetToToday() {
    setSelectedDate(realToday)
    setSimulatedDate(active ? realToday : null)
    onDateChange?.()
  }

  // Quick-jump: shift selected date by N days
  function shiftDate(days) {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const next = new Date(y, m - 1, d + days)
    const iso = next.toISOString().slice(0, 10)
    applyDate(iso)
  }

  const displayDate = new Date(selectedDate + 'T12:00:00')
  const dayName = FULL_DAY_NAMES[displayDate.getDay()]
  const isToday = selectedDate === realToday

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[999]">
      {/* Pill button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold shadow-card border transition-all
          ${active ? 'bg-amber-400 text-amber-900 border-amber-500' : 'bg-bg-card text-text-sec border-border opacity-60 hover:opacity-100'}`}>
        {active ? '🧪' : '🗓️'}
        {active ? `Simulating ${dayName}` : 'Date Sim'}
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-2 bg-bg-card rounded-card shadow-modal border border-border p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-text-pri">📅 Date Simulator</p>
            <button
              onClick={toggleActive}
              className={`text-[10px] font-semibold px-2 py-1 rounded-pill border transition-all
                ${active ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-bg-surface text-text-sec border-border'}`}>
              {active ? '● ON' : '○ OFF'}
            </button>
          </div>

          {/* Date picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => applyDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-border bg-bg-surface text-sm text-text-pri mb-3 focus:outline-none focus:border-brand-primary"
          />

          {/* Quick-shift buttons */}
          <div className="flex gap-1.5 mb-3">
            {[-7, -1, +1, +7].map(d => (
              <button key={d} onClick={() => shiftDate(d)}
                className="flex-1 py-1.5 rounded-xl text-[10px] font-semibold bg-bg-surface border border-border text-text-sec hover:border-brand-primary hover:text-brand-primary transition-all">
                {d > 0 ? `+${d}d` : `${d}d`}
              </button>
            ))}
          </div>

          {/* Day of week quick picker */}
          <p className="text-[10px] text-text-sec mb-1.5">Jump to day this week:</p>
          <div className="flex gap-1 mb-3">
            {DAY_NAMES.map((name, i) => {
              const [y, m, d] = selectedDate.split('-').map(Number)
              const cur = new Date(y, m - 1, d)
              const curDay = cur.getDay()
              const diff = i - curDay
              const target = new Date(y, m - 1, d + diff)
              const iso = target.toISOString().slice(0, 10)
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

          {/* Status */}
          <div className={`rounded-xl p-2 text-center text-[11px] font-medium ${active ? 'bg-amber-50 text-amber-700' : 'bg-bg-surface text-text-sec'}`}>
            {active
              ? `🧪 App showing: ${dayName}, ${selectedDate}`
              : `⬆ Turn ON to simulate — real date: ${realToday}`}
          </div>

          {!isToday && (
            <button onClick={resetToToday}
              className="w-full mt-2 py-2 rounded-xl text-xs font-semibold text-brand-primary border border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 transition-all">
              ↩ Reset to today
            </button>
          )}
        </div>
      )}
    </div>
  )
}
