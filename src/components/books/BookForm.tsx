import { useState } from 'react'
import type { Book } from '../../types'
import { addBook, updateBook } from '../../db/books'
import { validatePageCount } from '../../db/validation'

const COLOR_OPTIONS = [
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#65a30d',
]

interface BookFormProps {
  book?: Book
  onDone: () => void
}

export function BookForm({ book, onDone }: BookFormProps) {
  const [name, setName] = useState(book?.name ?? '')
  const [totalPages, setTotalPages] = useState(book ? String(book.totalPages || '') : '')
  const [frontMatterPages, setFrontMatterPages] = useState(book ? String(book.frontMatterPages) : '0')
  const [color, setColor] = useState(book?.color ?? COLOR_OPTIONS[0])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Kitap adı boş olamaz.')
      return
    }

    const total = Number(totalPages)
    const frontMatter = frontMatterPages === '' ? 0 : Number(frontMatterPages)

    const pageError = validatePageCount(total)
    if (pageError) {
      setError(pageError)
      return
    }
    if (!Number.isFinite(frontMatter) || frontMatter < 0) {
      setError('Ön söz sayfa sayısı 0 veya daha büyük olmalı.')
      return
    }
    if (frontMatter >= total) {
      setError('Ön söz sayfa sayısı, toplam sayfa sayısından küçük olmalı.')
      return
    }

    setSaving(true)
    try {
      if (book) {
        await updateBook(book.id, { name: name.trim(), totalPages: total, frontMatterPages: frontMatter, color })
      } else {
        await addBook({ name: name.trim(), totalPages: total, frontMatterPages: frontMatter, color })
      }
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Kitap adı</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Toplam sayfa
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Ön söz sayfası
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={frontMatterPages}
            onChange={(e) => setFrontMatterPages(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Renk</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full ring-offset-2 ${color === c ? 'ring-2 ring-slate-800 dark:ring-white' : ''}`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {book ? 'Güncelle' : 'Ekle'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
        >
          İptal
        </button>
      </div>
    </form>
  )
}
