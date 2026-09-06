import type { SVGProps } from 'react'

export type Tab = 'home' | 'monthly' | 'books' | 'settings'

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5M5.25 9.5V20a1 1 0 0 0 1 1H9.5v-5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21h3.25a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10.5M10 20V4M16 20v-7M20 20H4" />
    </svg>
  )
}

function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5c-1.6-1.2-3.8-1.7-6.5-1.5v13c2.7-.2 4.9.3 6.5 1.5 1.6-1.2 3.8-1.7 6.5-1.5V5c-2.7-.2-4.9.3-6.5 1.5ZM12 6.5V19" />
    </svg>
  )
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 13.5c.1-.5.1-1 0-1.5l1.6-1.2-1.5-2.6-1.9.5a5.6 5.6 0 0 0-1.3-.75l-.3-2-2.9-.05-.35 1.95a5.6 5.6 0 0 0-1.3.75l-1.9-.5-1.5 2.6L9.9 12c-.1.5-.1 1 0 1.5l-1.6 1.2 1.5 2.6 1.9-.5c.4.3.85.55 1.3.75l.35 1.95 2.9.05.3-2c.45-.2.9-.45 1.3-.75l1.9.5 1.5-2.6-1.6-1.2Z"
      />
    </svg>
  )
}

const TABS: { id: Tab; label: string; Icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element }[] = [
  { id: 'home', label: 'Ana Sayfa', Icon: HomeIcon },
  { id: 'monthly', label: 'Aylık Özet', Icon: ChartIcon },
  { id: 'books', label: 'Kitaplarım', Icon: BookIcon },
  { id: 'settings', label: 'Ayarlar', Icon: SettingsIcon },
]

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 border-t border-zinc-200/80 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] dark:border-zinc-800 dark:bg-zinc-950/95"
      aria-label="Ana navigasyon"
    >
      <div className="mx-auto flex max-w-lg">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium tracking-wide transition-colors ${
                isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
              <span
                className={`h-1 w-1 rounded-full transition-opacity ${
                  isActive ? 'bg-amber-500 opacity-100' : 'opacity-0'
                }`}
                aria-hidden
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
