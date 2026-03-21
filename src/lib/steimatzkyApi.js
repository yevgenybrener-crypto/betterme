// ─── Steimatzky Live Bestsellers ─────────────────────────────────────────────
// Calls our Vercel serverless proxy (/api/steimatzky) which scrapes the
// Steimatzky bestsellers page and enriches with Google Books author data.
// Results cached in localStorage for 24h.

const CACHE_KEY = 'steimatzky_books'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {}
}

export async function fetchSteimatzkyBestsellers() {
  const cached = getCached()
  if (cached) return cached

  try {
    const res = await fetch('/api/steimatzky')
    if (!res.ok) return null
    const json = await res.json()
    const books = json.books || []
    if (books.length > 0) setCache(books)
    return books
  } catch (err) {
    console.warn('Steimatzky fetch failed:', err)
    return null
  }
}

export function clearSteimatzkyCache() {
  localStorage.removeItem(CACHE_KEY)
}
