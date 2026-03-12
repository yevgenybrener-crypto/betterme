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

      // Mode B (specific days): is today's daily key completed?
      isDayCompleted: (goal) => {
        if (goal.frequency !== 'weekly' || goal.weeklyMode !== 'days') return false
        const key = `${goal.id}_${todayKey()}`
        return !!get().completions[key]
      },

      // Mode A (times): how many completions this week?
      weeklyCount: (goal) => {
        if (goal.frequency !== 'weekly') return 0
        const key = `${goal.id}_${weekPeriodKey(get().workdayPreset)}`
        return get().completions[key] || 0
      },

      // Universal: is this goal "done" for its current period?
      isCompleted: (goal) => {
        const { workdayPreset, completions } = get()
        if (goal.frequency !== 'weekly') {
          const key = `${goal.id}_${periodKey(goal, workdayPreset)}`
          return !!completions[key]
        }
        // Mode B: done = today's day is scheduled AND today is completed
        if (goal.weeklyMode === 'days') {
          if (!isTodayScheduled(goal.weeklyDays || [])) return false
          return !!completions[`${goal.id}_${todayKey()}`]
        }
        // Mode A (times) or legacy: done = count >= target
        const target = goal.weeklyTimes ?? 1
        const key = `${goal.id}_${weekPeriodKey(workdayPreset)}`
        return (completions[key] || 0) >= target
      },

      // Universal: mark completion
      setCompletion: (goal, value) => {
        const { workdayPreset } = get()
        if (goal.frequency === 'weekly') {
          if (goal.weeklyMode === 'days') {
            // Mode B: toggle today's daily key
            const key = `${goal.id}_${todayKey()}`
            set((s) => ({ completions: { ...s.completions, [key]: value } }))
          } else {
            // Mode A: increment count (or reset on value=false)
            const key = `${goal.id}_${weekPeriodKey(workdayPreset)}`
            set((s) => {
              const current = s.completions[key] || 0
              const target = goal.weeklyTimes ?? 1
              const newVal = value ? Math.min(current + 1, target) : 0
              return { completions: { ...s.completions, [key]: newVal } }
            })
          }
        } else {
          const key = `${goal.id}_${periodKey(goal, workdayPreset)}`
          set((s) => ({ completions: { ...s.completions, [key]: value } }))
        }
      },

      // Weekly intentions — per-goal per-week planning text
      weeklyIntentions: {},
      setIntention: (goal, weekKey, text) => {
        const key = `${goal.id}_${weekKey}`
        set((s) => ({
          weeklyIntentions: { ...s.weeklyIntentions, [key]: text },
        }))
      },
      getIntention: (goal, weekKey) => {
        const key = `${goal.id}_${weekKey}`
        return get().weeklyIntentions[key] || ''
      },

      // Toggle a specific day's completion (used by WeekGrid retroactive taps)
      // Does NOT update streak — streak is only updated from GoalCard live completions
      toggleDayCompletion: (goal, dateISO) => {
        const key = `${goal.id}_${dateISO}`
        set((s) => ({
          completions: {
            ...s.completions,
            [key]: !s.completions[key],
          },
        }))
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
