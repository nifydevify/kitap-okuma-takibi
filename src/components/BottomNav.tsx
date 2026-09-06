export type Tab = 'home' | 'monthly' | 'books' | 'settings'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Ana Sayfa', icon: '🏠' },
  { id: 'monthly', label: 'Aylık Özet', icon: '📊' },
  { id: 'books', label: 'Kitaplarım', icon: '📚' },
  { id: 'settings', label: 'Ayarlar', icon: '⚙️' },
]

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] dark:border-slate-700 dark:bg-slate-900/95"
      aria-label="Ana navigasyon"
    >
      <div className="mx-auto flex max-w-lg">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              active === tab.id
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="text-xl leading-none" aria-hidden>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
