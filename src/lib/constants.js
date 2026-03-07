export const CATEGORIES = [
  { id: 'lifestyle', label: 'Lifestyle & Sports', emoji: '🏃', color: '#43E97B', tailwind: 'category-lifestyle' },
  { id: 'kids',      label: 'Kids',               emoji: '👨‍👧', color: '#FFA94D', tailwind: 'category-kids' },
  { id: 'romance',   label: 'Romance',            emoji: '💕', color: '#FF6584', tailwind: 'category-romance' },
  { id: 'smarter',   label: 'Get Smarter',        emoji: '🧠', color: '#4DABF7', tailwind: 'category-smarter' },
  { id: 'social',    label: 'Social Connection',  emoji: '🤝', color: '#DA77F2', tailwind: 'category-social' },
  { id: 'fun',       label: 'Fun & Leisure',      emoji: '🎭', color: '#FFD43B', tailwind: 'category-fun' },
]

export const TEMPLATES = {
  lifestyle: ['🏃 Run 5km', '💧 Drink 2L water', '😴 Sleep 8hrs', '🏋️ Go to gym'],
  kids:      ['📖 Read together', '🎮 30min playtime', '🎨 Creative time'],
  romance:   ['🍽️ Date night', '💬 Send a thoughtful message', '💐 Surprise gesture'],
  smarter:   ['📚 Read 20 pages', '🎧 Listen to a podcast', '✍️ Deep work session'],
  social:    ['☕ Reach out to someone new', '📅 Plan a meetup'],
  fun:       ['🎭 Book an event', '🎨 Creative hour', '🎵 Live music'],
}

export const FREQUENCIES = [
  { id: 'daily',   label: 'Daily',   emoji: '📅' },
  { id: 'weekly',  label: 'Weekly',  emoji: '🗓️' },
  { id: 'monthly', label: 'Monthly', emoji: '📆' },
]

export const WORKDAY_PRESETS = [
  { id: 'mon-fri',  label: 'Mon – Fri',  days: [1,2,3,4,5], description: 'Standard workweek' },
  { id: 'sun-thu',  label: 'Sun – Thu',  days: [0,1,2,3,4], description: '🇮🇱 Middle East workweek' },
  { id: 'custom',   label: 'Custom',     days: [],           description: 'Pick your own days' },
]

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]

export const MILESTONE_MESSAGES = {
  3:   '3 days in. The habit is forming. 🌱',
  7:   '7 days of showing up. That\'s real. 🔥',
  14:  '2 weeks strong. You\'re building something. 💪',
  30:  '30 days! You\'re a force of nature. 🏆',
  60:  '60 days. This is who you are now. ⚡',
  100: '100 days. Legendary. 🌟',
}
