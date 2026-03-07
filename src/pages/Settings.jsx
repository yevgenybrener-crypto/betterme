import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { WORKDAY_PRESETS } from '../lib/constants'

export default function Settings() {
  const { user, setUser, reminderTime, workdayPreset, setOnboarding, clearStore } = useStore()

  async function handleSignOut() {
    await supabase.auth.signOut()
    clearStore()
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-bg-base pb-20">
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-text-pri">Settings ⚙️</h1>
      </div>

      {/* Account */}
      <section className="px-5 mb-6">
        <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-mut mb-2">Account</p>
        <div className="bg-bg-card rounded-card p-4 border border-border">
          <p className="font-semibold text-sm text-text-pri">{user?.user_metadata?.full_name || 'Your Account'}</p>
          <p className="text-xs text-text-sec mt-0.5">{user?.email}</p>
        </div>
      </section>

      {/* Notifications */}
      <section className="px-5 mb-6">
        <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-mut mb-2">Notifications</p>
        <div className="bg-bg-card rounded-card p-4 border border-border flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-text-pri">Morning reminder</p>
            <p className="text-xs text-text-sec mt-0.5">{reminderTime || '08:00'}</p>
          </div>
          <input type="time" value={reminderTime || '08:00'}
            onChange={(e) => setOnboarding({ reminderTime: e.target.value })}
            className="text-sm text-brand-primary font-semibold bg-transparent border-none focus:outline-none" />
        </div>
      </section>

      {/* Workdays */}
      <section className="px-5 mb-8">
        <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-mut mb-2">Workdays</p>
        <div className="bg-bg-card rounded-card border border-border overflow-hidden">
          {WORKDAY_PRESETS.map((p, i) => (
            <button key={p.id} onClick={() => setOnboarding({ workdayPreset: p.id, workdays: p.days })}
              className={`w-full p-4 flex items-center gap-3 text-left ${i > 0 ? 'border-t border-border' : ''}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${workdayPreset === p.id ? 'border-brand-primary' : 'border-border'}`}>
                {workdayPreset === p.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
              </div>
              <div>
                <p className={`font-semibold text-sm ${workdayPreset === p.id ? 'text-brand-primary' : 'text-text-pri'}`}>{p.label}</p>
                <p className="text-xs text-text-sec mt-0.5">{p.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Sign out */}
      <div className="px-5">
        <button onClick={handleSignOut}
          className="w-full py-3.5 rounded-card border border-red-200 text-red-500 font-semibold text-sm">
          Sign out
        </button>
      </div>
    </div>
  )
}
