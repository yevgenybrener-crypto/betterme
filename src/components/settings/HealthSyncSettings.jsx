import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { isHealthKitAvailable, requestHealthKitPermissions } from '../../lib/healthKit'
import { runHealthSync } from '../../lib/healthSync'
import { Capacitor } from '@capacitor/core'

const WORKOUT_MAPPINGS = [
  { emoji: '🏃', label: 'Running', keywords: 'run, running, jog' },
  { emoji: '🚶', label: 'Walking', keywords: 'walk, walking, steps' },
  { emoji: '🚴', label: 'Cycling', keywords: 'bike, cycling, cycle' },
  { emoji: '🏋️', label: 'Gym / Weights', keywords: 'gym, workout, weights, strength' },
  { emoji: '🧘', label: 'Yoga / Meditation', keywords: 'yoga, meditat, mindful' },
  { emoji: '🏊', label: 'Swimming', keywords: 'swim, swimming' },
  { emoji: '⚽', label: 'Soccer / Football', keywords: 'soccer, football' },
  { emoji: '🎾', label: 'Tennis', keywords: 'tennis' },
]

export default function HealthSyncSettings() {
  const {
    healthKitEnabled, healthKitPermissionsGranted, healthStepsToday,
    setHealthKitEnabled, setHealthKitPermissionsGranted, goals,
  } = useStore()
  const store = useStore

  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const isNative = Capacitor.isNativePlatform()
  const isIOS = Capacitor.getPlatform() === 'ios'

  // Goals that would be auto-completed by Health
  const matchableGoals = (goals || []).filter(g => {
    const name = (g.name || '').toLowerCase()
    return WORKOUT_MAPPINGS.some(m =>
      m.keywords.split(', ').some(k => name.includes(k))
    )
  })

  async function handleEnable() {
    const granted = await requestHealthKitPermissions()
    if (granted) {
      setHealthKitPermissionsGranted(true)
      setHealthKitEnabled(true)
    }
  }

  async function handleManualSync() {
    setSyncing(true)
    const result = await runHealthSync(useStore)
    setLastSync(result)
    setSyncing(false)
  }

  // ── Web / Android: show coming soon ──
  if (!isIOS) {
    return (
      <div className="bg-bg-card rounded-2xl p-4 border border-border mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🍎</span>
          <div>
            <p className="font-semibold text-text-pri text-sm">Apple Health Sync</p>
            <p className="text-xs text-text-sec">iOS app required</p>
          </div>
        </div>
        <div className="bg-bg-surface rounded-xl p-3 border border-border/50">
          <p className="text-xs text-text-sec leading-relaxed">
            Health sync is available in the BetterMe iOS app. It automatically marks your fitness goals as done when you complete a workout.
          </p>
          {!isNative && (
            <p className="text-[11px] text-brand-primary font-semibold mt-2">
              📱 Download the iOS app to enable this feature
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── iOS native ──
  return (
    <div className="bg-bg-card rounded-2xl p-4 border border-border mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍎</span>
          <div>
            <p className="font-semibold text-text-pri text-sm">Apple Health Sync</p>
            <p className="text-xs text-text-sec">Auto-complete fitness goals</p>
          </div>
        </div>
        {/* Toggle */}
        {healthKitPermissionsGranted ? (
          <button
            onClick={() => setHealthKitEnabled(!healthKitEnabled)}
            className={`w-12 h-6 rounded-full transition-all relative ${healthKitEnabled ? 'bg-brand-primary' : 'bg-border'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${healthKitEnabled ? 'left-6' : 'left-0.5'}`} />
          </button>
        ) : (
          <button onClick={handleEnable}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-primary text-white">
            Connect
          </button>
        )}
      </div>

      {healthKitEnabled && (
        <>
          {/* Steps today */}
          {healthStepsToday !== null && (
            <div className="bg-green-50 rounded-xl p-3 border border-green-200 mb-3 flex items-center gap-2">
              <span className="text-xl">👟</span>
              <div>
                <p className="text-sm font-bold text-green-700">{healthStepsToday.toLocaleString()} steps today</p>
                <p className="text-[10px] text-green-600">Synced from Apple Health</p>
              </div>
            </div>
          )}

          {/* Matched goals */}
          {matchableGoals.length > 0 ? (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-mut mb-2">
                Auto-completing these goals
              </p>
              {matchableGoals.map(g => (
                <div key={g.id} className="flex items-center gap-2 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-accent flex-shrink-0" />
                  <p className="text-xs text-text-sec">{g.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-bg-surface rounded-xl p-3 border border-border/50 mb-3">
              <p className="text-xs text-text-mut">
                No fitness goals found. Create a goal with keywords like "run", "gym", "yoga", "walk" to auto-sync.
              </p>
            </div>
          )}

          {/* How it works */}
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-mut mb-2">
              How it works
            </p>
            <div className="space-y-1.5">
              {[
                'Open BetterMe after a workout',
                'Health data syncs automatically',
                'Matching goals get marked as done',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  <p className="text-xs text-text-sec">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Manual sync */}
          <button onClick={handleManualSync} disabled={syncing}
            className="w-full py-2.5 rounded-xl border border-border text-xs font-semibold text-text-sec bg-bg-surface disabled:opacity-50">
            {syncing ? '⏳ Syncing...' : '🔄 Sync now'}
          </button>

          {lastSync && (
            <p className="text-[10px] text-text-mut text-center mt-2">
              {lastSync.synced > 0
                ? `✅ ${lastSync.synced} goal${lastSync.synced > 1 ? 's' : ''} completed`
                : '✓ Already up to date'}
              {lastSync.steps !== null ? ` · ${lastSync.steps.toLocaleString()} steps` : ''}
            </p>
          )}
        </>
      )}

      {/* Workout mapping reference */}
      <details className="mt-3">
        <summary className="text-[10px] font-bold uppercase tracking-widest text-text-mut cursor-pointer">
          Keyword mapping ↓
        </summary>
        <div className="mt-2 space-y-1">
          {WORKOUT_MAPPINGS.map(m => (
            <div key={m.label} className="flex items-center gap-2 py-0.5">
              <span className="text-sm w-5">{m.emoji}</span>
              <span className="text-[11px] font-semibold text-text-sec w-28">{m.label}</span>
              <span className="text-[10px] text-text-mut">{m.keywords}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
