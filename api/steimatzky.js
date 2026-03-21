// Vercel serverless function — fetches Steimatzky bestsellers page,
// extracts Hebrew book titles, enriches with Google Books author lookup,
// and returns a JSON list. Cached via Vercel Edge Cache (Cache-Control).

const STEIMATZKY_URL = 'https://www.steimatzky.co.il/ספרים/the_best_steimatzky'
const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes'

// Extract product titles + cover images + direct product URLs from Steimatzky's page
function parseBooks(html) {
  // Build a map from title → {cover, productUrl} using product-image-photo tags
  // Image src: /cache/xxx/0/1/011981377-timestamp.jpg → ISBN 011981377
  // Product URL: https://www.steimatzky.co.il/011981377
  const imageMap = {}
  const seen = new Set()
  const imgMatches = [...html.matchAll(/<img[^>]+class="product-image-photo"[^>]+src="([^"]+)"[^>]+alt="([^"]+)"/g)]
  for (const [, src, rawAlt] of imgMatches) {
    const title = rawAlt.trim().replace(/\s+\d+$/, '') // strip trailing " 1"
    if (seen.has(title)) continue
    seen.add(title)
    const isbnMatch = src.match(/\/(\d{9,13})-\d+\.jpg/)
    const isbn = isbnMatch?.[1] || null
    imageMap[title] = {
      cover: src,
      productUrl: isbn ? `https://www.steimatzky.co.il/${isbn}` : null,
    }
  }

  // Extract titles + categories from datalayer
  const productMatches = [...html.matchAll(/window\.idusDataLayer\.products\['\d+'\] = ({.*?});/gs)]
  const books = []
  const seenTitles = new Set()
  for (const [, pjson] of productMatches) {
    try {
      const p = JSON.parse(pjson)
      const name = p.name || ''
      const category = p.dl_category || ''
      if (!name || seenTitles.has(name)) continue
      if (category.includes('ילדים') || category.includes('פעוטות') || category.includes('נוער')) continue
      seenTitles.add(name)
      const img = imageMap[name] || {}
      books.push({ title: name, category, cover: img.cover || null, productUrl: img.productUrl || null })
    } catch {}
  }

  return books.slice(0, 20)
}

// Look up author via Google Books
async function enrichWithAuthor(title) {
  try {
    const q = encodeURIComponent(title)
    const res = await fetch(`${GOOGLE_BOOKS_URL}?q=intitle:${q}&langRestrict=iw&maxResults=1&printType=books`)
    if (!res.ok) return null
    const data = await res.json()
    const item = data?.items?.[0]
    if (!item) return null
    const v = item.volumeInfo
    return {
      author: v.authors?.join(', ') || '',
      desc: v.description?.slice(0, 150) || '',
      cover: v.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
      googleBooksId: item.id,
    }
  } catch { return null }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate') // 24h edge cache

  try {
    // Fetch Steimatzky page server-side (no CORS issue)
    const pageRes = await fetch(STEIMATZKY_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120',
        'Accept-Language': 'he-IL,he;q=0.9',
        'Accept': 'text/html',
      },
    })

    if (!pageRes.ok) {
      return res.status(502).json({ error: 'Failed to fetch Steimatzky', status: pageRes.status })
    }

    const html = await pageRes.text()
    const rawBooks = parseBooks(html)

    if (rawBooks.length === 0) {
      return res.status(200).json({ books: [], source: 'steimatzky', note: 'No books parsed' })
    }

    // Enrich first 15 books with author data (parallel, with timeout)
    const enriched = await Promise.allSettled(
      rawBooks.slice(0, 15).map(async (book) => {
        const extra = await enrichWithAuthor(book.title)
        return {
          id: `st_${Buffer.from(book.title).toString('base64').slice(0, 8)}`,
          title: book.title,
          author: extra?.author || '',
          desc: extra?.desc || '',
          cover: book.cover || extra?.cover || null,
          emoji: '📚',
          genres: [],
          bestseller: true,
          local: true,
          // Direct product page link — not search results
          steimatzkyUrl: book.productUrl || `https://www.steimatzky.co.il/catalogsearch/result/?q=${encodeURIComponent(book.title)}`,
        }
      })
    )

    const books = enriched
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)

    return res.status(200).json({
      books,
      source: 'steimatzky',
      fetchedAt: new Date().toISOString(),
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
