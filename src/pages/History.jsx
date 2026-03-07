import { useState } from 'react'
import { useStore, periodKey } from '../store/useStore'
import { CATEGORIES } from '../lib/constants'

export default function History() {
  const [tab, setTab] = useState('heatmap')
  const [search, setSearch] = useState('')
  const { journalEntries } = useStore()

  const filtered = journalEntries.filter((e) =>
    e.note.toLowerCase().includes(search.toLowerCase()) ||
    e.goalName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-bg-base pb-20">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-text-pri mb-4">History</h1>
        <div className="flex border-b-2 border-border">
          {['heatmap', 'journal'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 pb-3 text-sm font-medium transition-colors
                ${tab === t ? 'text-brand-primary font-semibold border-b-2 border-brand-primary -mb-[2px]' : 'text-text-sec'}`}>
              {t === 'heatmap' ? 'Heatmap 🗓️' : 'Journal 📖'}
            </button>
          ))}
        </div>
      </div>
      {tab === 'heatmap' && <HeatmapTab />}
      {tab === 'journal' && <JournalTab entries={filtered} search={search} setSearch={setSearch} />}
    </div>
  )
}

function HeatmapTab() {
  const { completions, goals } = useStore()
  const weeks = buildWeeks(completions, goals)

  return (
    <div className="px-5">
      <p className="text-sm font-semibold text-text-pri mb-3">
        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
      </p>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['M','T','W','T','F','S','S'].map((d,i) => (
          <div key={i} className="text-center text-[10px] text-text-sec">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((cell, di) => (
            <div key={di} className="aspect-square rounded"
              style={{
                background: cell.count > 0 ? '#43E97B' : '#E8E7F5',
                opacity: cell.count > 0 ? Math.min(0.4 + cell.count * 0.2, 1) : 1,
              }} />
          ))}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-3 mb-6">
        <span className="text-[11px] text-text-sec">Less</span>
        {[0.4, 0.6, 0.8, 1].map((o, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded" style={{ background: `rgba(67,233,123,${o})` }} />
        ))}
        <span className="text-[11px] text-text-sec">More</span>
      </div>
    </div>
  )
}

function JournalTab({ entries, search, setSearch }) {
  return (
    <div className="px-5">
      <div className="bg-bg-card rounded-card px-4 py-3 flex items-center gap-2 mb-4 border border-border">
        <span className="text-text-sec">🔍</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries..."
          className="flex-1 text-sm bg-transparent text-text-pri focus:outline-none placeholder:text-text-mut" />
      </div>
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-text-sec text-sm">No journal entries yet</p>
          <p className="text-text-mut text-xs mt-1">Complete a goal and drop a gold nugget</p>
        </div>
      ) : (
        entries.map((e) => {
          const cat = CATEGORIES.find((c) => c.id === e.category)
          return (
            <div key={e.id} className="bg-bg-card rounded-card p-4 mb-3 border border-border">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xl">{cat?.emoji}</span>
                <div>
                  <p className="font-semibold text-sm text-text-pri">{e.goalName}</p>
                  <p className="text-[11px] text-text-sec">
                    {cat?.label} · {new Date(e.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-sec leading-relaxed">"{e.note}"</p>
            </div>
          )
        })
      )}
    </div>
  )
}

function buildWeeks(completions, goals) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = now.getDate()

  // Count completions per date
  const countByDate = {}
  Object.keys(completions).forEach((key) => {
    if (!completions[key]) return
    // key format: goalId_YYYY-MM-DD or goalId_YYYY-Www or goalId_YYYY-MM
    const parts = key.split('_')
    const dateStr = parts[parts.length - 1]
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      countByDate[dateStr] = (countByDate[dateStr] || 0) + 1
    }
  })

  const offset = (firstDay + 6) % 7
  const cells = Array(offset).fill({ count: -1, future: false }) // -1 = padding
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const isFuture = d > today
    cells.push({ count: isFuture ? -1 : (countByDate[dateStr] || 0), date: dateStr, future: isFuture })
  }
  while (cells.length % 7 !== 0) cells.push({ count: -1, future: true })

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}
