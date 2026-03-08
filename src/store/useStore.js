import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Returns today's date key e.g. '2026-03-07'
export const todayKey = () => new Date().toISOString().slice(0, 10)

// Returns the week start day (0=Sun, 1=Mon) based on workday preset.
// sun-thu preset (Middle East / Israel) → week starts Sunday.
// mon-fri preset or ISO default → week starts Monday.
// Custom preset → detect from Intl.Locale, fallback to Monday.
export const getWeekStartDay = (workdayPreset) => {
  if (workdayPreset === 'sun-thu') return 0
  if (workdayPreset === 'mon-fri') return 1
  // Custom: use browser locale to detect regional week start
  try {
    const locale = new Intl.Locale(navigator.language)
    // weekInfo.firstDay: 0=Sun, 1=Mon, 6=Sat (not all browsers support this yet)
    if (locale.weekInfo?.firstDay !== undefined) return locale.weekInfo.firstDay
  } catch (_) { /* ignore */ }
  return 1 // safe fallback: ISO Monday
}

// Returns current period key for a goal.
// Weekly goals use a locale-aware week key: YYYY-Www-<startDay>
// e.g. '2026-W10-0' for a Sun-start week, '2026-W10-1' for Mon-start.
export const periodKey = (goal, workdayPreset = 'mon-fri') => {
  const now = new Date()
  if (goal.frequency === 'daily') return todayKey()
  if (goal.frequency === 'weekly') {
    const weekStart = getWeekStartDay(workdayPreset)
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    // Shift so that weekStart becomes day 0 of our numbering
    const dayOfWeek = (d.getUTCDay() - weekStart + 7) % 7
    // Rewind to the start of this week
    const weekStartDate = new Date(d)
    weekStartDate.setUTCDate(d.getUTCDate() - dayOfWeek)
    const y = weekStartDate.getUTCFullYear()
    const m = String(weekStartDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(weekStartDate.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${day}-W${weekStart}`
  }
  if (goal.frequency === 'monthly') {
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  }
  return todayKey()
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

      // Completions keyed by goalId_periodKey e.g. 'abc_2026-03-07'
      completions: {},
      isCompleted: (goal) => {
        const key = `${goal.id}_${periodKey(goal, get().workdayPreset)}`
        return !!get().completions[key]
      },
      setCompletion: (goal, value) => {
        const key = `${goal.id}_${periodKey(goal, get().workdayPreset)}`
        set((s) => ({ completions: { ...s.completions, [key]: value } }))
      },

      // Journal entries
      journalEntries: [],
      addJournalEntry: (entry) => set((s) => ({
        journalEntries: [entry, ...s.journalEntries],
      })),

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
        onboardingComplete: false, toast: null, activeTab: 'home',
      }),
    }),
    { name: 'betterme-store' }
  )
)
