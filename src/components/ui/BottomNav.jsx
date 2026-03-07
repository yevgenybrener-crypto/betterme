import { useStore } from '../../store/useStore'

const tabs = [
  { id: 'home',     emoji: '🏠', label: 'Home' },
  { id: 'history',  emoji: '📅', label: 'History' },
  { id: 'settings', emoji: '⚙️',  label: 'Settings' },
]

export default function BottomNav() {
  const { activeTab, setActiveTab } = useStore()
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-card border-t border-border flex z-40 pb-safe">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px]"
        >
          <span className="text-lg">{t.emoji}</span>
          <span className={`text-[11px] font-medium ${activeTab === t.id ? 'text-brand-primary font-semibold' : 'text-text-mut'}`}>
            {t.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
