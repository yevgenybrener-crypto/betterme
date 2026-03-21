// ─── NYT Books API ────────────────────────────────────────────────────────────
// Fetches current NYT bestseller lists and caches in localStorage for 24h.
// API key: set VITE_NYT_API_KEY in .env
// Free tier: https://developer.nytimes.com/ (register → create app → Books API)

const NYT_KEY = import.meta.env.VITE_NYT_API_KEY || 'LRPibRLWGRkaxwarekLbH0tnvtRzOEzYQ5xl8liln9a70R6u'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

const LISTS = [
  { id: 'hardcover-nonfiction', label: 'Non-fiction' },
  { id: 'hardcover-fiction',    label: 'Fiction' },
  { id: 'business-books',       label: 'Business' },
  { id: 'science',              label: 'Science' },
]

function cacheKey(listId) {
  return `nyt_books_${listId}`
}

function getCached(listId) {
  try {
    const raw = localStorage.getItem(cacheKey(listId))
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCache(listId, data) {
  try {
    localStorage.setItem(cacheKey(listId), JSON.stringify({ ts: Date.now(), data }))
  } catch {}
}

// Fetch a single NYT list, with cache
async function fetchList(listId) {
  const cached = getCached(listId)
  if (cached) return cached

  if (!NYT_KEY) return null

  const url = `https://api.nytimes.com/svc/books/v3/lists/current/${listId}.json?api-key=${NYT_KEY}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const books = (json?.results?.books || []).map(b => ({
      id: `nyt_${b.primary_isbn13 || b.rank}`,
      title: b.title,
      author: b.author,
      desc: b.description,
      emoji: '📖',
      cover: b.book_image || null,
      genres: [],
      bestseller: true,
      nyt: true,
      nytWeeks: b.weeks_on_list,
      nytRank: b.rank,
      amazonUrl: b.buy_links?.find(l => l.name === 'Amazon')?.url || null,
    }))
    setCache(listId, books)
    return books
  } catch { return null }
}

// Fetch all lists merged, deduplicated by title
export async function fetchNYTBestsellers() {
  // Fetch sequentially to avoid rate limits (NYT free tier: 10 req/min)
  const results = []
  for (const l of LISTS) {
    try {
      const books = await fetchList(l.id)
      results.push(books)
    } catch (e) {
      console.warn(`NYT list ${l.id} failed:`, e)
      results.push(null)
    }
    // Small delay between requests to stay within rate limits
    await new Promise(r => setTimeout(r, 200))
  }
  const seen = new Set()
  const merged = []
  results.forEach(list => {
    if (!list) return
    list.forEach(b => {
      const key = b.title.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(b)
      }
    })
  })
  console.log(`NYT: fetched ${merged.length} books`)
  return merged
}

// Clear NYT cache (force re-fetch)
export function clearNYTCache() {
  LISTS.forEach(l => localStorage.removeItem(cacheKey(l.id)))
}

export function hasNYTKey() {
  return !!NYT_KEY
}
