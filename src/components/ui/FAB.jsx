import { useStore } from '../../store/useStore'

export default function FAB() {
  const setShowWizard = useStore((s) => s.setShowWizard)
  return (
    <button
      onClick={() => setShowWizard(true)}
      className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-brand-primary text-white text-3xl font-light shadow-fab flex items-center justify-center z-50 min-h-[44px]"
      aria-label="Add goal"
    >
      +
    </button>
  )
}
