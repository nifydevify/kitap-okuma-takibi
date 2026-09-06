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
    return <p className="text-sm text-slate-500 dark:text-slate-400">Bugün henüz kayıt yok.</p>
  }

  return (
    <ul className="space-y-2">
      {sessions.map((session) => {
        const book = books.find((b) => b.id === session.bookId)
        if (!book) return null

        return editingId === session.id ? (
          <SessionEditRow key={session.id} session={session} book={book} onDone={() => setEditingId(null)} />
        ) : (
          <li
            key={session.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: book.color }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{book.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {session.startPage} → {session.endPage} · {session.pagesRead} sayfa
                {session.startTime ? ` · ${session.startTime}${session.endTime ? `–${session.endTime}` : ''}` : ''}
              </p>
              {session.note && (
                <p className="mt-0.5 truncate text-xs italic text-slate-400 dark:text-slate-500">{session.note}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setEditingId(session.id)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
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
