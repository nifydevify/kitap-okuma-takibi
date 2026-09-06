import { useState } from 'react'
import type { BookWithComputed, SessionWithComputed } from '../../types'
import { updateSession } from '../../db/sessions'
import { validateSessionPages } from '../../db/validation'
import { todayDateStr } from '../../utils/date'

interface SessionEditRowProps {
  session: SessionWithComputed
  book: BookWithComputed
  onDone: () => void
  /** Tarih alanını da göster (kitap detayındaki geçmiş gibi birden çok günü kapsayan listelerde kullanılır). */
  showDate?: boolean
}

export function SessionEditRow({ session, book, onDone, showDate = false }: SessionEditRowProps) {
  const [date, setDate] = useState(session.date)
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
    await updateSession(session.id, { date, startPage: start, endPage: end, note: note.trim() || undefined })
    onDone()
  }

  return (
    <li className="space-y-2 rounded-xl border border-indigo-300 bg-indigo-50 p-3 dark:border-indigo-700 dark:bg-indigo-950">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{book.name}</p>
      {showDate && (
        <input
          type="date"
          value={date}
          max={todayDateStr()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      )}
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
