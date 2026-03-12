import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import History from './pages/History'
import Settings from './pages/Settings'
import BottomNav from './components/ui/BottomNav'
import FAB from './components/ui/FAB'
import Toast from './components/ui/Toast'
import HorizonWizard from './components/wizard/HorizonWizard'
import DateSimulator from './components/debug/DateSimulator'

export default function App() {
  const { user, setUser, onboardingComplete, activeTab } = useStore()
  // Increment this key to force re-render of date-sensitive components when sim date changes
  const [dateKey, setDateKey] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!user) return <Auth />
  if (!onboardingComplete) return <Onboarding />

  return (
    <div className="min-h-screen bg-bg-base">
      <DateSimulator onDateChange={() => setDateKey(k => k + 1)} />
      <div key={dateKey}>
        {activeTab === 'home' && <Home />}
        {activeTab === 'history' && <History />}
        {activeTab === 'settings' && <Settings />}
      </div>
      <BottomNav />
      {activeTab === 'home' && <FAB />}
      <HorizonWizard />
      <Toast />
    </div>
  )
}
