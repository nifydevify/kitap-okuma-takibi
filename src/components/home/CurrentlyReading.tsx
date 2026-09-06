import type { BookWithComputed } from '../../types'
import { ProgressBar } from '../ui/ProgressBar'

interface CurrentlyReadingProps {
  books: BookWithComputed[]
}

export function CurrentlyReading({ books }: CurrentlyReadingProps) {
  const reading = books.filter((b) => !b.isFreeform && b.progressPages > 0 && b.progressPercent < 100)

  if (reading.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Henüz okumaya başlanan kitap yok.</p>
  }

  return (
    <ul className="space-y-3">
      {reading.map((book) => (
        <li key={book.id}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">{book.name}</span>
            <span className="text-slate-500 dark:text-slate-400">
              %{book.progressPercent.toFixed(0)} · {book.progressPages}/{book.effectivePages}
            </span>
          </div>
          <ProgressBar percent={book.progressPercent} color={book.color} />
        </li>
      ))}
    </ul>
  )
}
