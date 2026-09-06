import { useState } from 'react'
import { useBook } from '../../hooks/useBooks'
import { useSessionsForBook } from '../../hooks/useSessions'
import { setBookCurrentPage } from '../../db/books'
import { deleteSession } from '../../db/sessions'
import { dateStrLabel } from '../../utils/date'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { BookForm } from '../books/BookForm'
import { SessionEditRow } from '../sessions/SessionEditRow'

interface BookDetailProps {
  bookId: number
  onBack: () => void
}

export function BookDetail({ bookId, onBack }: BookDetailProps) {
  const book = useBook(bookId)
  const sessions = useSessionsForBook(bookId)
  const [editingCurrentPage, setEditingCurrentPage] = useState(false)
  const [currentPageInput, setCurrentPageInput] = useState('')
  const [editingBook, setEditingBook] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null)

  if (!book) {
    return (
      <div className="p-4">
        <button type="button" onClick={onBack} className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          ← Geri
        </button>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Kitap bulunamadı.</p>
      </div>
    )
  }

  async function handleSaveCurrentPage() {
    const value = Number(currentPageInput)
    if (Number.isFinite(value) && value > 0) {
      await setBookCurrentPage(bookId, value)
    }
    setEditingCurrentPage(false)
  }

  return (
    <div className="space-y-4 p-4">
      <button type="button" onClick={onBack} className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
        ← Geri
      </button>

      {editingBook ? (
        <Card>
          <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Kitap bilgilerini düzenle</h2>
          <BookForm book={book} onDone={() => setEditingBook(false)} />
        </Card>
      ) : (
        <Card>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: book.color }} />
              <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{book.name}</h1>
            </div>
            <button
              type="button"
              onClick={() => setEditingBook(true)}
              className="shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400"
            >
              Düzenle
            </button>
          </div>

          {book.totalPages > 0 ? (
            <>
              <ProgressBar percent={book.progressPercent} color={book.color} size="lg" />
              <div className="mt-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>
                  {book.progressPages}/{book.effectivePages} sayfa (%{book.progressPercent.toFixed(1)})
                </span>
                <span>{book.remainingPages} sayfa kaldı</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-amber-600 dark:text-amber-400">Başlangıç/bitiş sayfası girilmedi.</p>
              <button
                type="button"
                onClick={() => setEditingBook(true)}
                className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Şimdi gir
              </button>
            </div>
          )}

          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
            {editingCurrentPage ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  autoFocus
                  defaultValue={book.currentPage}
                  onChange={(e) => setCurrentPageInput(e.target.value)}
                  className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleSaveCurrentPage}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCurrentPage(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
                >
                  İptal
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  Şu anki sayfa: <strong>{book.currentPage}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPageInput(String(book.currentPage))
                    setEditingCurrentPage(true)
                  }}
                  className="font-medium text-indigo-600 dark:text-indigo-400"
                >
                  Düzelt
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Okuma geçmişi</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Bu kitap için henüz kayıt yok.</p>
        ) : (
          <ul className="space-y-2 divide-y divide-slate-100 dark:divide-slate-700">
            {sessions.map((session) =>
              editingSessionId === session.id ? (
                <SessionEditRow
                  key={session.id}
                  session={session}
                  book={book}
                  showDate
                  onDone={() => setEditingSessionId(null)}
                />
              ) : (
                <li key={session.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="text-slate-700 dark:text-slate-200">
                      {dateStrLabel(session.date)}
                      {session.startTime ? ` · ${session.startTime}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {session.startPage} → {session.endPage} · {session.pagesRead} sayfa
                    </p>
                    {session.note && (
                      <p className="truncate text-xs italic text-slate-400 dark:text-slate-500">{session.note}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSessionId(session.id)}
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400"
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
                      className="text-xs font-medium text-red-600 dark:text-red-400"
                    >
                      Sil
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </Card>
    </div>
  )
}
