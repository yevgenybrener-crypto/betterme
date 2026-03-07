import { useEffect } from 'react'
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

export default function App() {
  const { user, setUser, onboardingComplete, activeTab } = useStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!user) return <Auth />
  if (!onboardingComplete) return <Onboarding />

  return (
    <div className="min-h-screen bg-bg-base">
      {activeTab === 'home' && <Home />}
      {activeTab === 'history' && <History />}
      {activeTab === 'settings' && <Settings />}
      <BottomNav />
      <FAB />
      <HorizonWizard />
      <Toast />
    </div>
  )
}
