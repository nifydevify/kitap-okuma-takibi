interface ProgressBarProps {
  percent: number
  color?: string
  size?: 'sm' | 'lg'
}

export function ProgressBar({ percent, color = '#4f46e5', size = 'sm' }: ProgressBarProps) {
  const height = size === 'lg' ? 'h-3' : 'h-2'
  const clamped = Math.min(Math.max(percent, 0), 100)

  return (
    <div className={`w-full ${height} rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden`}>
      <div
        className={`${height} rounded-full transition-all duration-300`}
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}
