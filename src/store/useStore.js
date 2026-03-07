import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

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

      // Completions (today's)
      completions: {},
      setCompletion: (goalId, value) => set((s) => ({
        completions: { ...s.completions, [goalId]: value },
      })),

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
    }),
    { name: 'betterme-store' }
  )
)
