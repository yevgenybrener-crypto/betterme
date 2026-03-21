// ─── HealthKit Integration ────────────────────────────────────────────────────
// Uses @perfood/capacitor-healthkit to read workouts and activity data.
// Falls back gracefully on web (no-op).

import { Capacitor } from '@capacitor/core'

let HealthKit = null

// Lazy-load the native plugin only on iOS
async function getPlugin() {
  if (!Capacitor.isNativePlatform()) return null
  if (HealthKit) return HealthKit
  try {
    const mod = await import('@perfood/capacitor-healthkit')
    HealthKit = mod.CapacitorHealthkit
    return HealthKit
  } catch { return null }
}

export const isHealthKitAvailable = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'

// ─── Permission request ───────────────────────────────────────────────────────
export async function requestHealthKitPermissions() {
  const hk = await getPlugin()
  if (!hk) return false
  try {
    await hk.requestAuthorization({
      all: [],
      read: [
        'workouts',
        'steps',
        'distance',
        'calories',
        'heart_rate',
        'sleep_analysis',
        'mindful_session',
      ],
      write: [],
    })
    return true
  } catch (e) {
    console.warn('HealthKit permission error:', e)
    return false
  }
}

// ─── Workout type → goal keyword mapping ─────────────────────────────────────
const WORKOUT_KEYWORDS = {
  HKWorkoutActivityTypeRunning:       ['run', 'running', 'jog'],
  HKWorkoutActivityTypeWalking:       ['walk', 'walking', 'steps'],
  HKWorkoutActivityTypeCycling:       ['bike', 'cycling', 'cycle', 'bicycle'],
  HKWorkoutActivityTypeSwimming:      ['swim', 'swimming'],
  HKWorkoutActivityTypeYoga:          ['yoga'],
  HKWorkoutActivityTypeFunctionalStrengthTraining: ['gym', 'workout', 'weights', 'strength', 'lift'],
  HKWorkoutActivityTypeTraditionalStrengthTraining: ['gym', 'workout', 'weights', 'strength', 'lift'],
  HKWorkoutActivityTypeHighIntensityIntervalTraining: ['hiit', 'workout', 'gym'],
  HKWorkoutActivityTypeMindAndBody:   ['meditat', 'mindful', 'breathe'],
  HKWorkoutActivityTypeSoccer:        ['soccer', 'football'],
  HKWorkoutActivityTypeBasketball:    ['basketball'],
  HKWorkoutActivityTypeTennis:        ['tennis'],
  HKWorkoutActivityTypeOther:         ['workout', 'exercise', 'sport'],
}

// Check if a goal name matches a workout type
export function goalMatchesWorkout(goalName, workoutType) {
  const name = (goalName || '').toLowerCase()
  const keywords = WORKOUT_KEYWORDS[workoutType] || []
  return keywords.some(k => name.includes(k))
}

// ─── Fetch today's workouts ───────────────────────────────────────────────────
export async function getTodayWorkouts() {
  const hk = await getPlugin()
  if (!hk) return []

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  try {
    const result = await hk.queryWorkouts({
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString(),
      limit: 20,
    })
    return result?.workouts || []
  } catch (e) {
    console.warn('HealthKit workout query error:', e)
    return []
  }
}

// ─── Fetch today's steps ──────────────────────────────────────────────────────
export async function getTodaySteps() {
  const hk = await getPlugin()
  if (!hk) return null

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  try {
    const result = await hk.queryHKitSampleType({
      sampleName: 'steps',
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString(),
      limit: 0,
    })
    const total = (result?.resultData || []).reduce((s, r) => s + (r.quantity || 0), 0)
    return Math.round(total)
  } catch (e) {
    console.warn('HealthKit steps query error:', e)
    return null
  }
}

// ─── Main sync: returns matched goal IDs + workout details ───────────────────
export async function syncHealthKitToGoals(goals = []) {
  if (!isHealthKitAvailable()) return { matched: [], workouts: [], steps: null }

  const [workouts, steps] = await Promise.all([getTodayWorkouts(), getTodaySteps()])

  const matched = []
  for (const goal of goals) {
    if (goal.frequency !== 'daily' && goal.frequency !== 'weekly') continue
    for (const workout of workouts) {
      if (goalMatchesWorkout(goal.name, workout.workoutActivityType)) {
        matched.push({
          goalId: goal.id,
          goalName: goal.name,
          workout: {
            type: workout.workoutActivityType,
            duration: Math.round((workout.duration || 0) / 60), // minutes
            distance: workout.totalDistance ? Math.round(workout.totalDistance * 10) / 10 : null,
            calories: workout.totalEnergyBurned ? Math.round(workout.totalEnergyBurned) : null,
            startDate: workout.startDate,
          },
        })
        break // one match per goal
      }
    }
  }

  return { matched, workouts, steps }
}
