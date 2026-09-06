import { useState } from 'react'
import type { BookWithComputed } from '../../types'
import { addSession } from '../../db/sessions'
import { validateSessionPages } from '../../db/validation'
import { todayDateStr } from '../../utils/date'

interface SessionFormProps {
  books: BookWithComputed[]
}

export function SessionForm({ books }: SessionFormProps) {
  // books IndexedDB'den asenkron yüklenir (ilk render'da []), bu yüzden seçim ve
  // başlangıç sayfası render sırasında books'tan türetilir; "henüz seçilmedi" durumu
  // ayrı state ile tutulmaz, bu da books geldiğinde senkron setState gerektirmez.
  const [explicitBookId, setExplicitBookId] = useState<number | null>(null)
  const [startPageOverride, setStartPageOverride] = useState<string | null>(null)
  const [endPage, setEndPage] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const bookId = explicitBookId ?? books[0]?.id ?? ''
  const selectedBook = books.find((b) => b.id === bookId)
  const startPage = startPageOverride ?? (selectedBook ? String(selectedBook.currentPage) : '')

  function handleBookChange(id: number) {
    setExplicitBookId(id)
    setStartPageOverride(null)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedBook) {
      setError('Lütfen bir kitap seç.')
      return
    }

    const start = Number(startPage)
    const end = Number(endPage)
    const validationError = validateSessionPages(selectedBook, start, end)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    try {
      await addSession({
        bookId: selectedBook.id,
        date: todayDateStr(),
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        startPage: start,
        endPage: end,
        note: note.trim() || undefined,
      })
      setEndPage('')
      setStartTime('')
      setEndTime('')
      setNote('')
      setStartPageOverride(String(end))
    } finally {
      setSaving(false)
    }
  }

  if (books.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Kayıt eklemeden önce Kitaplarım sekmesinden bir kitap ekle.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Kitap</label>
        <select
          value={bookId}
          onChange={(e) => handleBookChange(Number(e.target.value))}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Başlangıç sayfası
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={startPage}
            onChange={(e) => setStartPageOverride(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Bitiş sayfası
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={endPage}
            onChange={(e) => setEndPage(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder="ör. 50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Başlangıç saati <span className="font-normal text-slate-400">(opsiyonel)</span>
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Bitiş saati <span className="font-normal text-slate-400">(opsiyonel)</span>
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Not <span className="font-normal text-slate-400">(opsiyonel)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          placeholder="ör. Yirmi Üçüncü Söz"
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white transition-colors active:bg-indigo-700 disabled:opacity-60"
      >
        Kaydet
      </button>
    </form>
  )
}
