import { useState } from 'react'
import { useStore } from '../store/useStore'
import { CATEGORIES } from '../lib/constants'
import TrendsTab from '../components/history/TrendsTab'
import LibraryTab from '../components/library/LibraryShelf'

const TABS = [
  { id: 'trends',  label: 'Trends 📈' },
  { id: 'library', label: 'Library 🗂️' },
  { id: 'journal', label: 'Journal 📖' },
]

export default function History() {
  const [tab, setTab] = useState('trends')
  const [search, setSearch] = useState('')
  const { journalEntries, lifeLibrary } = useStore()

  const filtered = journalEntries.filter((e) =>
    e.note.toLowerCase().includes(search.toLowerCase()) ||
    e.goalName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-bg-base pb-20">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-text-pri mb-4">History</h1>
        <div className="flex border-b-2 border-border">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 pb-3 text-sm font-medium transition-colors
                ${tab === t.id ? 'text-brand-primary font-semibold border-b-2 border-brand-primary -mb-[2px]' : 'text-text-sec'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === 'trends'  && <TrendsTab />}
      {tab === 'library' && <LibraryTab lifeLibrary={lifeLibrary || []} />}
      {tab === 'journal' && <JournalTab entries={filtered} search={search} setSearch={setSearch} />}
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


