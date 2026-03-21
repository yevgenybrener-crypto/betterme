// ─── Spotify API client ───────────────────────────────────────────────────────
import { refreshAccessToken } from './spotifyAuth'

async function getValidToken(store) {
  const { spotifyAccessToken, spotifyRefreshToken, spotifyTokenExpiry, setSpotifyTokens } = store.getState()
  if (!spotifyAccessToken) return null

  if (Date.now() > spotifyTokenExpiry - 60_000) {
    try {
      const tokens = await refreshAccessToken(spotifyRefreshToken)
      setSpotifyTokens(tokens)
      return tokens.accessToken
    } catch { return null }
  }
  return spotifyAccessToken
}

async function spotifyFetch(path, store) {
  const token = await getValidToken(store)
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('Token expired')
  if (!res.ok) throw new Error(`Spotify error ${res.status}`)
  return res.json()
}

// ─── Get user's saved/followed podcast shows ──────────────────────────────────
export async function getFollowedShows(store) {
  const data = await spotifyFetch('/me/shows?limit=50', store)
  return (data.items || []).map(item => ({
    id: item.show.id,
    name: item.show.name,
    publisher: item.show.publisher,
    description: item.show.description?.slice(0, 120),
    image: item.show.images?.[1]?.url || item.show.images?.[0]?.url,
    totalEpisodes: item.show.total_episodes,
    spotifyUrl: item.show.external_urls?.spotify,
  }))
}

// ─── Get recently played (includes podcast episodes) ─────────────────────────
export async function getRecentlyPlayedEpisodes(store) {
  const data = await spotifyFetch('/me/player/recently-played?limit=20&type=episode', store)
  const episodes = (data.items || [])
    .filter(item => item.track?.type === 'episode' || item.episode)
    .map(item => {
      const ep = item.episode || item.track
      return {
        id: ep.id,
        episodeName: ep.name,
        showName: ep.show?.name || '',
        showImage: ep.show?.images?.[1]?.url || ep.show?.images?.[0]?.url,
        duration: Math.round((ep.duration_ms || 0) / 60000),
        playedAt: item.played_at,
        description: ep.description?.slice(0, 120),
        spotifyUrl: ep.external_urls?.spotify,
      }
    })

  // Deduplicate by show name (keep most recent per show)
  const seen = new Set()
  return episodes.filter(e => {
    if (seen.has(e.showName)) return false
    seen.add(e.showName)
    return true
  })
}

// ─── Get latest episode per followed show ────────────────────────────────────
export async function getNewEpisodes(shows, store) {
  // Fetch latest episode for each show in parallel (max 15 shows)
  const batch = shows.slice(0, 15)
  const results = await Promise.allSettled(
    batch.map(show =>
      spotifyFetch(`/shows/${show.id}/episodes?limit=1&market=IL`, store)
        .then(data => {
          const ep = data.items?.[0]
          if (!ep) return null
          return {
            id: ep.id,
            episodeName: ep.name,
            showName: show.name,
            showId: show.id,
            showImage: show.image,
            duration: Math.round((ep.duration_ms || 0) / 60000),
            releaseDate: ep.release_date,
            description: ep.description?.slice(0, 120),
            spotifyUrl: ep.external_urls?.spotify,
            spotifyUri: ep.uri,
          }
        })
    )
  )
  return results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value)
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
}

// ─── Search podcasts ──────────────────────────────────────────────────────────
export async function searchPodcasts(query, store) {
  const data = await spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=show&limit=10&market=IL`,
    store
  )
  return (data.shows?.items || []).map(show => ({
    id: show.id,
    name: show.name,
    publisher: show.publisher,
    description: show.description?.slice(0, 120),
    image: show.images?.[1]?.url || show.images?.[0]?.url,
    totalEpisodes: show.total_episodes,
    spotifyUrl: show.external_urls?.spotify,
  }))
}
