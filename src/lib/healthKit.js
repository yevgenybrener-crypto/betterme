// ─── HealthKit Integration ────────────────────────────────────────────────────
// Uses capacitor-health (supports Capacitor 8, iOS + Android Health Connect)
// Falls back gracefully on web (no-op).

import { Capacitor } from '@capacitor/core'

let Health = null

async function getPlugin() {
  if (!Capacitor.isNativePlatform()) return null
  if (Health) return Health
  try {
    const mod = await import('capacitor-health')
    Health = mod.Health
    return Health
  } catch { return null }
}

export const isHealthKitAvailable = () => Capacitor.isNativePlatform()
export const isIOS = () => Capacitor.getPlatform() === 'ios'

// ─── Permission request ───────────────────────────────────────────────────────
export async function requestHealthKitPermissions() {
  const hk = await getPlugin()
  if (!hk) return false
  try {
    const available = await hk.isHealthAvailable()
    if (!available.available) return false
    await hk.requestHealthPermissions({
      permissions: [
        'READ_WORKOUTS',
        'READ_STEPS',
        'READ_DISTANCE',
        'READ_ACTIVE_CALORIES',
        'READ_HEART_RATE',
        'READ_MINDFULNESS',
      ],
    })
    return true
  } catch (e) {
    console.warn('Health permission error:', e)
    return false
  }
}

// ─── Workout type → goal keyword mapping ─────────────────────────────────────
const WORKOUT_KEYWORDS = {
  RUNNING:          ['run', 'running', 'jog'],
  WALKING:          ['walk', 'walking', 'steps'],
  CYCLING:          ['bike', 'cycling', 'cycle', 'bicycle'],
  SWIMMING:         ['swim', 'swimming'],
  YOGA:             ['yoga'],
  FUNCTIONAL_STRENGTH_TRAINING: ['gym', 'workout', 'weights', 'strength', 'lift'],
  TRADITIONAL_STRENGTH_TRAINING: ['gym', 'workout', 'weights', 'strength', 'lift'],
  HIGH_INTENSITY_INTERVAL_TRAINING: ['hiit', 'workout', 'gym'],
  MIND_AND_BODY:    ['meditat', 'mindful', 'breathe'],
  SOCCER:           ['soccer', 'football'],
  BASKETBALL:       ['basketball'],
  TENNIS:           ['tennis'],
  OTHER:            ['workout', 'exercise', 'sport', 'training'],
}

export function goalMatchesWorkout(goalName, workoutType) {
  const name = (goalName || '').toLowerCase()
  const keywords = WORKOUT_KEYWORDS[workoutType] ||
    WORKOUT_KEYWORDS[workoutType?.replace('HKWorkoutActivityType', '').toUpperCase()] || []
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
    })
    return result?.workouts || []
  } catch (e) {
    console.warn('Health workout query error:', e)
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
    const result = await hk.queryAggregated({
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString(),
      dataType: 'STEPS',
      bucket: 'DAY',
    })
    return result?.aggregatedData?.[0]?.value ?? null
  } catch (e) {
    console.warn('Health steps query error:', e)
    return null
  }
}

// ─── Main sync ────────────────────────────────────────────────────────────────
export async function syncHealthKitToGoals(goals = []) {
  if (!isHealthKitAvailable()) return { matched: [], workouts: [], steps: null }

  const [workouts, steps] = await Promise.all([getTodayWorkouts(), getTodaySteps()])

  const matched = []
  for (const goal of goals) {
    for (const workout of workouts) {
      const wType = workout.workoutType || workout.type || ''
      if (goalMatchesWorkout(goal.name, wType)) {
        matched.push({
          goalId: goal.id,
          goalName: goal.name,
          workout: {
            type: wType,
            duration: workout.duration ? Math.round(workout.duration / 60) : null,
            distance: workout.distance ? Math.round(workout.distance * 10) / 10 : null,
            calories: workout.calories ? Math.round(workout.calories) : null,
            startDate: workout.startDate,
          },
        })
        break
      }
    }
  }

  return { matched, workouts, steps }
}
