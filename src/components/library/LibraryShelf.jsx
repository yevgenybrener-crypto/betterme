import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LIBRARY_TYPES } from '../../lib/libraryTypes'

// ─── Entry Detail Modal ───────────────────────────────────────────────────────
function EntryModal({ entry, typeConfig, onClose }) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const text = `${typeConfig.emoji} Just finished: "${entry.title}"${entry.subtitle ? ` by ${entry.subtitle}` : ''}${entry.note ? `\n\n💡 "${entry.note}"` : ''}`
    if (navigator.share) {
      navigator.share({ title: entry.title, text }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        className="w-full bg-bg-base rounded-t-3xl p-5 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

        {/* Cover + info */}
        <div className="flex gap-4 items-start mb-5">
          {entry.cover
            ? <img src={entry.cover} alt={entry.title}
                className="w-20 h-[106px] rounded-2xl object-cover flex-shrink-0 shadow-md" />
            : <div className="w-20 h-[106px] rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-md"
                style={{ background: typeConfig.bg }}>{entry.emoji || typeConfig.emoji}</div>
          }
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: typeConfig.color }}>
              {typeConfig.emoji} {typeConfig.entryLabel}
            </p>
            <p className="text-base font-bold text-text-pri leading-snug">{entry.title}</p>
            {entry.subtitle && <p className="text-sm text-text-sec mt-1">{entry.subtitle}</p>}
            <p className="text-[11px] text-text-mut mt-2">
              📅 {new Date(entry.completedAt).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Note */}
        {entry.note ? (
          <div className="bg-bg-surface rounded-2xl p-4 border border-border mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-mut mb-2">💡 Your takeaway</p>
            <p className="text-sm text-text-sec leading-relaxed italic">"{entry.note}"</p>
          </div>
        ) : (
          <div className="rounded-2xl p-3 border border-dashed border-border mb-4 text-center">
            <p className="text-xs text-text-mut">No takeaway saved</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-3">
          {entry.buyUrl && (
            <a href={entry.buyUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-3 rounded-2xl border border-border bg-bg-surface text-sm font-semibold text-text-sec flex items-center justify-center gap-2">
              🛒 Buy / View
            </a>
          )}
          <button onClick={handleShare}
            className="flex-1 py-3 rounded-2xl border border-brand-primary/30 bg-brand-primary/8 text-sm font-semibold text-brand-primary flex items-center justify-center gap-2">
            {copied ? '✓ Copied!' : '↗ Share'}
          </button>
        </div>

        <button onClick={onClose} className="w-full py-3 text-text-mut text-sm font-semibold">Close</button>
      </motion.div>
    </motion.div>
  )
}

// ─── Single shelf for one type ────────────────────────────────────────────────
function Shelf({ typeId, entries }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const typeConfig = LIBRARY_TYPES[typeId]
  if (!typeConfig || entries.length === 0) return null

  const shown = expanded ? entries : entries.slice(0, 5)
  const thisYear = new Date().getFullYear()
  const thisYearCount = entries.filter(e => new Date(e.completedAt).getFullYear() === thisYear).length

  return (
    <div className="mb-6">
      {/* Shelf header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{typeConfig.emoji}</span>
          <div>
            <p className="text-sm font-bold text-text-pri">{typeConfig.label}</p>
            <p className="text-[10px] text-text-mut">
              {entries.length} total · {thisYearCount} this year
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {entries.slice(0, 3).map((e, i) => (
            e.cover
              ? <img key={i} src={e.cover} alt="" className="w-7 h-9 rounded object-cover -ml-1 first:ml-0 ring-1 ring-bg-base" />
              : <div key={i} className="w-7 h-9 rounded flex items-center justify-center text-sm -ml-1 first:ml-0 ring-1 ring-bg-base"
                  style={{ background: typeConfig.bg }}>{e.emoji || typeConfig.emoji}</div>
          ))}
        </div>
      </div>

      {/* Entries list */}
      <div className="space-y-2">
        {shown.map((entry, i) => (
          <button
            key={entry.id || i}
            onClick={() => setSelectedEntry(entry)}
            className="w-full flex gap-3 p-3 rounded-2xl border border-border bg-bg-card text-left active:scale-[0.99] transition-transform"
          >
            {entry.cover
              ? <img src={entry.cover} alt={entry.title} className="w-10 h-[52px] rounded-lg object-cover flex-shrink-0" />
              : <div className="w-10 h-[52px] rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: typeConfig.bg }}>{entry.emoji || typeConfig.emoji}</div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-text-pri leading-snug truncate">{entry.title}</p>
              {entry.subtitle && <p className="text-[11px] text-text-sec mt-0.5 truncate">{entry.subtitle}</p>}
              {entry.note && (
                <p className="text-[11px] text-text-mut mt-1 italic line-clamp-1">"{entry.note}"</p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-text-mut">
                {new Date(entry.completedAt).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </button>
        ))}
      </div>

      {entries.length > 5 && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 py-2.5 text-[12px] font-semibold text-brand-primary bg-brand-primary/5 rounded-xl border border-brand-primary/15">
          {expanded ? 'Show less ↑' : `Show all ${entries.length} ${typeConfig.label.toLowerCase()} ↓`}
        </button>
      )}

      <AnimatePresence>
        {selectedEntry && (
          <EntryModal
            entry={selectedEntry}
            typeConfig={typeConfig}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Full Library tab ─────────────────────────────────────────────────────────
export default function LibraryTab({ lifeLibrary = [] }) {
  const thisYear = new Date().getFullYear()

  // Group entries by type
  const byType = {}
  lifeLibrary.forEach(e => {
    if (!byType[e.type]) byType[e.type] = []
    byType[e.type].push(e)
  })

  const totalThisYear = lifeLibrary.filter(e => new Date(e.completedAt).getFullYear() === thisYear).length
  const hasAny = lifeLibrary.length > 0

  // Show types in defined order, only if they have entries
  const activeTypes = Object.keys(LIBRARY_TYPES).filter(t => byType[t]?.length > 0)
  // Coming soon = types not yet populated
  const comingSoon = Object.values(LIBRARY_TYPES).filter(t => !byType[t.id])

  return (
    <div className="px-5 pt-2">
      {/* Stats header */}
      {hasAny && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-bg-card rounded-2xl p-3 text-center border border-border">
            <p className="text-xl font-bold text-text-pri">{lifeLibrary.length}</p>
            <p className="text-[10px] text-text-mut mt-0.5">total logged</p>
          </div>
          <div className="bg-bg-card rounded-2xl p-3 text-center border border-border">
            <p className="text-xl font-bold text-text-pri">{totalThisYear}</p>
            <p className="text-[10px] text-text-mut mt-0.5">this year</p>
          </div>
          <div className="bg-bg-card rounded-2xl p-3 text-center border border-border">
            <p className="text-xl font-bold text-text-pri">{activeTypes.length}</p>
            <p className="text-[10px] text-text-mut mt-0.5">categories</p>
          </div>
        </div>
      )}

      {/* Shelves */}
      {activeTypes.map(typeId => (
        <Shelf key={typeId} typeId={typeId} entries={byType[typeId]} />
      ))}

      {/* Empty state */}
      {!hasAny && (
        <div className="text-center py-10">
          <p className="text-5xl mb-3">🗂️</p>
          <p className="text-base font-bold text-text-pri mb-1">Your Life Library</p>
          <p className="text-sm text-text-sec mb-6">Everything meaningful you read, watch, hear, and experience — all in one place.</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(LIBRARY_TYPES).map(t => (
              <div key={t.id} className="rounded-2xl p-3 text-center border border-border/50"
                style={{ background: t.bg }}>
                <p className="text-2xl mb-1">{t.emoji}</p>
                <p className="text-[10px] font-semibold text-text-sec">{t.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-mut mt-4">Complete a goal to start logging</p>
        </div>
      )}

      {/* Coming soon section */}
      {hasAny && comingSoon.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-mut mb-3">Coming soon</p>
          <div className="flex gap-2 flex-wrap">
            {comingSoon.map(t => (
              <div key={t.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 bg-bg-surface">
                <span className="text-sm">{t.emoji}</span>
                <span className="text-[11px] text-text-mut font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
