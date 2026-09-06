import { useState } from 'react'
import type { BookWithComputed, SessionWithComputed } from '../../types'
import { deleteSession, updateSession } from '../../db/sessions'
import { validateSessionPages } from '../../db/validation'

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
          <EditRow
            key={session.id}
            session={session}
            book={book}
            onDone={() => setEditingId(null)}
          />
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

function EditRow({
  session,
  book,
  onDone,
}: {
  session: SessionWithComputed
  book: BookWithComputed
  onDone: () => void
}) {
  const [startPage, setStartPage] = useState(String(session.startPage))
  const [endPage, setEndPage] = useState(String(session.endPage))
  const [note, setNote] = useState(session.note ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    const start = Number(startPage)
    const end = Number(endPage)
    const validationError = validateSessionPages(book, start, end)
    if (validationError) {
      setError(validationError)
      return
    }
    await updateSession(session.id, { startPage: start, endPage: end, note: note.trim() || undefined })
    onDone()
  }

  return (
    <li className="space-y-2 rounded-xl border border-indigo-300 bg-indigo-50 p-3 dark:border-indigo-700 dark:bg-indigo-950">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{book.name}</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={startPage}
          onChange={(e) => setStartPage(e.target.value)}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <input
          type="number"
          value={endPage}
          onChange={(e) => setEndPage(e.target.value)}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Not"
        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />
      {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-lg bg-indigo-600 py-1.5 text-sm font-semibold text-white"
        >
          Kaydet
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-lg border border-slate-300 py-1.5 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
        >
          İptal
        </button>
      </div>
    </li>
  )
}
