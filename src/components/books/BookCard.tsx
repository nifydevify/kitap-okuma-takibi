import type { BookWithComputed } from '../../types'
import { ProgressBar } from '../ui/ProgressBar'

interface BookCardProps {
  book: BookWithComputed
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}

export function BookCard({ book, onOpen, onEdit, onDelete }: BookCardProps) {
  const hasPages = book.totalPages > 0

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold text-zinc-800 dark:text-zinc-100">{book.name}</span>
          {hasPages && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {book.progressPages}/{book.effectivePages} (%{book.progressPercent.toFixed(0)})
            </span>
          )}
        </div>
        {hasPages ? (
          <ProgressBar percent={book.progressPercent} color={book.color} />
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-400">Başlangıç/bitiş sayfası girilmedi</p>
        )}
      </button>
      <div className="mt-3 flex gap-3 text-sm">
        <button type="button" onClick={onEdit} className="font-medium text-zinc-900 dark:text-zinc-100">
          Düzenle
        </button>
        <button type="button" onClick={onDelete} className="font-medium text-red-600 dark:text-red-400">
          Sil
        </button>
      </div>
    </div>
  )
}
