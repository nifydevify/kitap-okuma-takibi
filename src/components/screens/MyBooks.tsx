import { useState } from 'react'
import type { Book } from '../../types'
import { useBooks } from '../../hooks/useBooks'
import { bookHasSessions, deleteBookWithSessions } from '../../db/books'
import { Card } from '../ui/Card'
import { BookForm } from '../books/BookForm'
import { BookCard } from '../books/BookCard'

interface MyBooksProps {
  onOpenBook: (bookId: number) => void
}

export function MyBooks({ onOpenBook }: MyBooksProps) {
  const books = useBooks()
  const [formMode, setFormMode] = useState<'closed' | 'add' | number>('closed')

  async function handleDelete(book: Book) {
    const hasSessions = await bookHasSessions(book.id)
    const message = hasSessions
      ? `"${book.name}" silinirse bu kitaba ait tüm okuma kayıtları da silinecek. Devam edilsin mi?`
      : `"${book.name}" kitabını silmek istediğine emin misin?`
    if (confirm(message)) {
      await deleteBookWithSessions(book.id)
    }
  }

  const editingBook = typeof formMode === 'number' ? books.find((b) => b.id === formMode) : undefined

  return (
    <div className="space-y-4 px-6 py-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Kitaplarım</h1>
        {formMode === 'closed' && (
          <button
            type="button"
            onClick={() => setFormMode('add')}
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            + Yeni Kitap
          </button>
        )}
      </div>

      {formMode === 'add' && (
        <Card>
          <h2 className="mb-3 text-base font-semibold text-zinc-800 dark:text-zinc-100">Yeni kitap</h2>
          <BookForm onDone={() => setFormMode('closed')} />
        </Card>
      )}

      {editingBook && (
        <Card>
          <h2 className="mb-3 text-base font-semibold text-zinc-800 dark:text-zinc-100">Kitabı düzenle</h2>
          <BookForm book={editingBook} onDone={() => setFormMode('closed')} />
        </Card>
      )}

      <div className="space-y-3">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onOpen={() => onOpenBook(book.id)}
            onEdit={() => setFormMode(book.id)}
            onDelete={() => void handleDelete(book)}
          />
        ))}
      </div>
    </div>
  )
}
