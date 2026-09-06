import { useState } from 'react'
import type { BookWithComputed, SessionWithComputed } from '../../types'
import { deleteSession } from '../../db/sessions'
import { SessionEditRow } from '../sessions/SessionEditRow'

interface TodaySessionListProps {
  sessions: SessionWithComputed[]
  books: BookWithComputed[]
}

export function TodaySessionList({ sessions, books }: TodaySessionListProps) {
  const [editingId, setEditingId] = useState<number | null>(null)

  if (sessions.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Bugün henüz kayıt yok.</p>
  }

  return (
    <ul className="space-y-2">
      {sessions.map((session) => {
        const book = session.bookId !== undefined ? books.find((b) => b.id === session.bookId) : undefined
        if (session.bookId !== undefined && !book) return null

        return editingId === session.id ? (
          <SessionEditRow key={session.id} session={session} book={book} onDone={() => setEditingId(null)} />
        ) : (
          <li
            key={session.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: book?.color ?? '#64748b' }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {book?.name ?? 'Serbest okuma'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {book
                  ? `${session.startPage} → ${session.endPage} · ${session.pagesRead} sayfa`
                  : `${session.pagesRead} sayfa`}
                {session.startTime ? ` · ${session.startTime}${session.endTime ? `–${session.endTime}` : ''}` : ''}
              </p>
              {session.note && (
                <p className="mt-0.5 truncate text-xs italic text-zinc-400 dark:text-zinc-500">{session.note}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setEditingId(session.id)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Düzenle
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bu kaydı silmek istediğine emin misin?')) {
                    void deleteSession(session.id)
                  }
                }}
                className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                Sil
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
