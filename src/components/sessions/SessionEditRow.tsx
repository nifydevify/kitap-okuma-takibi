import { useState } from 'react'
import type { BookWithComputed, SessionWithComputed } from '../../types'
import { updateSession } from '../../db/sessions'
import { validateFreeSessionCount, validateSessionPages } from '../../db/validation'
import { todayDateStr } from '../../utils/date'

interface SessionEditRowProps {
  session: SessionWithComputed
  /** undefined ise: belirli bir kitaba bağlı olmayan serbest okuma kaydı. */
  book: BookWithComputed | undefined
  onDone: () => void
  /** Tarih alanını da göster (kitap detayındaki geçmiş gibi birden çok günü kapsayan listelerde kullanılır). */
  showDate?: boolean
}

export function SessionEditRow({ session, book, onDone, showDate = false }: SessionEditRowProps) {
  const [date, setDate] = useState(session.date)
  const [startPage, setStartPage] = useState(String(session.startPage ?? ''))
  const [endPage, setEndPage] = useState(String(session.endPage ?? ''))
  const [pageCount, setPageCount] = useState(String(session.pagesRead))
  const [note, setNote] = useState(session.note ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (book) {
      const start = Number(startPage)
      const end = Number(endPage)
      const validationError = validateSessionPages(book, start, end)
      if (validationError) {
        setError(validationError)
        return
      }
      await updateSession(session.id, { date, startPage: start, endPage: end, note: note.trim() || undefined })
    } else {
      const count = Number(pageCount)
      const validationError = validateFreeSessionCount(count)
      if (validationError) {
        setError(validationError)
        return
      }
      await updateSession(session.id, {
        date,
        pageCount: count,
        startPage: undefined,
        endPage: undefined,
        note: note.trim() || undefined,
      })
    }
    onDone()
  }

  return (
    <li className="space-y-2 rounded-xl border border-amber-300/60 bg-amber-50 p-3 dark:border-amber-800/60 dark:bg-amber-950/30">
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{book?.name ?? 'Serbest okuma'}</p>
      {showDate && (
        <input
          type="date"
          value={date}
          max={todayDateStr()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
      )}
      {book ? (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={startPage}
            onChange={(e) => setStartPage(e.target.value)}
            className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
          <input
            type="number"
            value={endPage}
            onChange={(e) => setEndPage(e.target.value)}
            className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      ) : (
        <input
          type="number"
          value={pageCount}
          onChange={(e) => setPageCount(e.target.value)}
          placeholder="Kaç sayfa"
          className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
      )}
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Not"
        className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
      />
      {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-lg bg-zinc-900 py-1.5 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Kaydet
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-lg border border-zinc-300 py-1.5 text-sm font-medium text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"
        >
          İptal
        </button>
      </div>
    </li>
  )
}
