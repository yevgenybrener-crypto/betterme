// ─── Spotify OAuth PKCE Flow ──────────────────────────────────────────────────
// Uses PKCE — no server-side secret needed, works in browser directly.

const CLIENT_ID = 'fd8814d237674f24ba3460df13a08ef7'
const REDIRECT_URI = window.location.hostname === 'localhost'
  ? 'http://localhost:5173/spotify-callback'
  : 'https://betterme.vercel.app/spotify-callback'

const SCOPES = [
  'user-read-recently-played',
  'user-library-read',
  'user-follow-read',
].join(' ')

// ─── PKCE helpers ─────────────────────────────────────────────────────────────
function generateRandom(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(b => chars[b % chars.length]).join('')
}

async function sha256(plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// ─── Start OAuth flow ─────────────────────────────────────────────────────────
export async function startSpotifyAuth() {
  const verifier = generateRandom(64)
  const challenge = base64urlEncode(await sha256(verifier))
  const state = generateRandom(16)

  localStorage.setItem('spotify_verifier', verifier)
  localStorage.setItem('spotify_state', state)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

// ─── Exchange code for tokens ─────────────────────────────────────────────────
export async function exchangeCode(code, returnedState) {
  const verifier = localStorage.getItem('spotify_verifier')
  const state = localStorage.getItem('spotify_state')

  if (returnedState !== state) throw new Error('State mismatch')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })

  if (!res.ok) throw new Error('Token exchange failed')
  const data = await res.json()

  localStorage.removeItem('spotify_verifier')
  localStorage.removeItem('spotify_state')

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
}

// ─── Refresh access token ──────────────────────────────────────────────────────
export async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) throw new Error('Token refresh failed')
  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
}
