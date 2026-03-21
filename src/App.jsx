import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'
import { exchangeCode } from './lib/spotifyAuth'
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
  const { user, setUser, onboardingComplete, activeTab, setSpotifyTokens } = useStore()
  const [dateKey, setDateKey] = useState(0)
  const [spotifyCallbackHandled, setSpotifyCallbackHandled] = useState(false)

  // Handle Spotify OAuth callback
  useEffect(() => {
    const path = window.location.pathname
    const params = new URLSearchParams(window.location.search)
    if (path === '/spotify-callback' && params.get('code')) {
      const code = params.get('code')
      const state = params.get('state')
      exchangeCode(code, state)
        .then(tokens => {
          setSpotifyTokens(tokens)
          window.history.replaceState({}, '', '/')
          setSpotifyCallbackHandled(true)
        })
        .catch(err => {
          console.error('Spotify auth failed:', err)
          window.history.replaceState({}, '', '/')
        })
    }
  }, [setSpotifyTokens])

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
