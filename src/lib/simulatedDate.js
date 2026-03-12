// Date simulation module — lets QA/dev override "today" across the whole app.
// All date-sensitive logic should call getSimulatedDate() instead of new Date().

let _override = null // ISO string e.g. '2026-03-15' or null

export const setSimulatedDate = (isoDate) => {
  if (!isoDate) {
    _override = null
    return
  }
  // Parse as local midnight to avoid timezone shifts
  const [y, m, d] = isoDate.split('-').map(Number)
  _override = new Date(y, m - 1, d)
}

export const getSimulatedDate = () => {
  if (_override) return new Date(_override) // return a copy so callers can't mutate it
  return new Date()
}

export const isSimulating = () => !!_override

export const getSimulatedDateISO = () => {
  const d = getSimulatedDate()
  // Use local date parts to avoid UTC timezone shift
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
