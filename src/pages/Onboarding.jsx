import { useState } from 'react'
import { useStore } from '../store/useStore'
import { WORKDAY_PRESETS } from '../lib/constants'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [preset, setPreset] = useState('mon-fri')
  const [time, setTime] = useState('08:00')
  const { setOnboarding } = useStore()

  function finish() {
    const p = WORKDAY_PRESETS.find((p) => p.id === preset)
    setOnboarding({ workdayPreset: preset, workdays: p.days, reminderTime: time })
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-12 pb-8">
        {[1,2].map((s) => (
          <div key={s} className={`w-2 h-2 rounded-full transition-all ${step === s ? 'bg-brand-primary w-5' : 'bg-border'}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🌍</div>
              <h2 className="text-2xl font-bold text-text-pri mb-2">When do you work?</h2>
              <p className="text-sm text-text-sec">We'll track your habits on active days only.</p>
            </div>
            <div className="space-y-3 mb-8">
              {WORKDAY_PRESETS.map((p) => (
                <button key={p.id} onClick={() => setPreset(p.id)}
                  className={`w-full rounded-card p-4 flex items-center gap-4 border-[1.5px] transition-all text-left
                    ${preset === p.id ? 'border-brand-primary bg-brand-primary/5' : 'border-border bg-bg-card'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${preset === p.id ? 'border-brand-primary' : 'border-border'}`}>
                    {preset === p.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${preset === p.id ? 'text-brand-primary' : 'text-text-pri'}`}>{p.label}</p>
                    <p className="text-xs text-text-sec mt-0.5">{p.description}</p>
                  </div>
                  {p.id === 'mon-fri' && (
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-pill bg-brand-primary/10 text-brand-primary">Default</span>
                  )}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)}
              className="w-full py-4 rounded-card bg-brand-primary text-white font-semibold">
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">⏰</div>
              <h2 className="text-2xl font-bold text-text-pri mb-2">Your morning check-in</h2>
              <p className="text-sm text-text-sec">We'll send a daily reminder at this time.</p>
            </div>
            <div className="bg-bg-card rounded-card p-6 border border-border flex items-center justify-center mb-8 shadow-card">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="text-4xl font-bold text-text-pri bg-transparent border-none focus:outline-none" />
            </div>
            <button onClick={finish}
              className="w-full py-4 rounded-card bg-brand-primary text-white font-semibold">
              Let's go 🚀
            </button>
          </>
        )}
      </div>
    </div>
  )
}
