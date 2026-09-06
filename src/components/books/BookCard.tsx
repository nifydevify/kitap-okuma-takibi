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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold text-slate-800 dark:text-slate-100">{book.name}</span>
          {hasPages && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
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
        <button type="button" onClick={onEdit} className="font-medium text-indigo-600 dark:text-indigo-400">
          Düzenle
        </button>
        <button type="button" onClick={onDelete} className="font-medium text-red-600 dark:text-red-400">
          Sil
        </button>
      </div>
    </div>
  )
}
