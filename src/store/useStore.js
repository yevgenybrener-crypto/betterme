import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Returns today's date key e.g. '2026-03-07'
export const todayKey = () => new Date().toISOString().slice(0, 10)

// Returns current period key for a goal
export const periodKey = (goal) => {
  const now = new Date()
  if (goal.frequency === 'daily') return todayKey()
  if (goal.frequency === 'weekly') {
    // ISO week: YYYY-Www
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    const day = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - day)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`
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
        const key = `${goal.id}_${periodKey(goal)}`
        return !!get().completions[key]
      },
      setCompletion: (goal, value) => {
        const key = `${goal.id}_${periodKey(goal)}`
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
