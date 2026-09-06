interface ProgressBarProps {
  percent: number
  color?: string
  size?: 'sm' | 'lg'
}

export function ProgressBar({ percent, color = '#18181b', size = 'sm' }: ProgressBarProps) {
  const height = size === 'lg' ? 'h-2.5' : 'h-1.5'
  const clamped = Math.min(Math.max(percent, 0), 100)

  return (
    <div className={`w-full ${height} rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden`}>
      <div
        className={`${height} rounded-full transition-all duration-300`}
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}
