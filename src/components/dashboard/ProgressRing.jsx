export default function ProgressRing({ value, max, color, label, period }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const progress = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circ * (1 - progress)

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r={r} fill="none" stroke="#E8E7F5" strokeWidth="5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>{value}/{max}</span>
        </div>
      </div>
      <span className="text-[11px] text-text-sec font-medium text-center leading-tight">{label}</span>
    </div>
  )
}
