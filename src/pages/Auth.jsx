import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleMagicLink(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  async function handleGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🏃</div>
          <h1 className="text-3xl font-bold text-text-pri">BetterMe</h1>
          <p className="text-text-sec mt-2 text-sm">Your life balance dashboard</p>
        </div>

        {sent ? (
          <div className="text-center bg-bg-card rounded-card p-6 border border-border shadow-card">
            <div className="text-4xl mb-3">📧</div>
            <h2 className="font-bold text-text-pri mb-2">Check your email</h2>
            <p className="text-sm text-text-sec">We sent a magic link to <strong>{email}</strong></p>
            <button onClick={() => setSent(false)} className="mt-4 text-brand-primary text-sm font-medium">
              Use a different email
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button onClick={handleGoogle} disabled={loading}
              className="w-full py-4 rounded-card bg-white border border-border flex items-center justify-center gap-3 font-semibold text-sm text-text-pri shadow-card hover:shadow-card-hover transition-shadow">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.8 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.2 0-9.6-3.1-11.2-7.5L6 33.8C9.4 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6.2 5.2C41.1 35.2 44 30 44 24c0-1.3-.1-2.7-.4-3.9z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-mut">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleMagicLink} className="space-y-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3.5 rounded-card border border-border bg-bg-card text-sm focus:outline-none focus:border-brand-primary text-text-pri placeholder:text-text-mut" />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={loading || !email}
                className="w-full py-4 rounded-card bg-brand-primary text-white font-semibold text-sm disabled:opacity-50">
                {loading ? 'Sending...' : 'Continue with Email ✉️'}
              </button>
            </form>

            <p className="text-center text-xs text-text-mut mt-4">
              By continuing you agree to our Terms of Service
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
