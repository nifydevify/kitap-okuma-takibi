import { useState } from 'react'
import type { BookWithComputed } from '../../types'
import { addSession } from '../../db/sessions'
import { validateFreeSessionCount, validateFreeSessionRange, validateSessionPages } from '../../db/validation'
import { todayDateStr } from '../../utils/date'

interface SessionFormProps {
  books: BookWithComputed[]
}

type Mode = 'book' | 'free'
type FreeEntryMode = 'range' | 'count'

export function SessionForm({ books }: SessionFormProps) {
  const [mode, setMode] = useState<Mode>(books.length > 0 ? 'book' : 'free')

  // Kitaba bağlı mod
  // books IndexedDB'den asenkron yüklenir (ilk render'da []), bu yüzden seçim ve
  // başlangıç sayfası render sırasında books'tan türetilir; "henüz seçilmedi" durumu
  // ayrı state ile tutulmaz, bu da books geldiğinde senkron setState gerektirmez.
  const [explicitBookId, setExplicitBookId] = useState<number | null>(null)
  const [startPageOverride, setStartPageOverride] = useState<string | null>(null)
  const [endPage, setEndPage] = useState('')

  // Serbest okuma modu
  const [freeEntryMode, setFreeEntryMode] = useState<FreeEntryMode>('range')
  const [freeStartPage, setFreeStartPage] = useState('')
  const [freeEndPage, setFreeEndPage] = useState('')
  const [freePageCount, setFreePageCount] = useState('')

  // Ortak alanlar
  const [date, setDate] = useState(todayDateStr())
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

  function resetCommonFields() {
    setStartTime('')
    setEndTime('')
    setNote('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'book') {
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
          date,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          startPage: start,
          endPage: end,
          note: note.trim() || undefined,
        })
        setEndPage('')
        resetCommonFields()
        setStartPageOverride(String(end))
      } finally {
        setSaving(false)
      }
      return
    }

    // Serbest okuma
    let pageCount: number
    if (freeEntryMode === 'count') {
      pageCount = Number(freePageCount)
      const validationError = validateFreeSessionCount(pageCount)
      if (validationError) {
        setError(validationError)
        return
      }
    } else {
      const start = Number(freeStartPage)
      const end = Number(freeEndPage)
      const validationError = validateFreeSessionRange(start, end)
      if (validationError) {
        setError(validationError)
        return
      }
      pageCount = end - start
    }

    setSaving(true)
    try {
      await addSession({
        date,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        pageCount,
        note: note.trim() || undefined,
      })
      setFreeStartPage('')
      setFreeEndPage('')
      setFreePageCount('')
      resetCommonFields()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-700/50">
        <button
          type="button"
          onClick={() => setMode('book')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === 'book'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          Kitaba bağlı
        </button>
        <button
          type="button"
          onClick={() => setMode('free')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === 'free'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          Serbest okuma
        </button>
      </div>

      {mode === 'book' ? (
        books.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kitaba bağlı kayıt eklemeden önce Kitaplarım sekmesinden bir kitap ekle. Bağımsız bir okuma için
            "Serbest okuma" sekmesini kullanabilirsin.
          </p>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Kitap</label>
              <select
                value={bookId}
                onChange={(e) => handleBookChange(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
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
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Başlangıç sayfası
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={startPage}
                  onChange={(e) => setStartPageOverride(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Bitiş sayfası
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={endPage}
                  onChange={(e) => setEndPage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                  placeholder="ör. 50"
                />
              </div>
            </div>
          </>
        )
      ) : (
        <>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={freeEntryMode === 'range'}
                onChange={() => setFreeEntryMode('range')}
              />
              Sayfa aralığından hesapla
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={freeEntryMode === 'count'}
                onChange={() => setFreeEntryMode('count')}
              />
              Direkt sayfa sayısı gir
            </label>
          </div>

          {freeEntryMode === 'range' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Başlangıç sayfası
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={freeStartPage}
                  onChange={(e) => setFreeStartPage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                  placeholder="ör. 21"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Bitiş sayfası
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={freeEndPage}
                  onChange={(e) => setFreeEndPage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                  placeholder="ör. 35"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Kaç sayfa okudun?
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={freePageCount}
                onChange={(e) => setFreePageCount(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                placeholder="ör. 14"
              />
            </div>
          )}
        </>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tarih</label>
        <input
          type="date"
          value={date}
          max={todayDateStr()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
        />
        {date !== todayDateStr() && (
          <button
            type="button"
            onClick={() => setDate(todayDateStr())}
            className="mt-1 text-xs font-medium text-zinc-900 dark:text-zinc-100"
          >
            Bugüne dön
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Başlangıç saati <span className="block font-normal text-zinc-400">(opsiyonel)</span>
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Bitiş saati <span className="block font-normal text-zinc-400">(opsiyonel)</span>
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Not <span className="font-normal text-zinc-400">(opsiyonel)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          placeholder={mode === 'free' ? 'ör. Falanca kitaptan' : 'ör. Yirmi Üçüncü Söz'}
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

      {!(mode === 'book' && books.length === 0) && (
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-zinc-900 py-3 text-base font-semibold text-white transition-colors active:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300 disabled:opacity-60"
        >
          Kaydet
        </button>
      )}
    </form>
  )
}
