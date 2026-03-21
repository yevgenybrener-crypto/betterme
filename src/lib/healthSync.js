// ─── Health Sync orchestrator ─────────────────────────────────────────────────
// Runs on app foreground, syncs HealthKit data to goal completions.

import { syncHealthKitToGoals, requestHealthKitPermissions, isHealthKitAvailable } from './healthKit'
import { getSimulatedDate } from './simulatedDate'

function localISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Called once on app launch (native only)
export async function initHealthSync(store) {
  if (!isHealthKitAvailable()) return

  const { healthKitEnabled } = store.getState()
  if (!healthKitEnabled) return

  await runHealthSync(store)
}

// Run a sync pass — called on foreground or manual refresh
export async function runHealthSync(store) {
  if (!isHealthKitAvailable()) return { synced: 0, steps: null }

  const state = store.getState()
  const goals = state.goals || []
  const today = localISO(getSimulatedDate())

  const { matched, steps } = await syncHealthKitToGoals(goals)

  let synced = 0
  for (const { goalId, workout } of matched) {
    const key = `${goalId}_${today}`
    const alreadyDone = (state.completions || {})[key]
    if (!alreadyDone) {
      state.toggleDayCompletion(goalId, today, true)
      // Save workout metadata as a journal note
      const parts = []
      if (workout.duration) parts.push(`${workout.duration} min`)
      if (workout.distance) parts.push(`${workout.distance} km`)
      if (workout.calories) parts.push(`${workout.calories} kcal`)
      if (parts.length) {
        state.addJournalEntry({
          id: `hk_${goalId}_${today}`,
          goalId,
          goalName: goals.find(g => g.id === goalId)?.name || '',
          note: `🏃 Auto-synced from Apple Health: ${parts.join(' · ')}`,
          category: goals.find(g => g.id === goalId)?.category || '',
          createdAt: new Date().toISOString(),
          source: 'healthkit',
        })
      }
      synced++
    }
  }

  // Update steps counter in store if available
  if (steps !== null) {
    store.setState({ healthStepsToday: steps })
  }

  return { synced, steps }
}
