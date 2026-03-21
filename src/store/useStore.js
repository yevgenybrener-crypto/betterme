import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getSimulatedDate } from '../lib/simulatedDate'

// Returns today's date key e.g. '2026-03-07' — uses LOCAL date parts to avoid UTC shift
export const todayKey = () => {
  const d = getSimulatedDate()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Returns true if dayNum (0=Sun…6=Sat) is a workday for the given preset.
// sun-thu → workdays 0-4 (Sun–Thu), weekends = Fri(5)+Sat(6)
// mon-fri → workdays 1-5 (Mon–Fri), weekends = Sat(6)+Sun(0)
export const isWorkday = (dayNum, workdayPreset) => {
  const weekStartDay = workdayPreset === 'sun-thu' ? 0 : 1
  const d = (dayNum - weekStartDay + 7) % 7
  return d < 5 // 0-4 = workday, 5-6 = weekend
}

// Returns the week start day (0=Sun, 1=Mon) based on workday preset.
export const getWeekStartDay = (workdayPreset) => {
  if (workdayPreset === 'sun-thu') return 0
  if (workdayPreset === 'mon-fri') return 1
  try {
    const locale = new Intl.Locale(navigator.language)
    if (locale.weekInfo?.firstDay !== undefined) return locale.weekInfo.firstDay
  } catch (_) { /* ignore */ }
  return 1
}

// Returns the week period key anchored to the week start day.
// Format: YYYY-MM-DD-W<startDay> where date is the week's start date.
export const weekPeriodKey = (workdayPreset = 'mon-fri') => {
  const now = getSimulatedDate()
  const weekStart = getWeekStartDay(workdayPreset)
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const dayOfWeek = (d.getUTCDay() - weekStart + 7) % 7
  const ws = new Date(d)
  ws.setUTCDate(d.getUTCDate() - dayOfWeek)
  const y = ws.getUTCFullYear()
  const m = String(ws.getUTCMonth() + 1).padStart(2, '0')
  const day = String(ws.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}-W${weekStart}`
}

// Returns current period key for a goal (legacy/daily/monthly).
export const periodKey = (goal, workdayPreset = 'mon-fri') => {
  const now = getSimulatedDate()
  if (goal.frequency === 'daily') return todayKey()
  if (goal.frequency === 'weekly') return weekPeriodKey(workdayPreset)
  if (goal.frequency === 'monthly') {
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  }
  return todayKey()
}

// Returns days remaining in the current week period.
export const daysLeftInWeek = (workdayPreset = 'mon-fri') => {
  const weekStart = getWeekStartDay(workdayPreset)
  const todayDay = getSimulatedDate().getDay()
  const dayOfWeek = (todayDay - weekStart + 7) % 7
  return 6 - dayOfWeek
}

// Returns the next scheduled day name for Mode B goals.
export const nextScheduledDay = (weeklyDays = []) => {
  if (!weeklyDays.length) return null
  const todayDay = getSimulatedDate().getDay()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const sorted = [...weeklyDays].sort((a, b) => a - b)
  const next = sorted.find(d => d > todayDay) ?? sorted[0]
  return dayNames[next]
}

// Returns whether today is a scheduled day for a Mode B goal.
export const isTodayScheduled = (weeklyDays = []) => {
  return weeklyDays.includes(getSimulatedDate().getDay())
}

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),

      // Onboarding
      onboardingComplete: false,
      workdayPreset: 'mon-fri',
      workdays: [1, 2, 3, 4, 5],
      reminderTime: '08:00',
      setOnboarding: (data) => set({ ...data, onboardingComplete: true }),

      // Goals
      goals: [],
      setGoals: (goals) => set({ goals }),
      addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
      updateGoal: (id, updates) => set((s) => ({
        goals: s.goals.map((g) => g.id === id ? { ...g, ...updates } : g),
      })),
      archiveGoal: (id) => set((s) => ({
        goals: s.goals.map((g) => g.id === id ? { ...g, archived: true } : g),
      })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      // --- Completion helpers ---

      // Get effective scheduled days for a weekly goal in a specific week.
      // Priority: weeklySchedules override → goal.weeklyDays default → []
      getEffectiveDays: (goal, weekKey) => {
        if (!goal || goal.frequency !== 'weekly') return []
        const scheduled = (get().weeklySchedules || {})[`${goal.id}_${weekKey}`]
        if (scheduled !== undefined && scheduled !== null) return scheduled
        return goal.weeklyDays || []
      },

      // Is today's per-day completion key set?
      isDayCompleted: (goal) => {
        if (goal.frequency !== 'weekly') return false
        return !!get().completions[`${goal.id}_${todayKey()}`]
      },

      // Backward compat stub — no longer needed in unified model
      isModeACompletedToday: (_goal) => false,

      // Count completed days in the current week (per-day boolean keys)
      weeklyCount: (goal) => {
        if (goal.frequency !== 'weekly') return 0
        const { workdayPreset, completions } = get()
        const weekStart = getWeekStartDay(workdayPreset)
        const today = getSimulatedDate()
        const dayOfWeek = (today.getDay() - weekStart + 7) % 7
        const ws = new Date(today)
        ws.setDate(today.getDate() - dayOfWeek)
        let count = 0
        for (let i = 0; i < 7; i++) {
          const d = new Date(ws)
          d.setDate(ws.getDate() + i)
          const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          if (completions[`${goal.id}_${iso}`]) count++
        }
        return count
      },

      // Universal: is this goal "done" for its current period?
      isCompleted: (goal) => {
        const { completions } = get()
        if (goal.frequency === 'daily') {
          return !!completions[`${goal.id}_${todayKey()}`]
        }
        if (goal.frequency === 'weekly') {
          // Done today = today's per-day key is set
          return !!completions[`${goal.id}_${todayKey()}`]
        }
        if (goal.frequency === 'monthly') {
          const now = getSimulatedDate()
          const key = `${goal.id}_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
          return !!completions[key]
        }
        return false
      },

      // Universal: mark/unmark completion — always per-day for weekly
      setCompletion: (goal, value) => {
        if (goal.frequency === 'weekly' || goal.frequency === 'daily') {
          const key = `${goal.id}_${todayKey()}`
          set((s) => ({ completions: { ...s.completions, [key]: value } }))
        } else {
          const { workdayPreset } = get()
          const key = `${goal.id}_${periodKey(goal, workdayPreset)}`
          set((s) => ({ completions: { ...s.completions, [key]: value } }))
        }
      },

      // Per-week day schedules for Mode A goals (e.g. plan Mon+Wed for "2x/week")
      // Key: goalId_weekKey → array of day numbers [0-6]
      weeklySchedules: {},
      getWeeklySchedule: (goal, weekKey) => {
        if (!goal) return []
        return (get().weeklySchedules || {})[`${goal.id}_${weekKey}`] || []
      },
      setWeeklySchedule: (goal, weekKey, days) => {
        if (!goal) return
        const key = `${goal.id}_${weekKey}`
        set((s) => ({ weeklySchedules: { ...(s.weeklySchedules || {}), [key]: days } }))
      },

      // Per-month date schedules for monthly goals
      // Key: goalId_YYYY-MM → day-of-month number (1-31) or null
      monthlySchedules: {},
      getMonthlySchedule: (goal, monthKey) => {
        if (!goal) return null
        return (get().monthlySchedules || {})[`${goal.id}_${monthKey}`] ?? null
      },
      setMonthlySchedule: (goal, monthKey, dateNum) => {
        if (!goal) return
        const key = `${goal.id}_${monthKey}`
        set((s) => ({ monthlySchedules: { ...(s.monthlySchedules || {}), [key]: dateNum } }))
      },

      // Weekly intentions — per-goal per-week planning text
      weeklyIntentions: {},
      setIntention: (goal, weekKey, text) => {
        if (!goal) return
        const key = `${goal.id}_${weekKey}`
        set((s) => ({
          weeklyIntentions: { ...(s.weeklyIntentions || {}), [key]: text },
        }))
      },
      getIntention: (goal, weekKey) => {
        if (!goal) return ''
        const key = `${goal.id}_${weekKey}`
        return (get().weeklyIntentions || {})[key] || ''
      },

      // Toggle a specific day's completion (used by WeekGrid retroactive taps)
      // Does NOT update streak — streak is only updated from GoalCard live completions
      toggleDayCompletion: (goal, dateISO) => {
        const key = `${goal.id}_${dateISO}`
        set((s) => ({
          completions: { ...s.completions, [key]: !s.completions[key] },
        }))
      },

      // Journal entries
      journalEntries: [],
      addJournalEntry: (entry) => set((s) => ({
        journalEntries: [entry, ...s.journalEntries],
      })),

      // Book reading history — per goal (legacy, kept for books)
      // readingHistory[goalId] = [{ bookId, title, author, emoji, genres, note, completedAt }]
      readingHistory: {},
      addReadingEntry: (goalId, entry) => set((s) => {
        const prev = (s.readingHistory || {})[goalId] || []
        // Also mirror into lifeLibrary for unified display
        const libEntry = {
          id: `${goalId}_${Date.now()}`,
          type: 'book',
          goalId,
          title: entry.title,
          subtitle: entry.author,
          cover: entry.cover || null,
          emoji: entry.emoji || '📚',
          note: entry.note || '',
          completedAt: entry.completedAt,
          buyUrl: entry.buyUrl || null,
          meta: { bookId: entry.bookId, genres: entry.genres },
        }
        const libPrev = (s.lifeLibrary || []); 
        return {
          readingHistory: { ...(s.readingHistory || {}), [goalId]: [entry, ...prev] },
          lifeLibrary: [libEntry, ...libPrev],
        }
      }),
      getReadingHistory: (goalId) => {
        return ((get().readingHistory || {})[goalId]) || []
      },

      // Life Library — unified store for all experience types
      // [{ id, type, goalId, title, subtitle, cover, emoji, note, completedAt, meta }]
      lifeLibrary: [],
      addLibraryEntry: (entry) => set((s) => ({
        lifeLibrary: [{ ...entry, id: `${entry.goalId}_${Date.now()}` }, ...(s.lifeLibrary || [])],
      })),
      getLibraryEntries: (type = null) => {
        const entries = get().lifeLibrary || []
        return type ? entries.filter(e => e.type === type) : entries
      },

      // Current book being read — per goal
      // currentBook[goalId] = { bookId, title, author, emoji, genres, startedAt }
      currentBook: {},
      setCurrentBook: (goalId, book) => set((s) => ({
        currentBook: { ...(s.currentBook || {}), [goalId]: book }
      })),
      clearCurrentBook: (goalId) => set((s) => {
        const next = { ...(s.currentBook || {}) }
        delete next[goalId]
        return { currentBook: next }
      }),
      getCurrentBook: (goalId) => {
        return (get().currentBook || {})[goalId] || null
      },

      // UI state
      showWizard: false,
      setShowWizard: (v) => set({ showWizard: v }),
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Toast
      toast: null,
      showToast: (toast) => set({ toast }),
      clearToast: () => set({ toast: null }),

      // Clear all user data on sign out
      clearStore: () => set({
        goals: [], completions: {}, journalEntries: [],
        weeklySchedules: {}, monthlySchedules: {}, weeklyIntentions: {},
        readingHistory: {}, currentBook: {}, lifeLibrary: [],
        onboardingComplete: false, toast: null, activeTab: 'home',
      }),
    }),
    { name: 'betterme-store' }
  )
)
