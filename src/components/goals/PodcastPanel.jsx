import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { startSpotifyAuth } from '../../lib/spotifyAuth'
import { getFollowedShows, getRecentlyPlayedEpisodes, searchPodcasts } from '../../lib/spotifyApi'

// ─── Log episode modal ────────────────────────────────────────────────────────
function LogEpisodeModal({ episode, onSave, onSkip }) {
  const [note, setNote] = useState('')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={onSkip}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        className="w-full bg-bg-base rounded-t-3xl p-5 pb-8 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
        <div className="flex gap-4 items-start mb-5">
          {episode.showImage
            ? <img src={episode.showImage} alt={episode.showName}
                className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-md" />
            : <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-3xl flex-shrink-0">🎧</div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">{episode.showName}</p>
            <p className="text-sm font-bold text-text-pri leading-snug">{episode.episodeName || episode.name}</p>
            {episode.duration > 0 && <p className="text-[11px] text-text-mut mt-1">{episode.duration} min</p>}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-mut mb-2">💡 Key takeaway</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What's the most useful thing you learned?"
            className="w-full h-24 rounded-2xl border border-border bg-bg-surface px-4 py-3 text-sm text-text-pri placeholder:text-text-mut resize-none focus:outline-none focus:border-brand-primary"
            style={{ fontSize: '16px' }}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onSkip}
            className="flex-1 py-3.5 rounded-2xl border border-border text-text-sec font-semibold text-sm">
            Skip
          </button>
          <button onClick={() => onSave(note)}
            className="flex-1 py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-sm">
            Log episode ✓
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Show card ────────────────────────────────────────────────────────────────
function ShowCard({ show, onLog }) {
  return (
    <div className="flex gap-3 items-center py-2.5 border-b border-border/40 last:border-0">
      {show.image
        ? <img src={show.image} alt={show.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
        : <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-lg flex-shrink-0">🎧</div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-text-pri leading-snug truncate">{show.name}</p>
        <p className="text-[10px] text-text-mut truncate">{show.publisher}</p>
      </div>
      <button onClick={() => onLog(show)}
        className="flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-green-50 text-green-700 border border-green-200">
        + Log
      </button>
    </div>
  )
}

// ─── Episode card (recently played) ─────────────────────────────────────────
function EpisodeCard({ episode, onLog }) {
  return (
    <button onClick={() => onLog(episode)}
      className="w-full flex gap-3 items-start py-2.5 border-b border-border/40 last:border-0 text-left active:bg-bg-surface rounded-xl transition-colors">
      {episode.showImage
        ? <img src={episode.showImage} alt={episode.showName} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 mt-0.5" />
        : <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">🎧</div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-green-600 mb-0.5 truncate">{episode.showName}</p>
        <p className="text-[12px] font-semibold text-text-pri leading-snug line-clamp-2">{episode.episodeName}</p>
        <p className="text-[10px] text-text-mut mt-0.5">{episode.duration} min · tap to log</p>
      </div>
    </button>
  )
}

// ─── Main PodcastPanel ────────────────────────────────────────────────────────
export default function PodcastPanel({ goal }) {
  const store = useStore
  const { spotifyConnected, spotifyAccessToken } = useStore()
  const { addJournalEntry } = useStore()

  const [recentEpisodes, setRecentEpisodes] = useState([])
  const [followedShows, setFollowedShows] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggingEpisode, setLoggingEpisode] = useState(null)
  const [tab, setTab] = useState('recent') // recent | following | search
  const searchTimer = useRef(null)

  useEffect(() => {
    if (!spotifyConnected || !spotifyAccessToken) return
    setLoading(true)
    Promise.all([
      getRecentlyPlayedEpisodes(store).catch(() => []),
      getFollowedShows(store).catch(() => []),
    ]).then(([episodes, shows]) => {
      setRecentEpisodes(episodes)
      setFollowedShows(shows)
    }).finally(() => setLoading(false))
  }, [spotifyConnected, spotifyAccessToken])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      const results = await searchPodcasts(searchQuery, store).catch(() => [])
      setSearchResults(results)
    }, 500)
  }, [searchQuery])

  function handleLog(item) {
    setLoggingEpisode(item)
  }

  function handleSaveLog(note) {
    const ep = loggingEpisode
    const entry = {
      id: `podcast_${Date.now()}`,
      goalId: goal.id,
      goalName: goal.name,
      note: note || '',
      category: goal.category || 'growth',
      createdAt: new Date().toISOString(),
      podcastShow: ep.showName || ep.name || ep.publisher,
      podcastEpisode: ep.episodeName || ep.name || '',
      podcastImage: ep.showImage || ep.image,
      podcastUrl: ep.spotifyUrl,
      type: 'podcast',
    }
    addJournalEntry(entry)
    setLoggingEpisode(null)
  }

  // ── Not connected ──
  if (!spotifyConnected) {
    return (
      <div className="mt-4 rounded-2xl border border-border p-5 text-center bg-bg-surface">
        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3">🎧</div>
        <p className="font-bold text-text-pri mb-1">Connect Spotify</p>
        <p className="text-xs text-text-sec mb-4 leading-relaxed">
          See what you've been listening to and log podcast episodes with key takeaways
        </p>
        <button onClick={startSpotifyAuth}
          className="w-full py-3 rounded-2xl bg-green-500 text-white font-bold text-sm flex items-center justify-center gap-2">
          <span>Connect Spotify</span>
        </button>
        <p className="text-[10px] text-text-mut mt-2">We only read your listening history — never modify anything</p>
      </div>
    )
  }

  // ── Connected ──
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-mut">🎧 Podcasts</p>
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
          ● Spotify connected
        </span>
      </div>

      {/* Tab pills */}
      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
        {[
          { id: 'recent', label: '▶ Recently played' },
          { id: 'following', label: '🎙 My shows' },
          { id: 'search', label: '🔍 Discover' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-pill text-[11px] font-bold border transition-all ${
              tab === t.id ? 'bg-green-500 text-white border-green-500' : 'bg-bg-surface text-text-sec border-border'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-text-mut text-center py-6">Loading from Spotify...</p>}

      {!loading && tab === 'recent' && (
        <div>
          {recentEpisodes.length === 0
            ? <p className="text-sm text-text-mut text-center py-6">No recent podcast episodes found</p>
            : recentEpisodes.map(ep => <EpisodeCard key={ep.id} episode={ep} onLog={handleLog} />)
          }
        </div>
      )}

      {!loading && tab === 'following' && (
        <div className="max-h-[300px] overflow-y-auto">
          {followedShows.length === 0
            ? <p className="text-sm text-text-mut text-center py-6">No followed shows found</p>
            : followedShows.map(show => <ShowCard key={show.id} show={show} onLog={handleLog} />)
          }
        </div>
      )}

      {tab === 'search' && (
        <div>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search any podcast..."
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-surface text-sm text-text-pri placeholder:text-text-mut focus:outline-none focus:border-green-500 mb-3"
            style={{ fontSize: '16px' }}
          />
          <div className="max-h-[300px] overflow-y-auto">
            {searchResults.map(show => <ShowCard key={show.id} show={show} onLog={handleLog} />)}
            {searchQuery && searchResults.length === 0 && (
              <p className="text-sm text-text-mut text-center py-6">No results</p>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {loggingEpisode && (
          <LogEpisodeModal
            episode={loggingEpisode}
            onSave={handleSaveLog}
            onSkip={() => setLoggingEpisode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
