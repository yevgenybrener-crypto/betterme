import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ISBNScanner from './ISBNScanner'
import {
  BOOKS, BOOKS_IL, GENRES, GENRE_COLORS,
  getPersonalizedBooks, getBestsellers, getLocalBestsellers, getBooksByGenre,
  getBuyUrl, getStoreName, getStoreEmoji,
} from '../../lib/bookData'
import { fetchNYTBestsellers, hasNYTKey } from '../../lib/nytApi'
import { fetchSteimatzkyBestsellers, clearSteimatzkyCache } from '../../lib/steimatzkyApi'
import { useStore } from '../../store/useStore'

// Detect Israel from workdayPreset
function useIsIsrael() {
  const workdayPreset = useStore(s => s.workdayPreset)
  return workdayPreset === 'sun-thu'
}

// ─── Book Completion Modal ────────────────────────────────────────────────────
function BookCompleteModal({ goal, book, isIsrael, onSave, onSkip }) {
  const [note, setNote] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-end"
      onClick={onSkip}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        className="w-full bg-bg-base rounded-t-3xl p-5 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

        <p className="text-xl font-bold text-text-pri text-center mb-1">🎉 Nice work!</p>
        <p className="text-sm text-text-sec text-center mb-5">You finished this book</p>

        {/* Book card */}
        <div className="bg-bg-surface rounded-2xl p-4 flex gap-3 items-center mb-5 border border-border">
          <span className="text-4xl flex-shrink-0">{book.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-pri">{book.title}</p>
            <p className="text-xs text-text-sec mt-0.5">{book.author}</p>
          </div>
          <a
            href={getBuyUrl(book, isIsrael)}
            target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-bg-surface border border-border text-text-sec"
            onClick={e => e.stopPropagation()}
          >
            {getStoreEmoji(isIsrael)} {getStoreName(isIsrael)}
          </a>
        </div>

        <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-2">Your takeaway</p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Drop a golden nugget — what did you learn or feel?"
          className="w-full min-h-[72px] px-4 py-3 rounded-2xl border-2 bg-bg-surface text-base text-text-pri placeholder:text-text-mut resize-none focus:outline-none leading-relaxed"
          style={{ borderColor: note ? '#6C63FF' : 'rgba(108,99,255,0.25)' }}
        />
        <p className="text-[10px] text-text-mut mt-1 mb-4 pl-1">Optional — auto-saves on close</p>

        <button onClick={() => onSave(note)}
          className="w-full py-4 rounded-2xl bg-brand-primary text-white font-bold text-sm mb-2">
          Save to my library 📚
        </button>
        <button onClick={onSkip}
          className="w-full py-3 text-text-mut text-sm font-semibold">
          Skip
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Book title display (Hebrew + English subtitle) ──────────────────────────
function BookTitle({ book, url }) {
  const isHebrew = /[\u0590-\u05FF]/.test(book.title)
  const content = (
    <span>
      <span dir={isHebrew ? 'rtl' : 'ltr'} className="block leading-snug">{book.title}</span>
      {book.titleEn && (
        <span className="text-[10px] text-text-mut font-normal">{book.titleEn}</span>
      )}
    </span>
  )
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="text-[13px] font-bold text-text-pri hover:text-brand-primary transition-colors flex flex-col gap-0.5">
        {content}
      </a>
    )
  }
  return <p className="text-[13px] font-bold text-text-pri flex flex-col gap-0.5">{content}</p>
}

// ─── Genre tag ────────────────────────────────────────────────────────────────
function GenreTag({ genre }) {
  const colors = GENRE_COLORS[genre] || { bg: '#F5F4FF', text: '#6C63FF' }
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-pill"
      style={{ background: colors.bg, color: colors.text }}>
      {genre.charAt(0).toUpperCase() + genre.slice(1)}
    </span>
  )
}

// ─── Book Card ────────────────────────────────────────────────────────────────
function BookCard({ book, isIsrael, onStart, onSave, isSaved }) {
  // Priority: direct product URL > amazonUrl > store search
  const buyUrl = book.steimatzkyUrl || book.amazonUrl || getBuyUrl(book, isIsrael && book.local)
  const storeName = book.steimatzkyUrl ? 'Steimatzky' : book.amazonUrl ? 'Amazon' : getStoreName(isIsrael && book.local)
  const storeEmoji = book.steimatzkyUrl ? '🇮🇱' : book.amazonUrl ? '🛒' : getStoreEmoji(isIsrael && book.local)

  return (
    <div className="flex gap-3 p-3 rounded-2xl border border-border bg-bg-card mb-2">
      {/* Book cover — tappable → store link */}
      <a
        href={buyUrl} target="_blank" rel="noopener noreferrer"
        className="w-11 h-[58px] rounded-lg flex items-center justify-center text-2xl flex-shrink-0 bg-bg-surface active:opacity-70 overflow-hidden"
        title={`View on ${storeName}`}
      >
        {book.cover
          ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover rounded-lg" />
          : book.emoji
        }
      </a>

      <div className="flex-1 min-w-0">
        <BookTitle book={book} url={buyUrl} />
        <p className="text-[11px] text-text-sec mt-0.5">{book.author}</p>
        {book.desc && <p className="text-[11px] text-text-mut mt-1.5 leading-relaxed line-clamp-2">{book.desc}</p>}
        <div className="flex gap-1 mt-1.5 flex-wrap items-center">
          {book.genres.map(g => <GenreTag key={g} genre={g} />)}
          {book.bestseller && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-pill bg-orange-100 text-orange-600">🏆 Bestseller</span>
          )}
          {book.local && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-pill bg-blue-50 text-blue-600">🇮🇱 Local</span>
          )}
          {book.nyt && book.nytRank && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-pill bg-orange-50 text-orange-600">NYT #{book.nytRank}</span>
          )}
          {book.nytWeeks > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-pill bg-yellow-50 text-yellow-700">{book.nytWeeks}w on list</span>
          )}
        </div>
        {/* Store link row */}
        <a
          href={buyUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-brand-primary opacity-70 hover:opacity-100 transition-opacity"
        >
          {storeEmoji} View on {storeName} ↗
        </a>
      </div>

      <div className="flex flex-col gap-1.5 flex-shrink-0 justify-start pt-0.5">
        <button onClick={onStart}
          className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-brand-primary text-white whitespace-nowrap">
          📖 Start
        </button>
        <button onClick={onSave}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all
            ${isSaved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-bg-surface text-brand-primary border border-brand-primary/30'}`}>
          {isSaved ? '✓ Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  )
}

// ─── Main BookPanel ───────────────────────────────────────────────────────────
export default function BookPanel({ goal }) {
  const {
    getReadingHistory, addReadingEntry,
    getCurrentBook, setCurrentBook, clearCurrentBook,
  } = useStore()
  const isIsrael = useIsIsrael()

  const [activeFilter, setActiveFilter] = useState('foryou')
  const [search, setSearch] = useState('')
  const [savedIds, setSavedIds] = useState([])
  const [completingBook, setCompletingBook] = useState(null)
  const [nytBooks, setNytBooks] = useState([])
  const [nytLoading, setNytLoading] = useState(false)
  const [liveLocalBooks, setLiveLocalBooks] = useState([])
  const [localLoading, setLocalLoading] = useState(false)
  // Google Books search (used by Search tab + auto-fallback in main search)
  const [gbQuery, setGbQuery] = useState('')
  const [gbResults, setGbResults] = useState([])
  const [gbLoading, setGbLoading] = useState(false)
  const [gbSearched, setGbSearched] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const history = getReadingHistory(goal.id)
  const readBookIds = history.map(e => e.bookId)
  const currentBook = getCurrentBook(goal.id)

  const allBooks = isIsrael ? [...BOOKS, ...BOOKS_IL] : BOOKS

  // Fetch NYT bestsellers eagerly on mount
  useEffect(() => {
    if (!hasNYTKey()) return
    setNytLoading(true)
    fetchNYTBestsellers()
      .then(books => { if (books && books.length > 0) setNytBooks(books) })
      .catch(err => console.warn('NYT fetch failed:', err))
      .finally(() => setNytLoading(false))
  }, [])

  // Fetch live Steimatzky list on mount (Israel only)
  useEffect(() => {
    if (!isIsrael) return
    setLocalLoading(true)
    fetchSteimatzkyBestsellers()
      .then(books => { if (books && books.length > 0) setLiveLocalBooks(books) })
      .catch(err => console.warn('Steimatzky fetch failed:', err))
      .finally(() => setLocalLoading(false))
  }, [isIsrael])

  async function searchGoogleBooks(q) {
    if (!q.trim()) return
    setGbLoading(true)
    setGbSearched(true)
    try {
      // Try Google Books first
      const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&printType=books`
      const gbRes = await fetch(gbUrl)
      const gbData = await gbRes.json()
      let books = (gbData.items || []).map(item => {
        const info = item.volumeInfo || {}
        const isbn = info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier
          || info.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier
        return {
          id: `gb_${item.id}`,
          title: info.title || 'Unknown',
          author: info.authors?.join(', ') || '',
          desc: info.description?.slice(0, 180) || '',
          cover: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
          emoji: '📚',
          genres: (info.categories || []).map(c => c.toLowerCase().split(' / ')[0]).slice(0, 2),
          bestseller: false, local: false,
          amazonUrl: isbn ? `https://www.amazon.com/dp/${isbn}` : `https://www.amazon.com/s?k=${encodeURIComponent(info.title)}`,
          buyUrl: isbn ? `https://www.amazon.com/dp/${isbn}` : null,
          source: 'google',
        }
      })

      // Fallback to Open Library if Google Books returned nothing (good for Hebrew/international books)
      if (books.length === 0) {
        const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=key,title,author_name,isbn,cover_i,subject&limit=10`
        const olRes = await fetch(olUrl)
        const olData = await olRes.json()
        books = (olData.docs || []).slice(0, 10).map((doc, i) => {
          const isbn = doc.isbn?.[0] || null
          const cover = doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : null
          return {
            id: `ol_${doc.key || i}`,
            title: doc.title || 'Unknown',
            author: doc.author_name?.join(', ') || '',
            desc: '',
            cover,
            emoji: '📚',
            genres: (doc.subject || []).slice(0, 2).map(s => s.toLowerCase()),
            bestseller: false, local: false,
            amazonUrl: isbn ? `https://www.amazon.com/dp/${isbn}` : `https://www.amazon.com/s?k=${encodeURIComponent(doc.title)}`,
            buyUrl: isbn ? `https://www.amazon.com/dp/${isbn}` : null,
            source: 'openlibrary',
          }
        })
      }

      setGbResults(books)
    } catch { setGbResults([]) }
    setGbLoading(false)
  }
  // Auto-search Google Books when main search has no local results
  useEffect(() => {
    if (!search.trim()) { setGbResults([]); setGbSearched(false); return }
    const localHits = [...allBooks, ...nytBooks].filter(b =>
      !readBookIds.includes(b.id) &&
      (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))
    )
    if (localHits.length > 0) { setGbResults([]); setGbSearched(false); return }
    // No local results → debounce Google Books search
    const timer = setTimeout(() => searchGoogleBooks(search), 600)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const personalizedBooks = useMemo(
    () => getPersonalizedBooks(readBookIds, isIsrael),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [readBookIds.join(','), isIsrael]
  )
  const bestsellerBooks = useMemo(
    () => getBestsellers(readBookIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [readBookIds.join(',')]
  )
  const localBooks = useMemo(
    () => getLocalBestsellers(readBookIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [readBookIds.join(',')]
  )

  function getFilteredBooks() {
    if (search.trim()) {
      const q = search.toLowerCase()
      const searchPool = [...allBooks, ...nytBooks]
      return searchPool.filter(b =>
        !readBookIds.includes(b.id) &&
        (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
      )
    }
    if (effectiveFilter === 'foryou')      return personalizedBooks
    if (effectiveFilter === 'bestsellers') {
      const nytUnread = nytBooks.filter(b => !readBookIds.includes(b.id))
      return nytUnread.length > 0 ? nytUnread : bestsellerBooks
    }
    if (effectiveFilter === 'local') {
      const unreadLive = liveLocalBooks.filter(b => !readBookIds.includes(b.id))
      return unreadLive.length > 0 ? unreadLive : localBooks
    }
    if (effectiveFilter === 'all') return allBooks.filter(b => !readBookIds.includes(b.id))
    return getBooksByGenre(effectiveFilter, readBookIds, isIsrael)
  }

  function handleStart(book) {
    setCurrentBook(goal.id, { ...book, startedAt: new Date().toISOString() })
  }

  function handleDone() {
    if (!currentBook) return
    setCompletingBook(currentBook)
  }

  function handleSaveComplete(note) {
    const entry = {
      bookId: completingBook.id,
      title: completingBook.title,
      author: completingBook.author,
      emoji: completingBook.emoji,
      genres: completingBook.genres,
      cover: completingBook.cover || null,
      buyUrl: completingBook.steimatzkyUrl || completingBook.amazonUrl || null,
      note,
      completedAt: new Date().toISOString(),
    }
    addReadingEntry(goal.id, entry)
    clearCurrentBook(goal.id)
    setCompletingBook(null)
  }

  function toggleSave(bookId) {
    setSavedIds(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    )
  }

  const forYouUnlocked = history.length >= 3

  const filters = [
    ...(forYouUnlocked ? [{ id: 'foryou', label: '✨ For You' }] : []),
    { id: 'bestsellers', label: '🏆 Best Sellers' },
    ...(isIsrael ? [{ id: 'local', label: '🇮🇱 מקומי' }] : []),
    { id: 'all',         label: 'All' },
    ...GENRES.map(g => ({ id: g.id, label: g.label })),
    { id: 'search', label: '🔍 Search' },
  ]


  // If For You isn't unlocked yet and it's the active filter, switch to bestsellers
  const effectiveFilter = (!forYouUnlocked && activeFilter === 'foryou') ? 'bestsellers' : activeFilter

  const displayedBooks = getFilteredBooks()

  const forYouGenres = useMemo(() => {
    const gc = {}
    history.forEach(e => e.genres?.forEach(g => { gc[g] = (gc[g] || 0) + 1 }))
    return Object.entries(gc).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g)
  }, [history])

  return (
    <div>
      {/* Currently reading */}
      {currentBook ? (
        <div className="mb-4">
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-2">📖 Currently reading</p>
          <div className="bg-gradient-to-r from-brand-primary/8 to-blue-50 rounded-2xl p-3.5 flex gap-3 items-center border border-brand-primary/20">
            <a
              href={getBuyUrl(currentBook, isIsrael)}
              target="_blank" rel="noopener noreferrer"
              className="text-3xl flex-shrink-0 active:opacity-70"
            >
              {currentBook.emoji}
            </a>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wide text-brand-primary mb-0.5">In progress</p>
              <a
                href={getBuyUrl(currentBook, isIsrael)}
                target="_blank" rel="noopener noreferrer"
                className="text-[13px] font-bold text-text-pri hover:text-brand-primary transition-colors"
              >
                {currentBook.title} ↗
              </a>
              <p className="text-[11px] text-text-sec">{currentBook.author}</p>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button onClick={handleDone}
                className="text-[12px] font-bold px-3 py-2 rounded-xl bg-brand-accent text-white">
                ✓ Done!
              </button>
              <button onClick={() => clearCurrentBook(goal.id)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-bg-surface border border-border text-text-mut">
                ✕ Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-2xl bg-bg-surface border border-border/50 text-center">
          <p className="text-xs text-text-mut">No book in progress — pick one below 👇</p>
        </div>
      )}

      {/* Suggestions header + search */}
      <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-2">💡 What to read next</p>

      <div className="relative mb-3 flex gap-2 items-center">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title or author..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-border bg-bg-surface text-base text-text-pri placeholder:text-text-mut focus:outline-none focus:border-brand-primary"
          />
          {search.length > 0 && (
            <button
              onClick={() => { setSearch(''); setGbResults([]); setGbSearched(false) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-text-mut/20 flex items-center justify-center text-text-mut text-[11px] font-bold"
            >✕</button>
          )}
        </div>
        {/* ISBN scan button */}
        <button
          onClick={() => setShowScanner(true)}
          className="flex-shrink-0 w-10 h-10 rounded-xl border border-border bg-bg-surface flex items-center justify-center text-lg active:scale-95 transition-transform"
          title="Scan ISBN barcode"
        >📷</button>
      </div>



      {/* Genre filter pills */}
      {!search && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
          {filters.map(f => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-pill text-[11px] font-bold border transition-all
                ${activeFilter === f.id
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-bg-surface text-brand-primary border-brand-primary/20'}`}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Contextual subtitle */}
      {!search && effectiveFilter === 'foryou' && (
        <p className="text-[10px] text-brand-primary font-semibold mb-2 pl-1">✨ Based on your reading: {forYouGenres.join(', ')}</p>
      )}
      {!search && effectiveFilter === 'bestsellers' && !forYouUnlocked && (
        <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
          <span className="text-base">🔒</span>
          <p className="text-[11px] text-brand-primary font-medium">
            Log <strong>{3 - history.length} more book{3 - history.length !== 1 ? 's' : ''}</strong> to unlock personalised recommendations
          </p>
        </div>
      )}
      {!search && activeFilter === 'local' && (
        <div className="flex items-center justify-between mb-2">
          {localLoading
            ? <p className="text-[10px] text-text-mut animate-pulse">⏳ טוען רשימת רבי-מכר מסטימצקי...</p>
            : liveLocalBooks.length > 0
              ? <p className="text-[10px] text-blue-600 font-semibold">🇮🇱 רבי-המכר של סטימצקי — מתעדכן שבועית</p>
              : <p className="text-[10px] text-blue-600 font-semibold">🇮🇱 ספרים פופולריים בישראל</p>
          }
          <button
            onClick={() => {
              clearSteimatzkyCache()
              setLiveLocalBooks([])
              setLocalLoading(true)
              fetchSteimatzkyBestsellers()
                .then(books => { if (books?.length) setLiveLocalBooks(books) })
                .finally(() => setLocalLoading(false))
            }}
            className="text-[10px] text-text-mut hover:text-brand-primary transition-colors pl-2"
            title="Refresh list"
          >
            🔄
          </button>
        </div>
      )}
      {!search && activeFilter === 'bestsellers' && (
        nytLoading
          ? <p className="text-[10px] text-text-mut mb-2 pl-1 animate-pulse">⏳ Loading NYT Bestsellers list...</p>
          : nytBooks.length > 0
            ? <p className="text-[10px] text-orange-500 font-semibold mb-2 pl-1">🏆 NYT Bestsellers — updated weekly · {new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
            : <p className="text-[10px] text-orange-500 font-semibold mb-2 pl-1">🏆 All-time international bestsellers</p>
      )}

      {/* Search tab */}
      {activeFilter === 'search' ? (
        <div>
          <form onSubmit={e => { e.preventDefault(); searchGoogleBooks(gbQuery) }} className="flex gap-2 mb-3">
            <input
              type="search"
              value={gbQuery}
              onChange={e => setGbQuery(e.target.value)}
              placeholder="Search any book by title or author..."
              className="flex-1 bg-bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-pri placeholder:text-text-mut outline-none focus:border-brand-primary"
              style={{ fontSize: '16px' }}
              autoFocus
            />
            <button type="submit"
              className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold flex-shrink-0">
              {gbLoading ? '⏳' : '🔍'}
            </button>
          </form>
          <div className="max-h-[320px] overflow-y-auto">
            {gbLoading && <p className="text-sm text-text-mut text-center py-8">Searching...</p>}
            {!gbLoading && gbSearched && gbResults.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-sm text-text-mut mb-3">No results found</p>
                <button
                  onClick={() => {
                    const manualBook = { id: `manual_${Date.now()}`, title: gbQuery, author: '', desc: '', cover: null, emoji: '📚', genres: [], bestseller: false, local: false, amazonUrl: `https://www.amazon.com/s?k=${encodeURIComponent(gbQuery)}`, buyUrl: null, source: 'manual' }
                    handleStart(manualBook)
                  }}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  ✅ Log "{gbQuery}" anyway
                </button>
              </div>
            )}
            {!gbLoading && !gbSearched && (
              <p className="text-sm text-text-mut text-center py-8">🌍 Search millions of books from Google Books</p>
            )}
            {gbResults.map(book => (
              <BookCard
                key={book.id}
                book={book}
                isIsrael={isIsrael}
                onStart={() => handleStart(book)}
                onSave={() => toggleSave(book.id)}
                isSaved={savedIds.includes(book.id)}
              />
            ))}
          </div>
        </div>
      ) : (
      /* Book list */
      <div>
      <div className="max-h-[300px] overflow-y-auto">
        {displayedBooks.length === 0 ? (
          gbLoading ? (
            <p className="text-sm text-text-mut text-center py-8">🔍 Searching all books...</p>
          ) : gbResults.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-mut mb-2 px-1">
                🌍 Results from Google Books
              </p>
              {gbResults.map(book => (
                <BookCard key={book.id} book={book} isIsrael={isIsrael}
                  onStart={() => handleStart(book)}
                  onSave={() => toggleSave(book.id)}
                  isSaved={savedIds.includes(book.id)} />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              {search ? (
                <>
                  <p className="text-sm text-text-mut mb-3">No results found for "{search}"</p>
                  <div className="flex flex-col gap-2 items-center">
                    <a href={`https://www.steimatzky.co.il/catalogsearch/result/?q=${encodeURIComponent(search)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                      🔍 Search on Steimatzky
                    </a>
                    <a href={`https://www.amazon.com/s?k=${encodeURIComponent(search)}&i=stripbooks`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold px-4 py-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
                      🔍 Search on Amazon
                    </a>
                    <button
                      onClick={() => {
                        const manualBook = {
                          id: `manual_${Date.now()}`,
                          title: search,
                          author: '',
                          desc: '',
                          cover: null,
                          emoji: '📚',
                          genres: [],
                          bestseller: false, local: false,
                          amazonUrl: `https://www.amazon.com/s?k=${encodeURIComponent(search)}`,
                          buyUrl: null,
                          source: 'manual',
                        }
                        handleStart(manualBook)
                      }}
                      className="text-xs font-bold px-4 py-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                      ✅ Log "{search}" anyway
                    </button>
                  </div>
                </>
              ) : 'All caught up! Nothing left to suggest here.'}
            </div>
          )
        ) : (
          displayedBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              isIsrael={isIsrael}
              onStart={() => handleStart(book)}
              onSave={() => toggleSave(book.id)}
              isSaved={savedIds.includes(book.id)}
            />
          ))
        )}
      </div>
      </div>
      )}

      {/* Reading history */}
      {history.length > 0 && (
        <div className="border-t border-border mt-4 pt-4">
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut mb-3">
            📚 My reading history ({history.length} book{history.length !== 1 ? 's' : ''})
          </p>
          {history.map((entry, i) => (
            <div key={i} className="flex gap-3 py-2.5 border-b border-border/50 last:border-0 items-start">
              <span className="text-xl flex-shrink-0">{entry.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-text-pri">{entry.title}</p>
                <p className="text-[11px] text-text-sec">{entry.author}</p>
                {entry.note && (
                  <p className="text-[11px] text-text-mut mt-1 italic">💡 {entry.note}</p>
                )}
              </div>
              <span className="text-[10px] text-text-mut flex-shrink-0">
                {new Date(entry.completedAt).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Completion modal */}
      <AnimatePresence>
        {completingBook && (
          <BookCompleteModal
            goal={goal}
            book={completingBook}
            isIsrael={isIsrael}
            onSave={handleSaveComplete}
            onSkip={() => { clearCurrentBook(goal.id); setCompletingBook(null) }}
          />
        )}
      </AnimatePresence>

      {/* Sticky "Log anyway" bar — always visible at bottom when searching */}
      {search.trim() && (
        <div className="sticky bottom-0 pt-2 pb-1 bg-bg-base border-t border-border mt-2">
          <button
            onClick={() => handleStart({ id: `manual_${Date.now()}`, title: search, author: '', desc: '', cover: null, emoji: '📚', genres: [], bestseller: false, local: false, amazonUrl: `https://www.amazon.com/s?k=${encodeURIComponent(search)}`, buyUrl: null, source: 'manual' })}
            className="w-full py-3 text-sm font-bold text-white bg-brand-primary rounded-xl">
            ✅ Log "{search.length > 25 ? search.slice(0, 25) + '…' : search}" anyway
          </button>
        </div>
      )}

      {/* ISBN Scanner */}
      {showScanner && (
        <ISBNScanner
          onDetected={async (isbn) => {
            setShowScanner(false)
            setGbLoading(true)
            setGbSearched(true)
            try {
              const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`)
              const data = await res.json()
              if (data.items?.length) {
                const info = data.items[0].volumeInfo || {}
                const book = {
                  id: `gb_${data.items[0].id}`,
                  title: info.title || 'Unknown',
                  author: info.authors?.join(', ') || '',
                  desc: info.description?.slice(0, 180) || '',
                  cover: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
                  emoji: '📚',
                  genres: (info.categories || []).map(c => c.toLowerCase().split(' / ')[0]).slice(0, 2),
                  bestseller: false, local: false,
                  amazonUrl: `https://www.amazon.com/dp/${isbn}`,
                  buyUrl: `https://www.amazon.com/dp/${isbn}`,
                  source: 'isbn',
                }
                setGbResults([book])
                setSearch(info.title || isbn)
              } else {
                setSearch(isbn)
              }
            } catch { setSearch(isbn) }
            setGbLoading(false)
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
