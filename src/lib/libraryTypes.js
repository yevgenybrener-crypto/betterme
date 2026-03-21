// ─── Life Library — type definitions ─────────────────────────────────────────
// Extensible system for tracking anything meaningful the user experiences.
// Each type defines: detection keywords, display config, shelf label, icon.

export const LIBRARY_TYPES = {
  book: {
    id: 'book',
    label: 'Books',
    emoji: '📚',
    color: '#6C63FF',
    bg: 'rgba(108,99,255,0.08)',
    keywords: ['book', 'read', 'reading'],
    entryLabel: 'book read',
    titleLabel: 'Title',
    subtitleLabel: 'Author',
    notePlaceholder: 'What was your biggest takeaway?',
    emptyState: 'No books logged yet',
  },
  podcast: {
    id: 'podcast',
    label: 'Podcasts',
    emoji: '🎧',
    color: '#FF6584',
    bg: 'rgba(255,101,132,0.08)',
    keywords: ['podcast', 'listen', 'audio', 'episode'],
    entryLabel: 'episode listened',
    titleLabel: 'Episode',
    subtitleLabel: 'Show',
    notePlaceholder: 'What did you take away from this episode?',
    emptyState: 'No podcasts logged yet',
  },
  course: {
    id: 'course',
    label: 'Courses',
    emoji: '🎓',
    color: '#4DABF7',
    bg: 'rgba(77,171,247,0.08)',
    keywords: ['course', 'learn', 'learning', 'class', 'study', 'udemy', 'coursera'],
    entryLabel: 'course completed',
    titleLabel: 'Course',
    subtitleLabel: 'Platform / Instructor',
    notePlaceholder: 'What skill did you gain?',
    emptyState: 'No courses logged yet',
  },
  person: {
    id: 'person',
    label: 'People Met',
    emoji: '👥',
    color: '#43E97B',
    bg: 'rgba(67,233,123,0.08)',
    keywords: ['meet', 'meeting', 'network', 'coffee', 'social', 'people', 'friend'],
    entryLabel: 'person met',
    titleLabel: 'Name',
    subtitleLabel: 'Context / Where you met',
    notePlaceholder: 'What did you talk about? What will you follow up on?',
    emptyState: 'No people logged yet',
  },
  movie: {
    id: 'movie',
    label: 'Movies & Shows',
    emoji: '🎬',
    color: '#FF8C42',
    bg: 'rgba(255,140,66,0.08)',
    keywords: ['movie', 'film', 'watch', 'series', 'show', 'netflix', 'cinema'],
    entryLabel: 'movie / show watched',
    titleLabel: 'Title',
    subtitleLabel: 'Director / Platform',
    notePlaceholder: 'What stuck with you?',
    emptyState: 'No movies logged yet',
  },
  place: {
    id: 'place',
    label: 'Places Visited',
    emoji: '✈️',
    color: '#9B59B6',
    bg: 'rgba(155,89,182,0.08)',
    keywords: ['travel', 'trip', 'visit', 'vacation', 'holiday', 'explore'],
    entryLabel: 'place visited',
    titleLabel: 'Place',
    subtitleLabel: 'Country / City',
    notePlaceholder: 'What will you remember most?',
    emptyState: 'No places logged yet',
  },
}

// Detect library type from goal name
export function getLibraryType(goal) {
  if (!goal) return null
  const name = (goal.name || '').toLowerCase()
  for (const type of Object.values(LIBRARY_TYPES)) {
    if (type.keywords.some(k => name.includes(k))) return type
  }
  return null
}
