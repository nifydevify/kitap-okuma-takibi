import type { BookWithComputed } from '../../types'
import { ProgressBar } from '../ui/ProgressBar'

interface CurrentlyReadingProps {
  books: BookWithComputed[]
}

export function CurrentlyReading({ books }: CurrentlyReadingProps) {
  const reading = books.filter((b) => b.progressPages > 0 && b.progressPercent < 100)

  if (reading.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Henüz okumaya başlanan kitap yok.</p>
  }

  return (
    <ul className="space-y-3">
      {reading.map((book) => (
        <li key={book.id}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">{book.name}</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              %{book.progressPercent.toFixed(0)} · {book.progressPages}/{book.effectivePages}
            </span>
          </div>
          <ProgressBar percent={book.progressPercent} color={book.color} />
        </li>
      ))}
    </ul>
  )
}
