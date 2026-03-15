import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES, FREQUENCIES, TEMPLATES } from '../../lib/constants'
import { useStore } from '../../store/useStore'

const ALL_DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
]

function orderedDays(workdayPreset) {
  // Sun-first for sun-thu, Mon-first for mon-fri
  const startDay = workdayPreset === 'sun-thu' ? 0 : 1
  const sorted = [...ALL_DAYS].sort((a, b) => ((a.value - startDay + 7) % 7) - ((b.value - startDay + 7) % 7))
  return sorted
}

const defaultForm = {
  frequency: '',
  weeklyDays: [],   // default scheduled days (optional — empty = flexible)
  category: '',
  name: '',
  target: '',
  weekdaysOnly: false,
  weekendsOnly: false,
}

export default function HorizonWizard() {
  const { showWizard, setShowWizard, addGoal, workdayPreset } = useStore()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(defaultForm)
  const [dayError, setDayError] = useState(false)

  function reset() { setStep(1); setForm(defaultForm); setDayError(false) }
  function close() { setShowWizard(false); reset() }

  function handleCreate() {
    if (!form.name.trim()) return
    const goal = {
      id: Date.now().toString(),
      frequency: form.frequency,
      category: form.category,
      name: form.name,
      type: form.type,
      target: form.target,
      weekdaysOnly: form.weekdaysOnly,
      weekendsOnly: form.weekendsOnly,
      streak: 0,
      archived: false,
      createdAt: new Date().toISOString(),
    }
    if (form.frequency === 'weekly') {
      goal.weeklyDays = form.weeklyDays   // may be empty (flexible)
    }
    addGoal(goal)
    close()
  }

  function handleStep1Next() {
    if (!form.frequency) return
    setDayError(false)
    setStep(2)
  }

  function toggleDay(val) {
    setDayError(false)
    const current = form.weeklyDays
    if (current.includes(val)) {
      setForm({ ...form, weeklyDays: current.filter(d => d !== val) })
    } else {
      setForm({ ...form, weeklyDays: [...current, val] })
    }
  }

  const templates = form.category ? TEMPLATES[form.category] || [] : []
  const days = orderedDays(workdayPreset)

  return (
    <AnimatePresence>
      {showWizard && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50" onClick={close} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 bg-bg-base rounded-t-3xl z-50 shadow-modal max-h-[90vh] overflow-y-auto">

            <div className="p-5">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <button onClick={close} className="text-text-sec text-xl min-w-[44px] min-h-[44px] flex items-center">✕</button>
                <span className="text-xs font-medium text-text-sec">Step {step} of 3</span>
              </div>

              {/* Step indicator */}
              <div className="flex items-center mb-6">
                {[1,2,3].map((s, i) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-2.5 h-2.5 rounded-full ${step >= s ? 'bg-brand-primary' : 'border-2 border-border bg-white'}`} />
                    {i < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-brand-primary' : 'bg-border'}`} />}
                  </div>
                ))}
              </div>

              {/* Step 1: Frequency */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-text-pri mb-1">How often? 🗓️</h2>
                  <p className="text-sm text-text-sec mb-6">Choose the cadence for this goal.</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {FREQUENCIES.map((f) => (
                      <button key={f.id} onClick={() => setForm({ ...form, frequency: f.id })}
                        className={`rounded-card p-5 flex flex-col items-center gap-2 border-2 transition-all
                          ${form.frequency === f.id ? 'bg-brand-primary/5 border-brand-primary' : 'bg-bg-card border-border'}`}>
                        <span className="text-3xl">{f.emoji}</span>
                        <span className={`font-semibold text-sm ${form.frequency === f.id ? 'text-brand-primary' : 'text-text-pri'}`}>{f.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Daily: day schedule picker */}
                  {form.frequency === 'daily' && (
                    <div className="bg-bg-card rounded-card p-4 mb-5 border border-border">
                      <p className="font-semibold text-sm text-text-pri mb-3">Schedule</p>
                      <div className="flex gap-2">
                        {[
                          { label: 'Every day', value: 'all' },
                          { label: 'Weekdays', value: 'weekdays' },
                          { label: 'Weekends', value: 'weekends' },
                        ].map(opt => {
                          const active =
                            opt.value === 'weekdays' ? form.weekdaysOnly :
                            opt.value === 'weekends' ? form.weekendsOnly :
                            !form.weekdaysOnly && !form.weekendsOnly
                          return (
                            <button key={opt.value}
                              onClick={() => setForm({
                                ...form,
                                weekdaysOnly: opt.value === 'weekdays',
                                weekendsOnly: opt.value === 'weekends',
                              })}
                              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all
                                ${active
                                  ? 'bg-brand-primary text-white shadow-sm'
                                  : 'bg-bg-surface text-text-sec border border-border'}`}>
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Weekly: optional day picker */}
                  <AnimatePresence>
                    {form.frequency === 'weekly' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-5">
                        <div className="bg-bg-card rounded-card p-4 border border-border">
                          <p className="text-xs font-semibold text-text-pri mb-1">Which days will you do this?</p>
                          <p className="text-[11px] text-text-sec mb-3">Optional — you can always set or change days later</p>
                          <div className="flex flex-wrap gap-2">
                            {days.map((d) => (
                              <button key={d.value}
                                onClick={() => toggleDay(d.value)}
                                className={`px-3 py-2 rounded-pill text-xs font-semibold border transition-all
                                  ${form.weeklyDays.includes(d.value) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-bg-surface border-border text-text-sec'}`}>
                                {d.label}
                              </button>
                            ))}
                          </div>
                          {form.weeklyDays.length > 0 && (
                            <p className="text-[11px] text-brand-primary mt-2 font-semibold">
                              ✓ {form.weeklyDays.length} day{form.weeklyDays.length !== 1 ? 's' : ''} selected
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button onClick={handleStep1Next}
                    className={`w-full py-4 rounded-card font-semibold text-sm text-white transition-opacity ${form.frequency ? 'bg-brand-primary' : 'bg-brand-primary/40'}`}>
                    Next →
                  </button>
                </div>
              )}

              {/* Step 2: Category */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-text-pri mb-1">What area of life? 🌱</h2>
                  <p className="text-sm text-text-sec mb-5">Pick the domain this goal belongs to.</p>
                  <div className="grid grid-cols-3 gap-2.5 mb-6">
                    {CATEGORIES.map((c) => (
                      <button key={c.id} onClick={() => setForm({ ...form, category: c.id })}
                        className={`rounded-[14px] p-3 flex flex-col items-center justify-center gap-1.5 border-[1.5px] transition-all min-h-[80px]
                          ${form.category === c.id ? 'border-2' : 'border-border bg-bg-card'}`}
                        style={form.category === c.id ? { borderColor: c.color, background: `${c.color}11` } : {}}>
                        <span className="text-2xl">{c.emoji}</span>
                        <span className="text-[11px] font-semibold text-text-pri text-center leading-tight line-clamp-2"
                          style={form.category === c.id ? { color: c.color } : {}}>
                          {c.label}
                        </span>
                      </button>
                    ))}
                    <div className="rounded-[14px] p-3 flex flex-col items-center justify-center gap-1.5 border border-border bg-bg-surface opacity-40 min-h-[80px]">
                      <span className="text-2xl">🧘</span>
                      <span className="text-[11px] font-semibold text-text-sec">Zen 🔒</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-card border border-border text-text-sec font-semibold text-sm bg-bg-card">← Back</button>
                    <button onClick={() => form.category && setStep(3)}
                      className={`flex-1 py-4 rounded-card font-semibold text-sm text-white ${form.category ? 'bg-brand-primary' : 'bg-brand-primary/40'}`}>
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Intention */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-text-pri mb-1">What's the goal? ✏️</h2>
                  <p className="text-sm text-text-sec mb-5">Name it and choose how to track it.</p>

                  <label className="text-[11px] font-semibold uppercase tracking-widest text-text-sec mb-1.5 block">Goal name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Run 5km"
                    className="w-full px-4 py-3 rounded-card border-2 border-brand-primary bg-bg-card text-sm text-text-pri mb-4 focus:outline-none" />



                  {templates.length > 0 && (
                    <>
                      <label className="text-[11px] font-semibold uppercase tracking-widest text-text-sec mb-2 block">Suggestions</label>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {templates.map((t) => (
                          <button key={t} onClick={() => setForm({ ...form, name: t.replace(/^[\S]+\s/, '') })}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all
                              ${form.name === t.replace(/^[\S]+\s/, '') ? 'bg-brand-primary/8 border-brand-primary text-brand-primary' : 'bg-bg-card border-border text-text-sec'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-card border border-border text-text-sec font-semibold text-sm bg-bg-card">← Back</button>
                    <button onClick={handleCreate}
                      className={`flex-1 py-4 rounded-card font-semibold text-sm text-white ${form.name.trim() ? 'bg-brand-accent' : 'bg-brand-accent/40'}`}>
                      Create ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
